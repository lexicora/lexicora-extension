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

// A quick conceptual look at the future architecture
// function parsePage(doc: Document, url: string): ParseResult {
//   const hostname = new URL(url).hostname;

//   if (hostname.includes("wikipedia.org")) {
//     return parseWikipedia(doc);
//   }
//   if (hostname.includes("chatgpt.com")) {
//     return parseChatGPT(doc);
//   }
//   if (hostname.includes("stackoverflow.com")) {
//     return parseStackOverflow(doc);
//   }

//   // The 99% fallback
//   return parseDocument(doc);
// }

/**
 * Calculates the ratio of link text to total text within a DOM node.
 * @returns a number between 0.0 (no links) and 1.0 (entirely links).
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

/**
 * Helper function to normalize media and links in the document before pruning.
 * This ensures that we have absolute URLs for images and links, and that code blocks have consistent language annotations.
 * @param root The root element (Document or a specific Element) to normalize. This allows us to reuse this logic for both the full document and user-selected snippets.
 */
function normalizeMediaAndLinks(root: Document | Element) {
  // 0. Rescue images from <noscript> tags (e.g., Medium, Substack)
  root.querySelectorAll("noscript").forEach((noscript) => {
    const html = noscript.textContent || noscript.innerHTML;
    if (html.includes("<img")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const hiddenImage = tempDiv.querySelector("img");
      if (hiddenImage) {
        // Replace the noscript tag with the actual image so it gets processed
        noscript.replaceWith(hiddenImage);
      }
    }
  });

  // 1. Picture / Source extraction
  root.querySelectorAll("picture").forEach((picture) => {
    const img = picture.querySelector("img");
    const sources = Array.from(picture.querySelectorAll("source"));

    if (img && sources.length > 0) {
      const bestSource = sources.find((s) => s.getAttribute("srcset"));
      if (bestSource) {
        const srcset = bestSource.getAttribute("srcset") || "";
        const firstUrl = srcset.split(",")[0].trim().split(/\s+/)[0];
        if (firstUrl) {
          img.setAttribute("data-extracted-source", firstUrl);
        }
      }
    }
  });

  // 2. Image Normalization (NATIVE BROWSER RESOLUTION)
  root.querySelectorAll("img").forEach((img) => {
    // Check for lazy-load or extracted strings first
    let bestSrcStr =
      img.getAttribute("data-extracted-source") ||
      img.getAttribute("data-src") ||
      img.getAttribute("data-lazy-src");

    const srcset = img.getAttribute("srcset");
    if (srcset) {
      const firstSrc = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (firstSrc) bestSrcStr = firstSrc;
    }

    // If we found a better source string, assign it to the DOM property.
    // The browser will instantly and natively resolve this to an absolute URL!
    if (bestSrcStr) {
      img.src = bestSrcStr;
    }

    // Now, lock in the absolute URL as the explicit attribute for DOMPurify
    if (img.src) {
      img.setAttribute("src", img.src);

      // Cleanup
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.removeAttribute("data-src");
      img.removeAttribute("data-lazy-src");
      img.removeAttribute("loading");
    } else {
      img.remove();
    }
  });

  // 3. Link Normalization (NATIVE BROWSER RESOLUTION)
  root.querySelectorAll("a").forEach((link) => {
    if (link.hasAttribute("href")) {
      // link.href naturally returns the absolute, fully-resolved URL.
      // We overwrite the attribute with this absolute value.
      link.setAttribute("href", link.href);
    }
  });

  // 4. Code Block Normalization
  root.querySelectorAll("pre, code").forEach((block) => {
    let detectedLang =
      block.getAttribute("data-language") ||
      block.getAttribute("data-lang") ||
      "";

    if (!detectedLang) {
      const className = block.getAttribute("class") || "";
      const match = className.match(/(?:lang|language|highlight)-([a-z0-9]+)/i);
      if (match) detectedLang = match[1];
    }

    if (!detectedLang && block.tagName === "PRE") {
      const childCode = block.querySelector("code");
      if (childCode) {
        const childClass = childCode.getAttribute("class") || "";
        const childMatch = childClass.match(
          /(?:lang|language|highlight)-([a-z0-9]+)/i,
        );
        if (childMatch) detectedLang = childMatch[1];
      }
    }

    if (detectedLang) {
      block.setAttribute("data-language", detectedLang.toLowerCase());
      block.removeAttribute("class");
    }
  });
}

/**
 * The main parsing function that extracts metadata, normalizes media, prunes junk, and locates the main content.
 * It returns a structured ParseResult object containing the cleaned HTML content and metadata.
 * @param doc The Document object to parse. This should be a clone of the original document to avoid mutating the live page, especially since we do aggressive pruning.
 * @returns A ParseResult object containing the cleaned HTML content and metadata.
 */
