import { pageSelectionData } from "@/types/page-selection-data.types";

export async function getSelectionPageData(): Promise<pageSelectionData> {
  const selection = window.getSelection();
  const pageBaseUri = document.baseURI;
  if (!selection || selection.rangeCount === 0)
    return { pageBaseUri, pageHTML: "" };

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  // Return the HTML of the selected content
  console.log("TEST: \nURL:", pageBaseUri, "\nSelected HTML:", container.innerHTML);

  return {
    pageBaseUri,
    pageHTML: container.innerHTML,
  };
}
