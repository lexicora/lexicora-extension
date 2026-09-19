// document-parser.ts v0.3.0
// TODO: Potentially collect an array of relevant tags.

import DomPurify from "dompurify";

import { normalizeCallouts } from "./document-callouts";

export interface ParseResult {
  content: string;
  textContent: string;
  length: number;
  title: string;
  excerpt: string | null;
  byline: string | null;
  siteName: string | null;
  publishedTime: string | null;
  faviconUrl: string | null;
}

/** The metadata half of a {@link ParseResult}: everything except the content. */
export type PageMetadata = Pick<
  ParseResult,
  "title" | "excerpt" | "byline" | "siteName" | "publishedTime" | "faviconUrl"
>;

/**
 * Reads a page's metadata from its `<head>` and a few well-known body markers,
 * without touching or parsing its content.
 *
 * Read-only, so it is safe to call on the live document — no clone needed. This
 * is the whole of a bookmark capture, and the first step of the full and
 * selection parsers.
 *
 * `excerpt` comes only from the page's own description meta tags. It never
 * falls back to the page text, so a metadata-only capture carries no content.
 */
export function extractPageMetadata(doc: Document): PageMetadata {
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

  let faviconUrl =
    doc.querySelector('link[rel="icon"]')?.getAttribute("href") ||
    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
    doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
    null;

  if (faviconUrl) {
    try {
      faviconUrl = new URL(faviconUrl, doc.baseURI).href;
    } catch (e) {
      faviconUrl = null;
    }
  } else {
    try {
      faviconUrl = new URL("/favicon.ico", doc.baseURI).href;
    } catch (e) {
      faviconUrl = null;
    }
  }

  return { title, excerpt, byline, siteName, publishedTime, faviconUrl };
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
 * The tags the editor has a block or inline style for. The sanitizer unwraps
 * everything else and keeps its text.
 */
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
  "s",
  "u",
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

/** A selection keeps its generic wrappers too, so it stays as it was laid out. */
const snippetTags = [...markdownEquivalentTags, "div", "span"];

const allowedAttributes = [
  "href",
  "src",
  "alt",
  "title",
  "open",
  "data-language", // A code block's language, read by the editor
  "data-alert-type", // An alert's type, see `document-callouts.ts`
];

/**
 * What a reader never sees as text: code, and hidden elements. Dropped from
 * pages and selections alike.
 */
const invisibleSelectors = [
  "script",
  "style",
  "template",
  "[hidden]",
  '[style*="display: none"]',
  '[style*="display:none"]',
  '[style*="visibility: hidden"]',
  ".visually-hidden",
  ".sr-only", // Screen-reader only text (often duplicates visual content)
  // No aria-hidden, because content might not be hidden visually.
];

/**
 * Form controls. On a page, their labels are interface ("Copy", "Share", a
 * select's every option), which the sanitizer would unwrap into the content.
 * A selection keeps what they visibly show instead: see `revealControlText`.
 */
const controlSelectors = ["button", "input", "select", "textarea"];

/** Inputs that show their value as text. */
const textInputSelector = ["text", "search", "email", "url", "tel", "number"]
  .map((type) => `input[type="${type}"]`)
  .concat("input:not([type])")
  .join(", ");

/**
 * Page furniture around the content, dropped from full pages only.
 * TODO MAYBE: Make configurable for other pages, some of them might have useful stuff in the header/footer/aside for example.
 */
const junkSelectors = [
  "nav",
  "footer",
  "header", // MAYBE: leave this one in.
  "aside",
  "noscript",
  "iframe",
  "svg",
  "form",
  "dialog",
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
  // Tailwind. Not applied to selections: `hidden md:block` is visible on
  // desktop, where the user selected it.
  ".hidden",
];

const unlikelyRegex =
  /share|social|promo|newsletter|subscribe|related|sponsor|tags|author|comments|disqus|cookie|popup|modal|outbrain|taboola|advert/i;
const likelyRegex = /article|body|content|main|page|post|text|blog|wiki/i;

const headingButtonSelector = ["h1", "h2", "h3", "h4", "h5", "h6"]
  .map((heading) => `${heading} button`)
  .join(", ");

const semanticContainerSelector =
  'article, main, [role="main"], .markdown-body, .post-content, #bodyContent';

/**
 * The widest srcset image to pick: sharp in the wide editor, without pulling
 * a print-size original. Densities (`2x`) are capped the same way.
 */
const maxImageWidth = 1600;
const maxImageDensity = 2;

/**
 * Images that sit in a line of text as a glyph, not as a picture: emoji,
 * rendered formulas, icons. Declared at most this many pixels on each side.
 */
const maxGlyphSize = 32;

/** Emoji characters only, as emoji images carry them in their alt text. */
const emojiOnlyPattern =
  /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|[\u200d\ufe0f\u20e3\s])+$/u;

