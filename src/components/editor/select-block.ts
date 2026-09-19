import {
  getBlockInfo,
  getNodeById,
  type BlockNoteEditor,
} from "@blocknote/core";
import { NodeSelection, TextSelection } from "prosemirror-state";
import { TableMap } from "prosemirror-tables";

/**
 * Selects the whole content of one block, without its nested children, so
 * the formatting toolbar opens over it.
 *
 * BlockNote's own `setSelection` only spans two different blocks, so this
 * follows its logic for a single one: text blocks get a text selection,
 * tables one from the first cell to the last (turned into a cell selection
 * by the table plugin), and blocks without text, like images, a node
 * selection. Returns whether anything was selected.
 */
export function selectBlock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>,
  blockId: string,
): boolean {
  return editor.transact((tr) => {
    const posInfo = getNodeById(blockId, tr.doc);
    if (!posInfo) return false;

    const info = getBlockInfo(posInfo);
    if (!info.isBlockContainer) return false;

    const { node, beforePos, afterPos } = info.blockContent;
    const content = editor.schema.blockSchema[info.blockNoteType]?.content;

    if (content === "none") {
      tr.setSelection(NodeSelection.create(tr.doc, beforePos));
    } else if (content === "table") {
      const map = TableMap.get(node);
      const firstCellPos = beforePos + 1 + map.positionAt(0, 0, node);
      const lastCellPos =
        beforePos + 1 + map.positionAt(map.height - 1, map.width - 1, node);
      const lastCellSize = tr.doc.resolve(lastCellPos).nodeAfter!.nodeSize;
      tr.setSelection(
        TextSelection.create(
          tr.doc,
          firstCellPos + 2,
          lastCellPos + lastCellSize - 2,
        ),
      );
    } else {
      tr.setSelection(
        TextSelection.create(tr.doc, beforePos + 1, afterPos - 1),
      );
    }
    return true;
  });
}
