import { Readability } from "@mozilla/readability";
import { PageData } from "@/types/page-selection-data.types";
import { Article } from "@/types/mozilla-article.types";
import DomPurify from "dompurify";

// export async function getPageArticle(): Promise<Article> {
//   const doc = document.cloneNode(true) as Document;

//   // Set the base URI to resolve relative links correctly
//   const base = doc.createElement("base");
//   base.href = document.baseURI;
//   doc.head.appendChild(base);
//

export async function getPageData(): Promise<PageData | null> {
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

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
    //Todo: Add more fields if needed
  };
}
