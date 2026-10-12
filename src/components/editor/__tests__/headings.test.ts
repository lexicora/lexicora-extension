import { describe, it, expect } from "vitest";

import {
  collectHeadings,
  headingDepths,
  inlineText,
  type HeadingItem,
} from "@/components/editor/headings";

/**
 * The heading map lists an entry's headings and indents them by level. These
 * cover what it lists and how far each one is indented.
 */

const heading = (id: string, level: number, content: unknown) => ({
  id,
  type: "heading",
  props: { level },
  content,
});

describe("inlineText", () => {
  it("joins styled text and links", () => {
    expect(
      inlineText([
        { type: "text", text: "Read ", styles: { bold: true } },
        {
          type: "link",
          href: "https://example.com",
          content: [{ type: "text", text: "this", styles: {} }],
        },
      ]),
    ).toBe("Read this");
  });
});

describe("collectHeadings", () => {
  it("lists headings in document order, nested ones included", () => {
    const blocks = [
      heading("a", 1, [{ type: "text", text: "Intro", styles: {} }]),
      {
        id: "p",
        type: "paragraph",
        content: [],
        children: [heading("b", 2, [{ type: "text", text: "Nested", styles: {} }])],
      },
      heading("c", 2, [{ type: "text", text: "Next", styles: {} }]),
    ];

    expect(collectHeadings(blocks)).toEqual([
      { id: "a", level: 1, text: "Intro" },
      { id: "b", level: 2, text: "Nested" },
      { id: "c", level: 2, text: "Next" },
    ]);
  });

  it("leaves out empty headings and collapses whitespace", () => {
    const blocks = [
      heading("a", 1, []),
      heading("b", 2, [{ type: "text", text: "  Two\n words ", styles: {} }]),
    ];

    expect(collectHeadings(blocks)).toEqual([
      { id: "b", level: 2, text: "Two words" },
    ]);
  });
});

describe("headingDepths", () => {
  const levels = (...values: number[]): HeadingItem[] =>
    values.map((level, i) => ({ id: String(i), level, text: "x" }));

  it("counts from the highest level present", () => {
    expect(headingDepths(levels(2, 3, 3, 2))).toEqual([0, 1, 1, 0]);
  });

  it("indents a skipped level one step", () => {
    expect(headingDepths(levels(1, 4, 2, 3))).toEqual([0, 1, 1, 2]);
  });

  it("keeps a heading above the first one's level at the left", () => {
    expect(headingDepths(levels(3, 1, 2))).toEqual([0, 0, 1]);
  });
});
