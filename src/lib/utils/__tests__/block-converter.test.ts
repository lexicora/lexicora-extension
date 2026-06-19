import { describe, it, expect } from "vitest";
import {
  convertBlockNoteBlocks,
  convertDbBlocksToBlockNote,
} from "../block-converter";
import { BlockDocType } from "@/db/schemas/block";

const ENTRY_ID = "01900000-0000-7000-8000-000000000001";
const USER_ID = "01900000-0000-7000-8000-000000000002";

// A known valid v7 UUID (version nibble at index 14 === "7")
const V7_ID = "01900000-0000-7000-8000-000000000010";
// A known valid v4 UUID (version nibble at index 14 === "4")
const V4_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeDbBlock(
  overrides: Partial<BlockDocType> & { id: string },
): BlockDocType {
  return {
    userId: USER_ID,
    entryId: ENTRY_ID,
    order: 0,
    type: "paragraph",
    propsJson: {},
    contentJson: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// convertBlockNoteBlocks
// ---------------------------------------------------------------------------

describe("convertBlockNoteBlocks", () => {
  it("converts a flat list of blocks", () => {
    const blocks = [
      {
        type: "paragraph",
        props: { textColor: "default" },
        content: [{ type: "text", text: "Hello" }],
        children: [],
      },
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Title" }],
        children: [],
      },
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

    expect(result).toHaveLength(3);
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

  it("preserves existing v7 block IDs", () => {
    const blocks = [
      { id: V7_ID, type: "paragraph", props: {}, content: [], children: [] },
    ];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].id).toBe(V7_ID);
  });

  it("mints a new v7 ID for blocks with a v4 ID", () => {
    const blocks = [
      { id: V4_ID, type: "paragraph", props: {}, content: [], children: [] },
    ];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].id).not.toBe(V4_ID);
    expect(result[0].id[14]).toBe("7");
  });

  it("mints a new v7 ID for blocks with no ID", () => {
    const blocks = [
      { type: "paragraph", props: {}, content: [], children: [] },
    ];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].id).toBeTruthy();
    expect(result[0].id[14]).toBe("7");
  });

  it("top-level blocks do not have parentBlockId set", () => {
    const blocks = [
      { id: V7_ID, type: "paragraph", props: {}, content: [], children: [] },
    ];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].parentBlockId).toBeUndefined();
  });

  it("defaults propsJson to {} when props is absent", () => {
    const blocks = [{ type: "paragraph", content: [], children: [] }];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].propsJson).toEqual({});
  });

  it("defaults contentJson to [] when content is absent", () => {
    const blocks = [{ type: "paragraph", props: {}, children: [] }];
    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);
    expect(result[0].contentJson).toEqual([]);
  });

  it("deduplicates blocks that appear both at top-level and inside a parent's children (partially-flattened BlockNote output)", () => {
    const childId = "01900000-0000-7000-8000-000000000020";
    const blocks = [
      {
        id: "01900000-0000-7000-8000-000000000021",
        type: "bulletListItem",
        props: {},
        content: [],
        children: [
          { id: childId, type: "paragraph", props: {}, content: [], children: [] },
        ],
      },
      // Same child block also appears at the top level
      { id: childId, type: "paragraph", props: {}, content: [], children: [] },
    ];

    const result = convertBlockNoteBlocks(blocks, ENTRY_ID, USER_ID);

    // Should produce 2 records (parent + 1 child), not 3
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("bulletListItem");
    expect(result[1].id).toBe(childId);
    expect(result[1].parentBlockId).toBe(result[0].id);
  });
});

// ---------------------------------------------------------------------------
// convertDbBlocksToBlockNote
// ---------------------------------------------------------------------------