export function parseDocument(doc: Document): ParseResult {
  // STEP 1: EXTRACT METADATA
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
    doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
    doc.querySelector('[itemprop="author"]')?.textContent?.trim() || // Schema.org fallback
    doc.querySelector(".author-name, .byline")?.textContent?.trim() || // Common class fallback
    null;
  const siteName =
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") || null;
  const publishedTime =
    doc
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content") ||
    doc.querySelector("time[datetime]")?.getAttribute("datetime") || // HTML5 <time> fallback
    doc.querySelector('[itemprop="datePublished"]')?.getAttribute("content") ||
    null;

  // STEP 2: BULLETPROOF IMAGE NORMALIZATION
  normalizeMediaAndLinks(doc);

  // STEP 3: AGGRESSIVE JUNK PRUNING / TODO MAYBE: Make configurable for other pages, some of them might have useful stuff in the header/footer/aside for example.
  const junkSelectors = [
    "nav",
    "footer",
    "header", // MAYBE: leave this one in.
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
    ".hidden", //tailwind
    "[hidden]",
    '[style*="display: none"]',
    '[style*="display:none"]',
    '[style*="visibility: hidden"]',
    ".visually-hidden",
    ".sr-only", // Screen-reader only text (often duplicates visual content)
    // No aria-hidden, because content might not be hidden visually.
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

      // 65 was 30 before, was too aggressive
      if (density > 0.6 && charCount > 65) {
        el.remove();
      }
    }
  });

  doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img")) {
      el.remove();
    }
  });

  // STEP 4: LOCATE MAIN CONTENT
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
      const paragraphs = candidate.querySelectorAll("p, pre, code, li").length;
      const density = getLinkDensity(candidate);

      // Penalize high link density
      let score = paragraphs * (1 - density);

      // PENALIZE WRAPPERS: If a div has very few direct paragraphs but tons of nested elements,
      // it's likely a layout wrapper, not the content body.
      const childElementCount = candidate.children.length || 1;
      const wrapperPenalty = Math.max(1, childElementCount / 5); // Tweak the divisor as needed

      score = score / wrapperPenalty;

      if (score > maxScore) {
        maxScore = score;
        bestNode = candidate as HTMLElement;
      }
    });
    mainContentHtml = bestNode.innerHTML;
  }

  // STEP 5: ENFORCE MARKDOWN EQUIVALENCY
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
    "details",
    "summary",
  ];

  const sanitizedContent = DomPurify.sanitize(mainContentHtml, {
    ALLOWED_TAGS: markdownEquivalentTags,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "open", "data-language"],
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

/**
 * Grabs the user's current text/HTML selection and wraps it in a DOM Element.
 * @returns null if nothing is selected.
 */
export function getSelectionAsElement(): HTMLElement | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  // If they just clicked and didn't highlight actual content (had .trim())
  if (!container.innerHTML) {
    return null;
  }

  return container;
}

/**
 * Parses an arbitrary DOM snippet (like a user selection) without pruning structure.
 * It normalizes URLs/code and enforces the Markdown schema.
 * @param snippet The DOM element containing the highlighted content (e.g., a div wrapping the user's selection).
 * @param doc The full document, used for metadata extraction.
 * @returns A ParseResult object containing the cleaned HTML content of the snippet and metadata from the main document.
 */
export function parseSnippet(snippet: Element, doc: Document): ParseResult {
  // 1. NORMALIZE HIGHLIGHTED CONTENT
  // We pass the snippet here so images and code blocks inside it get fixed
  normalizeMediaAndLinks(snippet);

  // 2. ENFORCE MARKDOWN EQUIVALENCY
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
    "details",
    "summary",
    // Exceptions
    "div",
    "span",
  ];

  const sanitizedContent = DomPurify.sanitize(snippet.innerHTML, {
    ALLOWED_TAGS: markdownEquivalentTags,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "open", "data-language"],
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitizedContent;
  const textContent = tempDiv.textContent || "";

  // 3. EXTRACT METADATA FROM THE MAIN DOCUMENT
  // Even though they only highlighted a snippet, we still want the context!
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
    doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
    doc.querySelector('[itemprop="author"]')?.textContent?.trim() ||
    doc.querySelector(".author-name, .byline")?.textContent?.trim() ||
    null;
  const siteName =
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") || null;
  const publishedTime =
    doc
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content") ||
    doc.querySelector("time[datetime]")?.getAttribute("datetime") ||
    doc.querySelector('[itemprop="datePublished"]')?.getAttribute("content") ||
    null;

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

//export function parseDocumentLight(doc: Document): any {}
// A very lightweight parser that does not prune, but apply code block normalization and image URL resolution, and extracts metadata.
// This can be used for the AI-assisted capture, where we want to preserve as much of the original structure as possible, and let the AI figure out what to keep or discard, though the full implementation might still be better

// TODO: Maybe implement later, when needed
//export function parseDocumentToMarkdown(doc: Document): string {}
