import { uuidv7 } from "uuidv7";
import { type BlockDocType } from "@/db/schemas/block";

/**
 * Recursively converts BlockNote.js blocks to RxDB BlockDocType documents.
 *
 * @param blocks - The array of blocks from BlockNote.js
 * @param entryId - The ID of the entry these blocks belong to
 * @param userId - The ID of the user (defaults to nil UUID if not provided)
 * @param parentBlockId - The ID of the parent block, if these are nested children
 * @param startIndex - The starting order index for these blocks
 * @returns A flat array of BlockDocType objects ready for bulk insert
 */
export function convertBlockNoteBlocks(
  blocks: any[],
  entryId: string,
  userId: string = "00000000-0000-0000-0000-000000000000",
  parentBlockId?: string,
  startIndex: number = 0,
): BlockDocType[] {
  // At the top-level call, guard against BlockNote returning a partially-flattened
  // document where child blocks appear both inside their parent's .children array
  // AND at the top level of the array. Pre-filter to keep only blocks that are not
  // already captured as descendants of another block in the same input array.
  let effectiveBlocks = blocks;
  if (parentBlockId === undefined) {
    const descendantIds = new Set<string>();
    const collectDescendantIds = (list: any[]) => {
      for (const b of list) {
        if (b.children?.length) {
          for (const child of b.children) {
            if (child.id) descendantIds.add(child.id);
          }
          collectDescendantIds(b.children);
        }
      }
    };
    collectDescendantIds(blocks);
    if (descendantIds.size > 0) {
      effectiveBlocks = blocks.filter((b) => !descendantIds.has(b.id));
    }
  }

  let result: BlockDocType[] = [];
  let order = startIndex;

  for (const block of effectiveBlocks) {
    // BlockNote assigns UUIDv4 to new blocks; existing blocks retain their UUIDv7.
    // Version nibble sits at index 14 of the UUID string (xxxxxxxx-xxxx-Mxxx-...).
    // Re-use the v7 ID for updates; mint a fresh v7 for brand-new blocks.
    const blockId =
      block.id && block.id.length >= 15 && block.id[14] === "7"
        ? block.id
        : uuidv7();

    const dbBlock: BlockDocType = {
      id: blockId,
      userId,
      entryId,
      order,
      type: block.type,
      propsJson: block.props || {},
      contentJson: block.content || [],
    };

    if (parentBlockId) {
      dbBlock.parentBlockId = parentBlockId;
    }

    result.push(dbBlock);
    order++;

    // Recursively process nested children
    if (
      block.children &&
      Array.isArray(block.children) &&
      block.children.length > 0
    ) {
      const childBlocks = convertBlockNoteBlocks(
        block.children,
        entryId,
        userId,
        blockId,
        0,
      );
      result.push(...childBlocks);
    }
  }

  return result;
}

/**
 * Converts a flat array of BlockDocType documents back to a nested BlockNote.js block structure.
 * Top-level blocks (no parentBlockId) are sorted by order; children are recursively nested.
 */
export function convertDbBlocksToBlockNote(blocks: BlockDocType[]): any[] {
  const childrenMap = new Map<string, BlockDocType[]>();
  const topLevelBlocks: BlockDocType[] = [];

  for (const block of blocks) {
    if (block.parentBlockId) {
      const children = childrenMap.get(block.parentBlockId) ?? [];
      children.push(block);
      childrenMap.set(block.parentBlockId, children);
    } else {
      topLevelBlocks.push(block);
    }
  }

  topLevelBlocks.sort((a, b) => a.order - b.order);
  for (const children of childrenMap.values()) {
    children.sort((a, b) => a.order - b.order);
  }

  function buildBlock(dbBlock: BlockDocType): any {
    const children = (childrenMap.get(dbBlock.id) ?? []).map(buildBlock);
    return {
      id: dbBlock.id,
      type: dbBlock.type,
      props: dbBlock.propsJson,
      content: dbBlock.contentJson ?? [],
      children,
    };
  }

  return topLevelBlocks.map(buildBlock);
}
