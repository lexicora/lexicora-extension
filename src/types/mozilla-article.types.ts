import { Readability } from "@mozilla/readability";

export type Article = ReturnType<Readability["parse"]> | null;

export type NonNullableArticle = NonNullable<Article>;

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
