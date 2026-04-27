import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

codeBlockOptions.defaultLanguage = "text";
// MAYBE: Order languages, by letters.
// const codeBlockConfig = {
//   ...codeBlockOptions,
//   // MAYBE: Make default language configurable from outside
//   indentLineWithTab: true,
// };
// MAYBE: Add more languages

export const appBlockNoteConfig = {
  schema: BlockNoteSchema.create().extend({
    blockSpecs: {
      codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
  }),
  tables: {
    headers: true, // MAYBE TODO: Add more customization options for tables later
    cellBackgroundColor: true,
    //cellTextColor: true,
  },
  domAttributes: {
    // Adds a class to all `blockContainer` elements.
    // inlineContent: {
    //   class: "bn-code-bg",
    // },
    block: {
      class: "bn-table-content bn-code-content", //TODO: Change later: bn-table-border
      // TODO MAYBE: Use only one (or none at all) class for all custom styling with tailored CSS selectors
    },
  },
};

// import { BlockNoteEditor } from "@blocknote/core";
// import {
//   filterSuggestionItems,
//   insertOrUpdateBlockForSlashMenu,
// } from "@blocknote/core/extensions";
// import {
//   DefaultReactSuggestionItem,
//   getDefaultReactSlashMenuItems,
//   SuggestionMenuController,
//   useCreateBlockNote,
// } from "@blocknote/react";
// import { LucideCode } from "lucide-react";

// const insertInlineCodeItem = (editor: BlockNoteEditor) => ({
//   title: "Inline Code",
//   onItemClick: () =>
//     insertOrUpdateBlockForSlashMenu(editor, {
//       type: "paragraph",
//       content: [{ type: "text", text: "", styles: { code: true } }],
//     }),
//   aliases: ["inlinecode", "inc"],
//   group: "Basic blocks",
//   icon: <LucideCode size={18} />,
//   subtext: "Inline code block",
// });
// // List containing all default Slash Menu Items, as well as our custom one.
// export const getCustomSlashMenuItems = (
//   editor: BlockNoteEditor,
// ): DefaultReactSuggestionItem[] => [
//   ...getDefaultReactSlashMenuItems(editor),
//   insertInlineCodeItem(editor),
// ];
