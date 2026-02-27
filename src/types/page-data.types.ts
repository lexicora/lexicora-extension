import { Article, NonNullableArticle } from "@/types/mozilla-article.types";

export type PageData = {
  /** BaseUri of the page */
  baseUri: string;
  /** The main content of the page (HTML) */
  content: string;
  /** The main content of the page (text) */
  textContent?: string;
  /** The language of the page */
  lang: string;
  /** The title of the page */
  title: string;
  /** The location data of the page */
  location: {
    href: string;
    origin: string;
    pathname: string;
    search: string;
    hash: string;
  };
  /** Metadata of the page */
  metadata: {
    length: number;
    excerpt: string | null;
    byline: string | null;
    siteName: string | null;
    publishedTime: string | null;
    dir?: string | null; // Text direction (e.g., "ltr", "rtl", "auto")
  };
  // Optional fields populated by mozilla readability parsing, that are not already included in the above fields
  // mozArticle?: {
  //   textContent?: NonNullableArticle["content"];
  //   length?: NonNullableArticle["length"];
  //   excerpt?: NonNullableArticle["excerpt"];
  //   byline?: NonNullableArticle["byline"];
  //   dir?: NonNullableArticle["dir"];
  //   siteName?: NonNullableArticle["siteName"]; // Maybe remove (redundant with location.origin)
  //   publishedTime?: NonNullableArticle["publishedTime"];
  // };
  //Todo: Add more fields if needed
};
