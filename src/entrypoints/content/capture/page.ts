import { Readability } from "@mozilla/readability";
import { PageData } from "@/types/page-selection-data.types";
import { Article } from "@/types/mozilla-article.types";
import DomPurify from "dompurify";

// A completely client-side, highly predictable extractor
function extractSemanticContent(doc: Document): string | null {
  // Ordered from most specific (best) to least specific
  const selectors = [
    "article",
    ".markdown-body", // GitHub & many static site generators
    ".post-content", // Ghost & WordPress
    '[role="main"]', // Accessible SPAs
    "main",
    "#main-content",
  ];

  for (const selector of selectors) {
    const el = doc.querySelector(selector);
    if (el) {
      // Return the inner HTML of the first exact match
      return el.innerHTML;
    }
  }

  return null;
}

export async function getPageData(): Promise<PageData | null> {
  const documentClone = document.cloneNode(true) as Document;

  // 1. Find all code elements
  const codeNodes = documentClone.querySelectorAll(
    "pre, code, .highlight, .code-block",
  );

  codeNodes.forEach((el) => {
    let current: HTMLElement | null = el as HTMLElement;

    // 2. Walk UP the DOM tree and sanitize the parent containers
    while (
      current &&
      current.tagName !== "BODY" &&
      current.tagName !== "HTML"
    ) {
      // Strip classes and IDs so Readability's negative regex ignores this branch of the DOM
      current.removeAttribute("class");
      current.removeAttribute("id");

      // Some technical blogs use <aside> or <section> for code, which Readability hates.
      // Changing them to standard <div> guarantees Readability won't prune the layout.
      if (["ASIDE", "SECTION", "FIGURE"].includes(current.tagName)) {
        const div = documentClone.createElement("div");
        div.innerHTML = current.innerHTML;
        current.parentNode?.replaceChild(div, current);
        current = div; // continue walking up from the new div
      } else {
        current = current.parentElement;
      }
    }
  });

  const article = new Readability(documentClone, {
    debug: import.meta.env.DEV,
  }).parse();

  if (article && article.content) {
    article.content = DomPurify.sanitize(article.content, {
      // Add any specific DOMPurify configuration here if needed
      // For example, to allow certain tags or attributes:
      // ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'img', 'p', 'div', ...],
      // ALLOWED_ATTR: ['href', 'src', 'alt', 'title', ...],
    });
  }

  return {
    baseUri: documentClone.baseURI,
    content: article?.content || "",
    language: article?.lang || documentClone.documentElement.lang || "en",
    title: article?.title || documentClone.title || "",
    location: {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    mozArticle: {
      textContent: article?.textContent,
      length: article?.length,
      excerpt: article?.excerpt,
      byline: article?.byline,
      dir: article?.dir,
      siteName: article?.siteName,
      publishedTime: article?.publishedTime,
    },
    //Todo: Add more fields if needed
  };
}
