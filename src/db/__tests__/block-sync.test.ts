import { describe, it, expect } from "vitest";
import type { BlockDocType } from "@/db/schemas/block";
import { findOrphanedBlocks, pickChangedBlocks } from "../block-sync";

/**
 * Covers the block reconciliation on save. Saving used to rewrite every block
 * in the entry; these decide which ones actually need writing.
 */

const NIL = "00000000-0000-0000-0000-000000000000";

function block(id: string, overrides: Partial<BlockDocType> = {}): BlockDocType {
  return {
    id,
    userId: NIL,
    entryId: "e1",
    order: 0,
    type: "paragraph",
    propsJson: { textAlignment: "left" },
    contentJson: [{ type: "text", text: `Text of ${id}`, styles: {} }],
    ...overrides,
  } as BlockDocType;
}

describe("pickChangedBlocks", () => {
  it("writes nothing when the entry was opened and saved untouched", () => {
    const blocks = [block("a"), block("b"), block("c")];

    expect(pickChangedBlocks(blocks, blocks)).toEqual([]);
  });

  it("writes only the edited block", () => {
    const existing = [block("a"), block("b"), block("c")];
    const edited = block("b", {
      contentJson: [{ type: "text", text: "Changed", styles: {} }],
    });

    const changed = pickChangedBlocks([existing[0]!, edited, existing[2]!], existing);

    expect(changed.map((b) => b.id)).toEqual(["b"]);
  });

  it("writes new blocks", () => {
    const existing = [block("a")];

    const changed = pickChangedBlocks([block("a"), block("b")], existing);

    expect(changed.map((b) => b.id)).toEqual(["b"]);
  });

  it("notices a block that only moved", () => {
    // Reordering changes nothing but `order`, which still has to be stored.
    const existing = [block("a", { order: 0 }), block("b", { order: 1 })];
    const reordered = [block("a", { order: 1 }), block("b", { order: 0 })];

    expect(pickChangedBlocks(reordered, existing).map((b) => b.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("notices changes to type, props and nesting", () => {
    const existing = [block("a"), block("b"), block("c")];
    const next = [
      block("a", { type: "heading" }),
      block("b", { propsJson: { textAlignment: "center" } }),
      block("c", { parentBlockId: "a" }),
    ];

    expect(pickChangedBlocks(next, existing).map((b) => b.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("findOrphanedBlocks", () => {
  it("returns the stored blocks the editor no longer has", () => {
    const existing = [block("a"), block("b"), block("c")];

    const orphaned = findOrphanedBlocks([block("a"), block("c")], existing);

    expect(orphaned.map((b) => b.id)).toEqual(["b"]);
  });

  it("returns nothing when every block is still there", () => {
    const existing = [block("a"), block("b")];

    expect(findOrphanedBlocks([block("a"), block("b")], existing)).toEqual([]);
  });

  it("treats a replaced id as an orphan", () => {
    // A block pasted in gets a fresh id, so the old row has to go.
    const existing = [block("old-v4-id")];

    expect(
      findOrphanedBlocks([block("new-v7-id")], existing).map((b) => b.id),
    ).toEqual(["old-v4-id"]);
  });
});
