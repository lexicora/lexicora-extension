import {
  BlockNoteSchema,
  createCodeBlockSpec,
  type CodeBlockOptions,
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

// MAYBE: Order languages, by letters.
// MAYBE: Add more languages
const codeBlockConfig = {
  ...codeBlockOptions,
  // MAYBE: Make default language configurable from outside
  defaultLanguage: "text",
  // indentLineWithTab: true,
  // BlockNote 0.52 colours code with the highlighter's first theme only,
  // github-dark, whatever the editor's colour scheme. Asking Shiki for both
  // themes gives every token its two colours as `--shiki-light` and
  // `--shiki-dark`, and styles.css picks one per scheme. BlockNote 0.55 does
  // this on its own once a light and a dark theme are loaded, so the wrapper
  // can go with that upgrade.
  createHighlighter: async () => {
    const highlighter = await codeBlockOptions.createHighlighter();
    const codeToTokens = highlighter.codeToTokens;
    highlighter.codeToTokens = (code, options) =>
      codeToTokens(code, {
        lang: options.lang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
    return highlighter;
  },
} satisfies CodeBlockOptions;

export const appBlockNoteConfig = {
  schema: BlockNoteSchema.create().extend({
    blockSpecs: {
      codeBlock: createCodeBlockSpec(codeBlockConfig),
      alert: createAlertBlockSpec(),
    },
  }),
  extensions: [WebContentDropExtension()],
  tables: {
    headers: true, // MAYBE: Add more customization options for tables later
    cellBackgroundColor: true,
    //cellTextColor: true,
  },
  domAttributes: {
    // Adds a class to all `blockContainer` elements.
    // inlineContent: {
    //   class: "bn-code-bg",
    // },
    block: {
      // One marker on every block, which the custom rules in styles.css hang
      // on, so they only reach an editor of ours. It was two classes,
      // bn-table-content and bn-code-content, that always appeared together
      // and were therefore interchangeable.
      class: "bn-lc-adjustments",
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
