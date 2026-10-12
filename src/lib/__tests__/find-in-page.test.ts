import { describe, it, expect, afterEach } from "vitest";

import { findMatches, MAX_MATCHES, queryPattern } from "../find-in-page";

/**
 * Find in the side panel matches text the way a browser's find does: across
 * inline formatting, never across paragraphs, and only text that is shown.
 */

let root: HTMLElement;

function render(html: string) {
  root = document.createElement("div");
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

const texts = (ranges: Range[]) => ranges.map((range) => range.toString());

afterEach(() => root?.remove());

describe("queryPattern", () => {
  it("is empty for a blank query", () => {
    expect(queryPattern("   ")).toBeNull();
  });

  it("treats the query as text, not a pattern", () => {
    expect(queryPattern("a.b")!.test("axb")).toBe(false);
    expect(queryPattern("a.b")!.test("a.b")).toBe(true);
  });
});

describe("findMatches", () => {
  it("ignores case", () => {
    render("<p>Lexicora and lexicora</p>");

    expect(texts(findMatches(root, "LEXICORA"))).toEqual([
      "Lexicora",
      "lexicora",
    ]);
  });

  it("matches across inline formatting", () => {
    render("<p>Hello <strong>wor</strong>ld</p>");

    expect(texts(findMatches(root, "world"))).toEqual(["world"]);
    expect(texts(findMatches(root, "hello world"))).toEqual(["Hello world"]);
  });

  it("keeps the space between two formatted words", () => {
    render("<p><b>quick</b> <i>fox</i></p>");

    expect(texts(findMatches(root, "quick fox"))).toEqual(["quick fox"]);
  });

  it("never joins two paragraphs", () => {
    render("<p>end of one</p><p>start of two</p>");

    expect(findMatches(root, "onestart")).toEqual([]);
    expect(findMatches(root, "one start")).toEqual([]);
  });

  it("lets whitespace in the query match any whitespace", () => {
    render("<p>two  words</p>");

    expect(texts(findMatches(root, "two words"))).toEqual(["two  words"]);
  });

  it("skips screen-reader-only text and ignored elements", () => {
    render(
      '<p>visible</p><span class="sr-only">visible</span><div data-ignore><p>visible</p></div>',
    );

    const ranges = findMatches(root, "visible", {
      isIgnored: (element) => element.hasAttribute("data-ignore"),
    });
    expect(ranges).toHaveLength(1);
  });

  it("skips form fields and scripts", () => {
    render("<textarea>needle</textarea><script>needle</script><p>needle</p>");

    expect(findMatches(root, "needle")).toHaveLength(1);
  });

  it("stops at the limit", () => {
    render(`<p>${"a ".repeat(MAX_MATCHES + 10)}</p>`);

    expect(findMatches(root, "a")).toHaveLength(MAX_MATCHES);
  });
});
