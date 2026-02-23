import { Article, NonNullableArticle } from "@/types/mozilla-article.types";

export type PageData = {
  baseUri: string;
  /** The main content of the page (HTML) */
  content: string;
  language: string;
  title: string; // Title of the page
  location: {
    href: string;
    origin: string;
    pathname: string;
    search: string;
    hash: string;
  };
  // Optional fields populated by mozilla readability parsing, that are not already included in the above fields
  mozArticle?: {
    textContent?: NonNullableArticle["content"];
    length?: NonNullableArticle["length"];
    excerpt?: NonNullableArticle["excerpt"];
    byline?: NonNullableArticle["byline"];
    dir?: NonNullableArticle["dir"];
    siteName?: NonNullableArticle["siteName"]; // Maybe remove (redundant with location.origin)
    publishedTime?: NonNullableArticle["publishedTime"];
  };
  //Todo: Add more fields if needed
};
