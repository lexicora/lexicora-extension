import { describe, it, expect } from "vitest";
import {
  parseSearchQuery,
  searchTextPattern,
  siteHostnames,
  siteSearchQuery,
} from "../search-query";

/**
 * Covers the one search filter. It has to stay out of the way of ordinary
 * searching: anything that is not exactly a `site:` token is still text.
 */

describe("parseSearchQuery", () => {
  it("reads a site filter on its own", () => {
    expect(parseSearchQuery("site:react.dev")).toEqual({
      site: "react.dev",
      text: "",
    });
  });

  it("keeps the rest as text", () => {
    expect(parseSearchQuery("site:react.dev hooks guide")).toEqual({
      site: "react.dev",
      text: "hooks guide",
    });
  });

  it("finds the filter wherever it sits", () => {
    expect(parseSearchQuery("hooks site:react.dev")).toEqual({
      site: "react.dev",
      text: "hooks",
    });
  });

  it("ignores case and a www prefix, which the stored host may not have", () => {
    expect(parseSearchQuery("SITE:WWW.React.dev").site).toBe("react.dev");
  });

  it("leaves an ordinary search alone", () => {
    expect(parseSearchQuery("react hooks")).toEqual({
      site: null,
      text: "react hooks",
    });
  });

  it("treats a bare word containing a colon as text", () => {
    // Someone searching for a title like "Chapter 3: Hooks".
    expect(parseSearchQuery("chapter 3: hooks")).toEqual({
      site: null,
      text: "chapter 3: hooks",
    });
  });

  it("treats a second site token as text rather than narrowing invisibly", () => {
    expect(parseSearchQuery("site:react.dev site:vuejs.org")).toEqual({
      site: "react.dev",
      text: "site:vuejs.org",
    });
  });

  it("returns nothing for an empty box", () => {
    expect(parseSearchQuery("   ")).toEqual({ site: null, text: "" });
  });
});

describe("siteHostnames", () => {
  it("matches a host stored with or without www", () => {
    expect(siteHostnames("react.dev")).toEqual(["react.dev", "www.react.dev"]);
  });
});

describe("siteSearchQuery", () => {
  it("builds what the home page's link puts in the box", () => {
    expect(siteSearchQuery("react.dev")).toBe("site:react.dev");
    expect(siteSearchQuery("www.react.dev")).toBe("site:react.dev");
  });
});

describe("searchTextPattern", () => {
  it("matches the text literally, lowercased", () => {
    for (const text of ["C++", "(Draft)", "a.b*c?", "[x] {y} ^$|\\"]) {
      const pattern = new RegExp(searchTextPattern(text)!);
      expect(pattern.test(text.toLowerCase())).toBe(true);
    }
    expect(new RegExp(searchTextPattern("a.b")!).test("axb")).toBe(false);
  });

  it("is null for empty or blank text", () => {
    expect(searchTextPattern("")).toBeNull();
    expect(searchTextPattern("   ")).toBeNull();
  });
});
