import {
  BlockNoteSchema,
  createCodeBlockSpec,
} from "@blocknote/core";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { codeBlockOptions } from "@blocknote/code-block";
import {
  blockTypeSelectItems,
  getDefaultReactSlashMenuItems,
  type BlockTypeSelectItem,
  type DefaultReactSuggestionItem,
} from "@blocknote/react";
import { TriangleAlert } from "lucide-react";

import { createAlertBlockSpec } from "./blocks/alert/alert-block";
import { WebContentDropExtension } from "./extensions/web-content-drop";

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
      alert: createAlertBlockSpec(),
    },
  }),
  extensions: [WebContentDropExtension()],
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

/** The editor type every page creates from `appBlockNoteConfig`. */
export type AppBlockNoteEditor =
  typeof appBlockNoteConfig.schema.BlockNoteEditor;

// The alert is not in BlockNote's dictionary, so its labels live here.
const alertItem = {
  title: "Alert",
  subtext: "Note, tip, warning or similar callout",
  aliases: [
    "alert",
    "callout",
    "note",
    "tip",
    "important",
    "warning",
    "caution",
  ],
  icon: TriangleAlert,
};

/** Slash Menu: the default items, with the alert closing the basic blocks. */
export function getCustomSlashMenuItems(
  editor: AppBlockNoteEditor,
): DefaultReactSuggestionItem[] {
  const items = getDefaultReactSlashMenuItems(editor);
  const basicBlocksGroup = editor.dictionary.slash_menu.quote.group;
  const lastBasicBlock = items.findLastIndex(
    (item) => item.group === basicBlocksGroup,
  );

  items.splice(lastBasicBlock + 1, 0, {
    title: alertItem.title,
    subtext: alertItem.subtext,
    aliases: alertItem.aliases,
    group: basicBlocksGroup,
    icon: <alertItem.icon size={18} />,
    // Turns an empty block into an alert, otherwise inserts one below.
    onItemClick: () =>
      insertOrUpdateBlockForSlashMenu(editor, { type: "alert" }),
  });

  return items;
}

/** Formatting Toolbar's block type select: the default items plus the alert. */
export function getBlockTypeSelectItems(
  editor: AppBlockNoteEditor,
): BlockTypeSelectItem[] {
  return [
    ...blockTypeSelectItems(editor.dictionary),
    { name: alertItem.title, type: "alert", icon: alertItem.icon },
  ];
}

// MAYBE: Slash menu item for inline code, kept from an earlier experiment.
// import { LucideCode } from "lucide-react";
// const insertInlineCodeItem = (editor: AppBlockNoteEditor) => ({
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
