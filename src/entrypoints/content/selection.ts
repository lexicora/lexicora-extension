import { Readability } from "@mozilla/readability";
import { pageSelectionData } from "@/types/page-selection-data.types";
import { Article } from "@/types/mozilla-article.types";

/**
 * This function is for when you want Readability to clean up the content,
 * which is ideal for AI processing. It may strip images.
 */
export async function getSelectionPageArticle(): Promise<Article> {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  const selectionHtml = container.innerHTML;

  if (!selectionHtml) return null;

  // Use the browser's native DOMParser
  const doc = new DOMParser().parseFromString(selectionHtml, "text/html");

  // Set the base URI to resolve relative links correctly
  const base = doc.createElement("base");
  base.href = document.baseURI;
  doc.head.appendChild(base);
  //Todo: Add more data to head and html like: HTML lang, meta charset, title, etc.

  const reader = new Readability(doc);
  const article = reader.parse();
  //Todo: Add siteName or URL to article if needed

  // Return the fully parsed article object
  return article;
}

/**
 * This function is for saving the selection "as is", but with URLs resolved.
 * It preserves all tags, including images, and converts relative URLs to absolute ones.
 */
export async function getSelectionPageData(): Promise<pageSelectionData | null> {
  const selection = window.getSelection();
  const pageBaseUri = document.baseURI;
  if (!selection || selection.rangeCount === 0) {
    //return { pageBaseUri, pageHTML: "" };
    return null;
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  if (!container.innerHTML) {
    return null;
  }

  // Resolve relative URLs for links and images
  const links = container.querySelectorAll("a");
  links.forEach(link => {
    // The 'link.href' property automatically returns the absolute URL
    link.setAttribute("href", link.href);
  });

  const images = container.querySelectorAll("img");
  images.forEach(image => {
    // The 'image.src' property automatically returns the absolute URL
    image.setAttribute("src", image.src);
  });

  return {
    pageBaseUri,
    pageHTML: container.innerHTML,
    //Todo: Add more fields if needed
  };
}

// export async function getSelectionPageData(): Promise<pageSelectionData> {
//   const selection = window.getSelection();
//   const pageBaseUri = document.baseURI;
//   if (!selection || selection.rangeCount === 0)
//     return { pageBaseUri, pageHTML: "" };

//   const range = selection.getRangeAt(0);
//   const container = document.createElement("div");
//   container.appendChild(range.cloneContents());

//   // Return the HTML of the selected content
//   console.log("TEST: \nURL:", pageBaseUri, "\nSelected HTML:", container.innerHTML);

//   return {
//     pageBaseUri,
//     pageHTML: container.innerHTML,
//   };
// }
