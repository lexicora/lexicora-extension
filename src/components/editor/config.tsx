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