/** A width or height in em or ex: the image is sized to scale with the text. */
const textScaledPattern = /(?:^|;)\s*(?:width|height)\s*:\s*[\d.]+\s*e[mx]\b/i;

/** Paragraphs and headings, whose content in the editor is text only. */
const textBlockSelector = "p, h1, h2, h3, h4, h5, h6";

/**
 * One srcset candidate. The URL runs to the next whitespace, so commas inside
 * it (Cloudinary's `w_400,c_fill`) stay part of it; a comma right after it,
 * or one after its descriptor, ends the candidate.
 */
const srcsetCandidatePattern = /[\s,]*(\S*[^\s,])(?:,+|\s+([^,]*)(?:,|$)|$)/g;

/**
 * A language class as highlighters write it: `language-js` (Prism,
 * highlight.js), `lang-js`, `highlight-source-js` (GitHub).
 */
const codeLanguagePattern =
  /\b(?:lang(?:uage)?|highlight(?:-source|-text)?)-([a-z0-9+#]+)/i;

/** The document that owns `root`, for creating elements that go into it. */
function documentOf(root: Document | Element): Document {
  return root.ownerDocument ?? (root as Document);
}

function removeAll(root: Document | Element, selectors: string[]): void {
  root.querySelectorAll(selectors.join(", ")).forEach((el) => el.remove());
}

function toAbsoluteUrl(url: string, baseUrl: string): string | null {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Calculates the ratio of link text to total text within a DOM node.
 * @param textLength The node's trimmed text length, when the caller has it already.
 * @returns a number between 0.0 (no links) and 1.0 (entirely links).
 */
function getLinkDensity(
  element: Element,
  textLength = element.textContent?.trim().length ?? 0,
): number {
  if (textLength === 0) return 0;

  let linkLength = 0;
  element.querySelectorAll("a").forEach((link) => {
    linkLength += link.textContent?.trim().length ?? 0;
  });

  return linkLength / textLength;
}

/**
 * The srcset candidate to keep: the largest within the cap, or the smallest
 * when every one is larger. Placeholder `data:` candidates are skipped.
 */
function pickFromSrcset(srcset: string | null | undefined): string | null {
  if (!srcset) return null;

  const candidates = Array.from(
    srcset.matchAll(srcsetCandidatePattern),
    ([, url = "", descriptor = ""]) => ({
      url,
      size: Number.parseFloat(descriptor) || 1,
      isWidth: descriptor.trim().endsWith("w"),
    }),
  )
    .filter(({ url }) => url && !url.startsWith("data:"))
    .sort((a, b) => a.size - b.size);

  const limit = candidates.some((c) => c.isWidth)
    ? maxImageWidth
    : maxImageDensity;
  const fitting = candidates.filter((c) => c.size <= limit);
  return (fitting.at(-1) ?? candidates[0])?.url ?? null;
}

/**
 * Lazy-loading sites (e.g., Medium, Substack) put the real image in a
 * <noscript>, next to a placeholder <img>. Brings it out so the image
 * normalization below sees it.
 */
function rescueNoscriptImages(root: Document | Element): void {
  const doc = documentOf(root);

  root.querySelectorAll("noscript").forEach((noscript) => {
    // With scripting on, the browser keeps noscript content as raw markup.
    const markup = noscript.textContent || noscript.innerHTML;
    if (!markup.includes("<img")) return;

    // A template's content is inert, so parsing it does not load the image.
    const template = doc.createElement("template");
    template.innerHTML = markup;
    const hiddenImage = template.content.querySelector("img");
    if (!hiddenImage) return;

    // Many lazy-loading sites have a placeholder <img data-src="..."> adjacent to
    // the <noscript>. If we blindly insert the rescued img, the normalization
    // processes both and produces a duplicate. Instead, write the rescued src onto
    // the existing placeholder's data-src and remove the noscript.
    const prev = noscript.previousElementSibling;
    const next = noscript.nextElementSibling;
    const adjacentImg =
      prev?.tagName === "IMG" ? prev : next?.tagName === "IMG" ? next : null;

    if (adjacentImg) {
      const rescuedSrc =
        hiddenImage.getAttribute("src") || hiddenImage.getAttribute("data-src");
      if (rescuedSrc) adjacentImg.setAttribute("data-src", rescuedSrc);
      noscript.remove();
    } else {
      noscript.replaceWith(hiddenImage);
    }
  });
}

/**
 * Gives every image one absolute `src`, taken from the best source it has:
 * its srcset, its <picture>'s sources, then the lazy-loading attributes.
 * Images with no source at all are removed.
 */
function normalizeImages(root: Document | Element, baseUrl: string): void {
  root.querySelectorAll("img").forEach((img) => {
    const picture =
      img.parentElement?.tagName === "PICTURE" ? img.parentElement : null;
    const source = picture?.querySelector(
      "source[srcset], source[data-srcset]",
    );

    const candidate =
      pickFromSrcset(img.getAttribute("srcset")) ||
      pickFromSrcset(
        source?.getAttribute("srcset") ?? source?.getAttribute("data-srcset"),
      ) ||
      pickFromSrcset(img.getAttribute("data-srcset")) ||
      img.getAttribute("data-src") ||
      img.getAttribute("data-lazy-src") ||
      img.getAttribute("src");

    const url = candidate ? toAbsoluteUrl(candidate, baseUrl) : null;
    if (url) {
      img.setAttribute("src", url);
    } else {
      img.remove();
    }
  });
}

function normalizeLinks(root: Document | Element, baseUrl: string): void {
  root.querySelectorAll("a[href]").forEach((link) => {
    const url = toAbsoluteUrl(link.getAttribute("href") ?? "", baseUrl);
    if (url) {
      link.setAttribute("href", url);
    } else {
      link.removeAttribute("href");
    }
  });
}

function detectCodeLanguage(pre: Element): string | null {
  // The block itself, its <code>, then the wrapper GitHub and Docusaurus put
  // the language on.
  for (const el of [pre, pre.querySelector("code"), pre.parentElement]) {
    if (!el) continue;
    const declared =
      el.getAttribute("data-language") || el.getAttribute("data-lang");
    if (declared) return declared;
    const match = codeLanguagePattern.exec(el.getAttribute("class") ?? "");
    if (match?.[1]) return match[1];
  }

  // Some sites only mark the language on an inner span.
  const marked = pre.querySelectorAll('[class*="lang"], [class*="highlight-"]');
  for (const el of Array.from(marked)) {
    const match = codeLanguagePattern.exec(el.getAttribute("class") ?? "");
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Reduces a code block to the shape the editor reads, a <pre> holding one
 * <code> with the language on it, and keeps only the text: the editor's code
 * block is plain text, so the highlighter's markup would be dropped anyway.
 */
function normalizeCodeBlock(pre: Element, doc: Document): void {
  const language = detectCodeLanguage(pre);

  // Copy buttons
  pre.querySelectorAll("button").forEach((button) => button.remove());
  pre.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  // Some highlighters (Expressive Code) wrap each line in a block element
  // with no newline between them, so the text would run the lines together.
  pre.querySelectorAll("div, p").forEach((line) => {
    const next = line.nextSibling;
    if (
      next &&
      !next.textContent?.startsWith("\n") &&
      !line.textContent?.endsWith("\n")
    ) {
      line.append("\n");
    }
  });

  const code = doc.createElement("code");
  code.textContent = (pre.textContent ?? "").replace(/\n+$/, "");
  if (language) code.setAttribute("data-language", language.toLowerCase());
  pre.replaceChildren(code);
}

/**
 * What an image becomes when it is a glyph in a line of text rather than a
 * picture: an emoji, or a formula sized in em or ex to scale with the text,
 * reads as its alt text; an icon declared a few pixels big, as nothing.
 * @returns `null` for a picture.
 */
function glyphText(img: Element): string | null {
  const alt = img.getAttribute("alt")?.trim() ?? "";
  const style = img.getAttribute("style") ?? "";
  if (
    /(?:^|\s)emoji(?:\s|$)/i.test(img.getAttribute("class") ?? "") ||
    (alt !== "" && emojiOnlyPattern.test(alt)) ||
    textScaledPattern.test(style)
  ) {
    return alt;
  }

  const sizes = [
    img.getAttribute("width"),
    img.getAttribute("height"),
    /(?:^|;)\s*width\s*:\s*([\d.]+)px/i.exec(style)?.[1],
    /(?:^|;)\s*height\s*:\s*([\d.]+)px/i.exec(style)?.[1],
  ]
    .map((size) => Number.parseFloat(size ?? ""))
    .filter(Number.isFinite);
  return sizes.length > 0 && Math.max(...sizes) <= maxGlyphSize ? "" : null;
}

/**
 * The editor keeps text only inside a paragraph or heading, so it drops any
 * image there. Pictures are moved out between the text around them, which
 * splits the block; a link around just the image moves with it. Glyphs stay
 * in the line: emoji and formulas as their alt text, icons not at all.
 */
function liftImagesOutOfText(root: Document | Element): void {
  const doc = documentOf(root);
  const picturesByBlock = new Map<Element, Element[]>();

  root.querySelectorAll("img").forEach((img) => {
    const text = glyphText(img);
    if (text !== null) {
      img.replaceWith(text);
      return;
    }

    const block = img.closest(textBlockSelector);
    if (!block) return;
    const link = img.parentElement;
    const picture =
      link !== block &&
      link?.tagName === "A" &&
      !link.textContent?.trim() &&
      link.querySelectorAll("img").length === 1
        ? link
        : img;
    picturesByBlock.set(block, [
      ...(picturesByBlock.get(block) ?? []),
      picture,
    ]);
  });

  const hasContent = (el: Element) =>
    Boolean(el.textContent?.trim()) || el.querySelector("img") !== null;

  for (const [block, pictures] of picturesByBlock) {
    // Last first: each split then leaves the earlier pictures in the block.
    for (const picture of pictures.reverse()) {
      const range = doc.createRange();
      range.setStartAfter(picture);
      range.setEnd(block, block.childNodes.length);
      const rest = block.cloneNode(false) as Element;
      rest.append(range.extractContents());
      block.after(picture, ...(hasContent(rest) ? [rest] : []));
    }
    if (!hasContent(block)) block.remove();
  }
}

/**
 * Normalizes media, links, code and callouts before any pruning, so the
 * content is in the shapes the pruning and the editor expect. Shared by the
 * full-page and selection parsers.
 * @param baseUrl The page's URL, which relative URLs are resolved against.
 */
function normalizeContent(root: Document | Element, baseUrl: string): void {
  const doc = documentOf(root);
  rescueNoscriptImages(root);
  normalizeImages(root, baseUrl);
  liftImagesOutOfText(root);
  normalizeLinks(root, baseUrl);
  root.querySelectorAll("pre").forEach((pre) => normalizeCodeBlock(pre, doc));
  normalizeCallouts(root);

  // Buttons are dropped as controls later, except an accordion's: its
  // question is a button inside a heading, so keep the text.
  root
    .querySelectorAll(headingButtonSelector)
    .forEach((button) => button.replaceWith(...Array.from(button.childNodes)));
}

/**
 * Removes blocks whose class or id reads like page furniture, and link farms
 * (navigation, "Related articles") that no class gives away.
 */
function pruneUnlikelyBlocks(doc: Document): void {
  doc.querySelectorAll("div, section, ul, ol, li, p").forEach((el) => {
    // Already gone with a removed ancestor.
    if (!el.isConnected) return;

    // 1. Regex Pruning
    const className = el.getAttribute("class") ?? "";
    const id = el.getAttribute("id") ?? "";
    const matchString = `${className} ${id}`;
    if (unlikelyRegex.test(matchString) && !likelyRegex.test(matchString)) {
      el.remove();
      return;
    }

    // 2. STRUCTURAL HEURISTIC PRUNING (The "Link Farm" Killer)
    // Only containers, which often hold lists of links.
    if (el.tagName === "LI" || el.tagName === "P") return;

    // We don't want to accidentally delete short blocks (like a 2-word author byline
    // that is fully hyperlinked), so we only apply this rule to blocks with some substance.
    // 65 was 30 before, was too aggressive.
    const textLength = el.textContent?.trim().length ?? 0;

    // A density > 0.6 means 60% of the words are links. A block holding code
    // is not a link farm, even when links crowd it (react.dev puts a demo of
    // linked video cards beside its code); its link-heavy parts are still
    // judged on their own.
    if (
      textLength > 65 &&
      !el.querySelector("pre") &&
      getLinkDensity(el, textLength) > 0.6
    ) {
      el.remove();
    }
  });

  doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img")) {
      el.remove();
    }
  });
}

/**
 * The longest semantic container: a page's <main> usually holds its
 * <article>, and a feed holds many. An empty one does not count.
 */
function findSemanticContainer(doc: Document): Element | null {
  let best: Element | null = null;
  let bestLength = 0;
  const containers = doc.querySelectorAll(semanticContainerSelector);
  for (const el of Array.from(containers)) {
    const length = el.textContent?.length ?? 0;
    if (length > bestLength) {
      best = el;
      bestLength = length;
    }
  }
  return best;
}

/**
 * The fallback for pages without a semantic container, after Readability:
 * each paragraph adds to its parent's score and half as much to its
 * grandparent's, so the element holding the prose outscores the layout
 * wrappers around it. Link-heavy candidates are marked down.
 */
function findContentByScore(doc: Document): Element {
  const scores = new Map<Element, number>();
  const addScore = (el: Element | null | undefined, score: number) => {
    if (el) scores.set(el, (scores.get(el) ?? 0) + score);
  };

  doc.body.querySelectorAll("p, pre, td").forEach((paragraph) => {
    const text = paragraph.textContent?.trim() ?? "";
    if (text.length < 25) return; // Captions, labels, stray fragments

    // Longer, comma-rich text reads as prose rather than interface copy.
    const commas = text.split(",").length - 1;
    const score = 1 + commas + Math.min(Math.floor(text.length / 100), 3);
    addScore(paragraph.parentElement, score);
    addScore(paragraph.parentElement?.parentElement, score / 2);
  });

  let best: Element = doc.body;
  let bestScore = 0;
  for (const [candidate, score] of scores) {
    const adjusted = score * (1 - getLinkDensity(candidate));
    if (adjusted > bestScore) {
      best = candidate;
      bestScore = adjusted;
    }
  }

  // An article split into sibling sections scores each section on its own.
  // When their shared parent scores nearly as high, it is the article.
  const threshold = (scores.get(best) ?? 0) * 0.75;
  let parent = best.parentElement;
  while (parent && (scores.get(parent) ?? 0) >= threshold && threshold > 0) {
    best = parent;
    parent = parent.parentElement;
  }

  return best;
}

/**
 * Enforces the Markdown-equivalent schema, returning the content with its
 * plain text.
 */
function sanitize(
  html: string,
  allowedTags: string[],
): Pick<ParseResult, "content" | "textContent" | "length"> {
  // RETURN_DOM hands back the sanitizer's own inert document. Reading the
  // text there, rather than from a scratch element on the page, keeps the
  // page from loading every image in the content. Typed as a Node, it is
  // always that document's <body>.
  const body = DomPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: true,
  }) as HTMLElement;
  const textContent = body.textContent ?? "";

  return { content: body.innerHTML, textContent, length: textContent.length };
}

