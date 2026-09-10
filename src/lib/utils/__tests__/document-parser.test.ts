import { describe, it, expect } from "vitest";
import { extractPageMetadata, parseDocument } from "../document-parser";

/**
 * Covers `extractPageMetadata`, the metadata reader shared by the full,
 * selection and bookmark captures.
 *
 * The property that matters most is that `excerpt` comes only from the page's
 * description meta tags — a bookmark capture relies on it to carry no content.
 */

function makeDoc(head: string, body = "", url = "https://example.com/articles/one") {
  const doc = document.implementation.createHTMLDocument("");
  doc.documentElement.innerHTML = `<head><base href="${url}">${head}</head><body>${body}</body>`;
  return doc;
}

describe("extractPageMetadata", () => {
  it("reads title, description, site name, author and published date", () => {
    const doc = makeDoc(`
      <title>An Article</title>
      <meta name="description" content="A short description.">
      <meta property="og:site_name" content="Example">
      <meta name="author" content="Ada Lovelace">
      <meta property="article:published_time" content="2026-01-02T03:04:05Z">
    `);

    expect(extractPageMetadata(doc)).toMatchObject({
      title: "An Article",
      excerpt: "A short description.",
      siteName: "Example",
      byline: "Ada Lovelace",
      publishedTime: "2026-01-02T03:04:05Z",
    });
  });

  it("falls back to og:description when there is no description tag", () => {
    const doc = makeDoc(
      `<meta property="og:description" content="From Open Graph.">`,
    );

    expect(extractPageMetadata(doc).excerpt).toBe("From Open Graph.");
  });

  it("never derives the description from the page's content", () => {
    const doc = makeDoc(
      `<title>No description</title>`,
      `<article><p>The first paragraph of the article body.</p></article>`,
    );

    expect(extractPageMetadata(doc).excerpt).toBeNull();
  });

  it("resolves a relative favicon against the page URL", () => {
    const doc = makeDoc(`<link rel="icon" href="/static/icon.png">`);

    expect(extractPageMetadata(doc).faviconUrl).toBe(
      "https://example.com/static/icon.png",
    );
  });

  it("falls back to /favicon.ico when the page declares none", () => {
    const doc = makeDoc(`<title>Plain</title>`);

    expect(extractPageMetadata(doc).faviconUrl).toBe(
      "https://example.com/favicon.ico",
    );
  });

  it("does not modify the document it reads", () => {
    const doc = makeDoc(
      `<title>Untouched</title>`,
      `<nav>Menu</nav><article><p>Body</p><img src="a.png"></article>`,
    );
    const before = doc.documentElement.outerHTML;

    extractPageMetadata(doc);

    // Safe to run on the live page, which is what lets a bookmark skip the clone.
    expect(doc.documentElement.outerHTML).toBe(before);
  });
});

describe("parseDocument", () => {
  it("reports the same metadata as extractPageMetadata", () => {
    // parseDocument prunes and rewrites the document after reading metadata,
    // so reading it first is what keeps the two in agreement.
    const head = `
      <title>Same</title>
      <meta name="description" content="Described.">
      <meta property="og:site_name" content="Site">
    `;
    const body = `<article><h1>Heading</h1><p>${"Body text. ".repeat(40)}</p></article>`;

    const expected = extractPageMetadata(makeDoc(head, body));
    const parsed = parseDocument(makeDoc(head, body));

    expect(parsed).toMatchObject(expected);
  });
});