describe("convertDbBlocksToBlockNote", () => {
  it("returns empty array for empty input", () => {
    expect(convertDbBlocksToBlockNote([])).toEqual([]);
  });

  it("converts a single block with no children", () => {
    const db = [makeDbBlock({ id: V7_ID, type: "paragraph", propsJson: { textColor: "default" }, contentJson: [{ type: "text", text: "Hi" }] })];
    const result = convertDbBlocksToBlockNote(db);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(V7_ID);
    expect(result[0].type).toBe("paragraph");
    expect(result[0].props).toEqual({ textColor: "default" });
    expect(result[0].content).toEqual([{ type: "text", text: "Hi" }]);
    expect(result[0].children).toEqual([]);
  });

  it("sorts top-level blocks by order", () => {
    const db = [
      makeDbBlock({ id: "01900000-0000-7000-8000-000000000031", order: 2, type: "heading" }),
      makeDbBlock({ id: "01900000-0000-7000-8000-000000000032", order: 0, type: "paragraph" }),
      makeDbBlock({ id: "01900000-0000-7000-8000-000000000033", order: 1, type: "quote" }),
    ];
    const result = convertDbBlocksToBlockNote(db);

    expect(result.map((b) => b.type)).toEqual(["paragraph", "quote", "heading"]);
  });

  it("nests child blocks under their parent", () => {
    const parentId = "01900000-0000-7000-8000-000000000041";
    const child1Id = "01900000-0000-7000-8000-000000000042";
    const child2Id = "01900000-0000-7000-8000-000000000043";

    const db = [
      makeDbBlock({ id: parentId, order: 0, type: "bulletListItem" }),
      makeDbBlock({ id: child1Id, order: 0, type: "paragraph", parentBlockId: parentId }),
      makeDbBlock({ id: child2Id, order: 1, type: "paragraph", parentBlockId: parentId }),
    ];
    const result = convertDbBlocksToBlockNote(db);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(parentId);
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children![0].id).toBe(child1Id);
    expect(result[0].children![1].id).toBe(child2Id);
  });

  it("sorts children by order independently from top-level order", () => {
    const parentId = "01900000-0000-7000-8000-000000000051";
    const child1Id = "01900000-0000-7000-8000-000000000052";
    const child2Id = "01900000-0000-7000-8000-000000000053";

    const db = [
      makeDbBlock({ id: parentId, order: 0, type: "bulletListItem" }),
      makeDbBlock({ id: child2Id, order: 1, type: "paragraph", parentBlockId: parentId }),
      makeDbBlock({ id: child1Id, order: 0, type: "heading", parentBlockId: parentId }),
    ];
    const result = convertDbBlocksToBlockNote(db);

    expect(result[0].children![0].id).toBe(child1Id);
    expect(result[0].children![1].id).toBe(child2Id);
  });

  it("reconstructs deeply nested blocks (grandchildren)", () => {
    const parentId  = "01900000-0000-7000-8000-000000000061";
    const childId   = "01900000-0000-7000-8000-000000000062";
    const grandchId = "01900000-0000-7000-8000-000000000063";

    const db = [
      makeDbBlock({ id: parentId, order: 0, type: "bulletListItem" }),
      makeDbBlock({ id: childId, order: 0, type: "bulletListItem", parentBlockId: parentId }),
      makeDbBlock({ id: grandchId, order: 0, type: "paragraph", parentBlockId: childId }),
    ];
    const result = convertDbBlocksToBlockNote(db);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].children).toHaveLength(1);
    expect(result[0].children![0].children![0].id).toBe(grandchId);
  });

  it("defaults content to [] when contentJson is undefined", () => {
    const db = [makeDbBlock({ id: V7_ID, contentJson: undefined })];
    const result = convertDbBlocksToBlockNote(db);
    expect(result[0].content).toEqual([]);
  });

  it("handles multiple top-level blocks each with children", () => {
    const p1 = "01900000-0000-7000-8000-000000000071";
    const p2 = "01900000-0000-7000-8000-000000000072";
    const c1 = "01900000-0000-7000-8000-000000000073";
    const c2 = "01900000-0000-7000-8000-000000000074";

    const db = [
      makeDbBlock({ id: p1, order: 0, type: "bulletListItem" }),
      makeDbBlock({ id: p2, order: 1, type: "bulletListItem" }),
      makeDbBlock({ id: c1, order: 0, type: "paragraph", parentBlockId: p1 }),
      makeDbBlock({ id: c2, order: 0, type: "paragraph", parentBlockId: p2 }),
    ];
    const result = convertDbBlocksToBlockNote(db);

    expect(result).toHaveLength(2);
    expect(result[0].children![0].id).toBe(c1);
    expect(result[1].children![0].id).toBe(c2);
  });
});

// ---------------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------------

describe("convertBlockNoteBlocks → convertDbBlocksToBlockNote (round-trip)", () => {
  it("reconstructs the original nested block structure", () => {
    const original = [
      {
        id: V7_ID,
        type: "bulletListItem",
        props: { textColor: "default" },
        content: [],
        children: [
          {
            id: "01900000-0000-7000-8000-000000000081",
            type: "paragraph",
            props: {},
            content: [{ type: "text", text: "child" }],
            children: [],
          },
        ],
      },
      {
        id: "01900000-0000-7000-8000-000000000082",
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Section" }],
        children: [],
      },
    ];

    const dbBlocks = convertBlockNoteBlocks(original, ENTRY_ID, USER_ID);
    const restored = convertDbBlocksToBlockNote(dbBlocks);

    expect(restored).toHaveLength(2);

    expect(restored[0].id).toBe(V7_ID);
    expect(restored[0].type).toBe("bulletListItem");
    expect(restored[0].children).toHaveLength(1);
    expect(restored[0].children![0].type).toBe("paragraph");
    expect(restored[0].children![0].content).toEqual([{ type: "text", text: "child" }]);

    expect(restored[1].id).toBe("01900000-0000-7000-8000-000000000082");
    expect(restored[1].type).toBe("heading");
    expect(restored[1].children).toHaveLength(0);
  });
});
