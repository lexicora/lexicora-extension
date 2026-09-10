import type { PageData } from "@/types/page-data.types";
import { extractPageMetadata } from "@/lib/utils/document-parser";

/**
 * Captures a page as a bookmark: its metadata, and nothing of its content.
 *
 * Unlike `getPageData`, this neither clones the document nor runs the content
 * parser — it only reads meta tags from the live page — so it is cheap on any
 * page, however large. `content` is always empty; `misc.metadataOnly` tells the
 * side panel that is intentional.
 */
export function getPageMetadata(): PageData {
  const metadata = extractPageMetadata(document);

  return {
    baseUri: document.baseURI,
    content: "",
    textContent: "",
    lang: document.documentElement.lang || "en",
    title: metadata.title,
    location: {
      href: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    metadata: {
      length: 0,
      excerpt: metadata.excerpt,
      byline: metadata.byline,
      siteName: metadata.siteName,
      publishedTime: metadata.publishedTime,
      faviconUrl: metadata.faviconUrl,
      dir: document.documentElement.dir || null,
    },
    misc: {
      // A bookmark describes a new page, so it replaces the form rather than
      // merging into it, the same as a full page capture.
      overrideExisting: true,
      metadataOnly: true,
    },
  };
}
