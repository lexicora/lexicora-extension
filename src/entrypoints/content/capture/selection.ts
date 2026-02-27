import { PageData } from "@/types/page-data.types";
import {
  getSelectionAsElement,
  parseSnippet,
} from "@/lib/utils/document-parser";

// TODO: Maybe make this function not return a nullable type, so Promise<PageData>.
/**
 * This function captures the selected content and metadata, and returns it as a structured object.
 * It uses a custom parsing approach that preserves more of the original HTML structure, which is ideal for "as-is" saving.
 * @returns A Promise that resolves to a PageData object containing the selected content, metadata, and other relevant information, or null if the selection cannot be parsed.
 */
export async function getSelectionPageData(): Promise<PageData | null> {
  const selectionElement = getSelectionAsElement();
  if (!selectionElement) return null;

  const parsedSnippet = parseSnippet(selectionElement, document);

  return {
    baseUri: document.baseURI,
    content: parsedSnippet.content || "",
    textContent: parsedSnippet.textContent,
    lang: document.documentElement.lang || "en",
    title: parsedSnippet.title, // || "Untitled",
    location: {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    metadata: {
      length: parsedSnippet.length,
      excerpt: parsedSnippet.excerpt,
      byline: parsedSnippet.byline,
      siteName: parsedSnippet.siteName,
      publishedTime: parsedSnippet.publishedTime,
      dir: document.documentElement.dir || null,
    },
    //TODO: Add more fields if needed
  };
}
