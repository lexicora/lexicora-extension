import { describe, it, expect } from "vitest";
import { convertBlockNoteBlocks } from "../block-converter";

const ENTRY_ID = "01900000-0000-7000-8000-000000000001";
const USER_ID = "01900000-0000-7000-8000-000000000002";

describe("convertBlockNoteBlocks", () => {
  it("converts a flat list of blocks", () => {
    const blocks = [
      { type: "paragraph", props: { textColor: "default" }, content: [{ type: "text", text: "Hello" }], children: [] },
      { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Title" }], children: [] },
    ];

    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("paragraph");
    expect(result[0].entryId).toBe(ENTRY_ID);
    expect(result[0].userId).toBe(USER_ID);
    expect(result[0].order).toBe(0);
    expect(result[1].type).toBe("heading");
    expect(result[1].order).toBe(1);
  });

  it("flattens nested children into a flat array", () => {
    const blocks = [
      {
        type: "bulletListItem",
        props: {},
        content: [],
        children: [
          { type: "paragraph", props: {}, content: [], children: [] },
          { type: "paragraph", props: {}, content: [], children: [] },
        ],
      },
    ];

    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);

    expect(result).toHaveLength(3); // parent + 2 children
    const parent = result[0];
    const children = result.slice(1);
    expect(children[0].parentBlockId).toBe(parent.id);
    expect(children[1].parentBlockId).toBe(parent.id);
  });

  it("children have order starting at 0 independent of parent", () => {
    const blocks = [
      {
        type: "bulletListItem",
        props: {},
        content: [],
        children: [
          { type: "paragraph", props: {}, content: [], children: [] },
          { type: "paragraph", props: {}, content: [], children: [] },
        ],
      },
    ];

    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[1].order).toBe(0);
    expect(result[2].order).toBe(1);
  });

  it("uses nil UUID as default userId", () => {
    const blocks = [{ type: "paragraph", props: {}, content: [], children: [] }];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID);
    expect(result[0].userId).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("returns empty array for empty input", () => {
    expect(convertBlockNoteBlocks([], ENTRY_ID, USER_ID)).toEqual([]);
  });

  it("respects startIndex offset", () => {
    const blocks = [
      { type: "paragraph", props: {}, content: [], children: [] },
      { type: "paragraph", props: {}, content: [], children: [] },
    ];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID, undefined, 5);
    expect(result[0].order).toBe(5);
    expect(result[1].order).toBe(6);
  });
});