/**
 * The main parsing function that extracts metadata, normalizes media, prunes junk, and locates the main content.
 * It returns a structured ParseResult object containing the cleaned HTML content and metadata.
 * @param doc The Document object to parse. This should be a clone of the original document to avoid mutating the live page, especially since we do aggressive pruning.
 * @returns A ParseResult object containing the cleaned HTML content and metadata.
 */
export function parseDocument(doc: Document): ParseResult {
  // STEP 1: EXTRACT METADATA
  //* Must run before normalization and pruning below, which mutate `doc`.
  const metadata = extractPageMetadata(doc);

  // STEP 2: NORMALIZE MEDIA, LINKS, CODE AND CALLOUTS
  normalizeContent(doc, doc.baseURI);

  // STEP 3: AGGRESSIVE JUNK PRUNING
  removeAll(doc, [
    ...invisibleSelectors,
    ...controlSelectors,
    ...junkSelectors,
  ]);
  pruneUnlikelyBlocks(doc);

  // STEP 4: LOCATE MAIN CONTENT
  const main = findSemanticContainer(doc) ?? findContentByScore(doc);

  // STEP 5: ENFORCE MARKDOWN EQUIVALENCY
  return { ...sanitize(main.innerHTML, markdownEquivalentTags), ...metadata };
}

