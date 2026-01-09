import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

codeBlockOptions.defaultLanguage = "text";
// const codeBlockConfig = {
//   ...codeBlockOptions,
//   // MAYBE: Make default language configurable from outside
//   indentLineWithTab: true,
// };
// MAYBE: Add more languages

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
      class: "bn-table-content bn-code-content", //TODO: Change later: bn-table-border
      // TODO MAYBE: Use only one class for all custom styling with tailored CSS selectors
    },
  },
};
