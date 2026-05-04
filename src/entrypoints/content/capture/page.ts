import { PageData } from "@/types/page-data.types";
import { parseDocument } from "@/lib/utils/document-parser";

// TODO: Maybe make this function not return a nullable type, so Promise<PageData>.
/**
 * Captures the entire page content and metadata, and returns it as a structured object.
 * @returns A Promise that resolves to a PageData object containing the page's content, metadata, and other relevant information, or null if the page cannot be parsed.
 */
export async function getPageData(): Promise<PageData | null> {
  const documentClone = document.cloneNode(true) as Document;
  const parsedPage = parseDocument(documentClone);

  return {
    baseUri: documentClone.baseURI,
    content: parsedPage.content || "",
    textContent: parsedPage.textContent,
    lang: documentClone.documentElement.lang || "en",
    title: parsedPage.title,
    location: {
      href: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    metadata: {
      length: parsedPage.length,
      excerpt: parsedPage.excerpt,
      byline: parsedPage.byline,
      siteName: parsedPage.siteName,
      publishedTime: parsedPage.publishedTime,
      dir: documentClone.documentElement.dir || null,
    },
    misc: {
      // TODO: Implement a setting, where the user can decide whether to replace the editor content with the parsed content, or to append it.
      replaceEditorContent: true, // true, because page is being captured, though maybe change this later to false, to be consistent with capturing selections
    },
    //TODO: Add more fields if needed
  };
}