/**
 * Replaces each form control in a selection with the text it shows on the
 * page: a button its label, a select its chosen option, a text field its
 * value. The user saw that text when selecting, so it is theirs to keep.
 * Controls that show no text, like checkboxes, go.
 */
function revealControlText(snippet: Element): void {
  snippet.querySelectorAll(controlSelectors.join(", ")).forEach((control) => {
    if (control.tagName === "BUTTON") {
      control.replaceWith(...Array.from(control.childNodes));
    } else if (control.tagName === "SELECT") {
      const select = control as HTMLSelectElement;
      const chosen =
        select.selectedOptions[0] ?? select.querySelector("option");
      control.replaceWith(chosen?.textContent?.trim() ?? "");
    } else if (
      control.tagName === "TEXTAREA" ||
      control.matches(textInputSelector)
    ) {
      control.replaceWith((control as HTMLInputElement).value);
    } else {
      control.remove();
    }
  });
}

/**
 * Grabs the user's current text/HTML selection and wraps it in a DOM Element.
 *
 * The copy lives in an inert document rather than on the page: an image on
 * the page starts loading as soon as the parser rewrites its `src`. Relative
 * URLs are resolved against the page by `parseSnippet`.
 * @returns null if nothing is selected.
 */
export function getSelectionAsElement(): HTMLElement | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const inert = document.implementation.createHTMLDocument("");
  const container = inert.createElement("div");
  container.append(inert.adoptNode(selection.getRangeAt(0).cloneContents()));

  // If they just clicked and didn't highlight actual content (had .trim())
  if (!container.innerHTML) {
    return null;
  }

  return container;
}

