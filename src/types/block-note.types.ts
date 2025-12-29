import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

export const defaultBlockNoteConfig = {
  schema: BlockNoteSchema.create().extend({
    blockSpecs: {
      codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
  }),
  tables: {
    headers: true, // MAYBE TODO: Add more customization options for tables later
  },
  domAttributes: {
    // Adds a class to all `blockContainer` elements.
    // inlineContent: {
    //   class: "bn-code-bg",
    // },
    block: {
      class: "bn-table-header bn-code-content", //TODO: Change later: bn-table-border
    },
  },
};
