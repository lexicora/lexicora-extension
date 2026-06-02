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
  let result: BlockDocType[] = [];
  let order = startIndex;

  for (const block of blocks) {
    const newBlockId = uuidv7();

    const dbBlock: BlockDocType = {
      id: newBlockId,
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
        newBlockId,
        0,
      );
      result.push(...childBlocks);
    }
  }

  return result;
}

// TODO: Implement reverse conversion from BlockDocType array back to BlockNote.js block structure if needed in the future.
// TODO: Also very important recursive blocks must not be in the top level, but rather in the children property, containing child blocks.
//* NOTE: BlockNote.js blocks are standardly given a UUIDv4 id, so we only need to generate an update the id's where the version identifier is 4 and the rest can be left alone.