/**
 * Parses an arbitrary DOM snippet (like a user selection) without pruning structure.
 * It normalizes URLs/code/callouts, drops what the user could not see, and enforces the Markdown schema.
 * @param snippet The DOM element containing the highlighted content (e.g., a div wrapping the user's selection).
 * @param doc The full document, used for metadata extraction and as the base for relative URLs.
 * @returns A ParseResult object containing the cleaned HTML content of the snippet and metadata from the main document.
 */
export function parseSnippet(snippet: Element, doc: Document): ParseResult {
  // 1. NORMALIZE AND SANITIZE HIGHLIGHTED CONTENT
  const cleaned = cleanSnippet(snippet, doc.baseURI);

  // 2. EXTRACT METADATA FROM THE MAIN DOCUMENT
  // Even though they only highlighted a snippet, we still want the context!
  return { ...cleaned, ...extractPageMetadata(doc) };
}

/**
 * The content half of `parseSnippet`: normalizes URLs/code/callouts, drops
 * what the user could not see, and enforces the Markdown schema.
 */
function cleanSnippet(
  snippet: Element,
  baseUrl: string,
): Pick<ParseResult, "content" | "textContent" | "length"> {
  normalizeContent(snippet, baseUrl);
  removeAll(snippet, invisibleSelectors);
  revealControlText(snippet);
  return sanitize(snippet.innerHTML, snippetTags);
}

/**
 * Cleans a fragment of a page that arrives as an HTML string rather than as
 * a live selection, like content dragged from the page into the editor, the
 * same way `parseSnippet` cleans a captured selection.
 *
 * The browser serializes the fragment itself, so some of what the live
 * selection offers is gone: a text field's typed value, a lazy image's
 * `<noscript>` fallback. It also carries no page, so there is no metadata.
 * @param html The fragment, as the browser serialized it.
 * @param baseUrl The page's URL, which relative URLs are resolved against.
 * Browsers already make a dragged fragment's URLs absolute; without a base,
 * any relative link loses its target and any relative image is dropped.
 * @returns The cleaned HTML, ready for the editor, with its plain text.
 */
export function cleanSnippetHTML(
  html: string,
  baseUrl = "about:blank",
): Pick<ParseResult, "content" | "textContent" | "length"> {
  // Parsed in an inert document, so the page does not load its images.
  const inert = document.implementation.createHTMLDocument("");
  const container = inert.createElement("div");
  container.innerHTML = html;
  return cleanSnippet(container, baseUrl);
}

// TODO: Maybe implement later, when needed
//export function parseDocumentToMarkdown(doc: Document): string {}
