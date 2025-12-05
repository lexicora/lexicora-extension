import { Readability } from "@mozilla/readability";

export type Article = ReturnType<Readability["parse"]> | null;
