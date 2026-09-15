import type { BlockDocType } from "@/db/schemas/block";

/**
 * Works out the smallest set of writes that brings an entry's stored blocks in
 * line with what the editor now holds.
 *
 * Saving used to rewrite every block, which gave each a new revision even when
 * nothing about it had changed — wasted writes now, and changes to replicate
 * later.
 */

/**
 * The parts of a block that decide whether it needs writing. `id` is excluded
 * (it is the identity), as are `entryId` and `userId`, which cannot change
 * without the block belonging somewhere else entirely.
 */
function fingerprint(block: Partial<BlockDocType>): string {
  return JSON.stringify([
    block.type ?? null,
    block.order ?? null,
    block.parentBlockId ?? null,
    block.propsJson ?? null,
    block.contentJson ?? null,
  ]);
}

/**
 * The blocks that are new or actually different. Comparison is by serialised
 * value, so a difference in property order counts as a change: that writes a
 * block needlessly, which is what happened to every block before — never the
 * other way round, which would lose an edit.
 */
export function pickChangedBlocks(
  next: BlockDocType[],
  existing: BlockDocType[],
): BlockDocType[] {
  const before = new Map(existing.map((block) => [block.id, fingerprint(block)]));
  return next.filter((block) => before.get(block.id) !== fingerprint(block));
}

/** Stored blocks the editor no longer has: deleted, or replaced by a new id. */
export function findOrphanedBlocks<T extends { id: string }>(
  next: BlockDocType[],
  existing: T[],
): T[] {
  const keep = new Set(next.map((block) => block.id));
  return existing.filter((block) => !keep.has(block.id));
}
