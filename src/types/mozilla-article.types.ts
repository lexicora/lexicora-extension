import { Readability } from "@mozilla/readability";

export type Article = ReturnType<Readability["parse"]> | null;

export type NonNullableArticle = NonNullable<Article>;
