import DomPurify from "dompurify";

export interface ParseResult {
  content: string;
  textContent: string;
  length: number;
  title: string;
  excerpt: string | null;
  byline: string | null;
  siteName: string | null;
  publishedTime: string | null;
}

/**
 * Helper to safely resolve any image URL against the document's base URI
 */
function resolveImageUrl(url: string, baseURI: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  try {
    // This correctly handles relative ('/foo'), protocol-relative ('//foo'),
    // and absolute ('https://foo') URLs
    return new URL(cleanUrl, baseURI).href;
  } catch (e) {
    return null; // Invalid URL structure
  }
}

/**
 * Calculates the ratio of link text to total text within a DOM node.
 * Returns a number between 0.0 (no links) and 1.0 (entirely links).
 */
function getLinkDensity(element: Element): number {
  const textLength = element.textContent?.trim().length || 0;
  if (textLength === 0) return 0;

  let linkLength = 0;
  element.querySelectorAll("a").forEach((link) => {
    linkLength += link.textContent?.trim().length || 0;
  });

  return linkLength / textLength;
}

export function parseDocument(doc: Document): ParseResult {
  // ==========================================
  // STEP 1: EXTRACT METADATA
  // ==========================================
  const title =
    doc.title ||
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    "";
  const excerpt =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    doc
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") ||
    null;
  const byline =
    doc.querySelector('meta[name="author"]')?.getAttribute("content") || null;
  const siteName =
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") || null;
  const publishedTime =
    doc
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content") || null;

  // ==========================================
  // STEP 2: BULLETPROOF IMAGE NORMALIZATION
  // ==========================================
  doc.querySelectorAll("img").forEach((img) => {
    // 1. Check lazy-load attributes first, fallback to standard src
    let bestSrc =
      img.getAttribute("data-src") ||
      img.getAttribute("data-lazy-src") ||
      img.getAttribute("src") ||
      "";

    // 2. If srcset exists (common on Wikipedia), extract the highest resolution URL
    const srcset = img.getAttribute("srcset");
    if (srcset) {
      // srcset format: "url1 1x, url2 2x, url3 1000w"
      // We split by comma, grab the first chunk, and then grab the URL part
      const firstSrc = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (firstSrc) {
        // We prefer the srcset URL over a potentially low-res `src` placeholder
        bestSrc = firstSrc;
      }
    }

    // 3. Resolve the URL against the baseURI (handles //, /, and relative paths)
    const absoluteUrl = resolveImageUrl(bestSrc, doc.baseURI);

    if (absoluteUrl) {
      // Set the resolved, absolute URL as the single source of truth
      img.setAttribute("src", absoluteUrl);

      // Strip out responsive/lazy attributes so DOMPurify doesn't get confused
      // or try to load broken relative paths later.
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.removeAttribute("data-src");
      img.removeAttribute("data-lazy-src");
      img.removeAttribute("loading");
    } else {
      // If we completely failed to find a valid image source, remove the img tag
      // so we don't end up with broken image icons in our markdown.
      img.remove();
    }
  });

  // ==========================================
  // STEP 3: AGGRESSIVE JUNK PRUNING
  // ==========================================
  const junkSelectors = [
    "nav",
    "footer",
    "header",
    "aside",
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "form",
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    '[role="dialog"]',
    ".ad",
    ".advertisement",
    ".social-share",
    ".comments",
    "#comments",
    ".sidebar",
    ".newsletter",
    ".subscribe",
    ".related-posts",
    ".author-bio",
    ".tags",
    ".share",
    ".mw-editsection",
    ".reference",
    ".noprint",
    ".infobox",
    ".navbox",
  ];
  doc.querySelectorAll(junkSelectors.join(", ")).forEach((el) => el.remove());

  const unlikelyRegex =
    /share|social|promo|newsletter|subscribe|related|sponsor|tags|author|comments|disqus|cookie|popup|modal|outbrain|taboola|advert/i;
  const likelyRegex = /article|body|content|main|page|post|text|blog|wiki/i;

  doc.querySelectorAll("div, section, ul, li, p").forEach((el) => {
    // 1. Regex Pruning
    const className = el.getAttribute("class") || "";
    const id = el.getAttribute("id") || "";
    const matchString = `${className} ${id}`;

    if (unlikelyRegex.test(matchString) && !likelyRegex.test(matchString)) {
      el.remove();
      return; // Stop processing this node since it's gone
    }

    // 2. STRUCTURAL HEURISTIC PRUNING (The "Link Farm" Killer)
    // We target containers that often hold lists of links.
    if (["UL", "OL", "DIV", "SECTION"].includes(el.tagName)) {
      // If the container is heavily linked, it is almost certainly navigation
      // or "Related Articles". A density > 0.6 means 60% of the words are links.
      const density = getLinkDensity(el);

      // We don't want to accidentally delete short blocks (like a 2-word author byline
      // that is fully hyperlinked), so we only apply this rule to blocks with some substance.
      const charCount = el.textContent?.trim().length || 0;

      if (density > 0.6 && charCount > 30) {
        el.remove();
      }
    }
  });

  // ==========================================
  // STEP 4: LOCATE MAIN CONTENT
  // ==========================================
  let mainContentHtml = "";

  const semanticContainers = Array.from(
    doc.querySelectorAll(
      'article, main, [role="main"], .markdown-body, .post-content, #bodyContent',
    ),
  ).sort((a, b) => (b.textContent?.length || 0) - (a.textContent?.length || 0));

  if (semanticContainers.length > 0) {
    mainContentHtml = semanticContainers[0].innerHTML;
  } else {
    // Improved Heuristic Fallback
    let bestNode = doc.body;
    let maxScore = 0;

    doc.querySelectorAll("div, section").forEach((candidate) => {
      // We score based on paragraphs and code blocks, but we PENALIZE high link density!
      const paragraphs = candidate.querySelectorAll("p, pre, code, li").length;
      const density = getLinkDensity(candidate);

      // A container filled with paragraphs but a density of 0.9 is a list of links, not an article.
      // So we multiply the paragraph count by the inverted density (1 - 0.9 = 0.1).
      const score = paragraphs * (1 - density);

      if (score > maxScore) {
        maxScore = score;
        bestNode = candidate as HTMLElement;
      }
    });
    mainContentHtml = bestNode.innerHTML;
  }

  // ==========================================
  // STEP 5: ENFORCE MARKDOWN EQUIVALENCY
  // ==========================================
  const markdownEquivalentTags = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "em",
    "strong",
    "i",
    "b",
    "del",
    "a",
    "img",
    "hr",
    "br",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ];

  const sanitizedContent = DomPurify.sanitize(mainContentHtml, {
    ALLOWED_TAGS: markdownEquivalentTags,
    ALLOWED_ATTR: ["href", "src", "alt", "title"],
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitizedContent;
  const textContent = tempDiv.textContent || "";

  return {
    content: sanitizedContent,
    textContent: textContent,
    length: textContent.length,
    title,
    excerpt,
    byline,
    siteName,
    publishedTime,
  };
}
