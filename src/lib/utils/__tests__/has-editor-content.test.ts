import { describe, it, expect } from "vitest";
import { hasEditorContent, type BlockNoteBlock } from "../block-converter";

/**
 * Covers what counts as an entry having content. A fresh editor holds one
 * empty paragraph, so "has blocks" is not the same as "has content" — the home
 * page says "Already bookmarked" rather than "Already captured" when there is
 * none, and the detail page hides its editor.
 */

const paragraph = (text?: string): BlockNoteBlock => ({
  type: "paragraph",
  content: text ? [{ type: "text", text, styles: {} }] : [],
  children: [],
});

describe("hasEditorContent", () => {
  it("is false for a bookmark, which has no blocks at all", () => {
    expect(hasEditorContent([])).toBe(false);
    expect(hasEditorContent(null)).toBe(false);
    expect(hasEditorContent(undefined)).toBe(false);
  });

  it("is false for the empty paragraph a fresh editor starts with", () => {
    expect(hasEditorContent([paragraph()])).toBe(false);
  });

  it("is true once something is typed", () => {
    expect(hasEditorContent([paragraph("A sentence.")])).toBe(true);
  });

  it("is true for more than one block, even if each looks empty", () => {
    expect(hasEditorContent([paragraph(), paragraph()])).toBe(true);
  });

  it("is true for a lone block that is not a paragraph", () => {
    // An image or a divider carries its content in its props, not its text.
    expect(hasEditorContent([{ type: "image", content: [], children: [] }])).toBe(
      true,
    );
  });

  it("is true for an empty paragraph that nests something", () => {
    expect(
      hasEditorContent([{ ...paragraph(), children: [paragraph("Nested")] }]),
    ).toBe(true);
  });
});
