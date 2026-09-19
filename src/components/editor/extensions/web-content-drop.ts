import { createExtension } from "@blocknote/core";
import { Plugin, TextSelection } from "prosemirror-state";

import { cleanSnippetHTML } from "@/lib/utils/document-parser";

/**
 * Cleans content dragged from a web page into the editor the way a captured
 * selection is cleaned, then pastes it where it was dropped.
 *
 * BlockNote only handles dropped files itself. Anything else falls through
 * to ProseMirror, which inserts the page's HTML as-is, skipping both the
 * document parser and BlockNote's own HTML-to-blocks conversion.
 *
 * Left to the default: blocks dragged within the editor, files, and drops
 * into a code block, which takes plain text only.
 */
export const WebContentDropExtension = createExtension(({ editor }) => ({
  key: "webContentDrop",
  prosemirrorPlugins: [
    new Plugin({
      props: {
        handleDrop(view, event, _slice, moved) {
          const data = event.dataTransfer;
          if (
            !editor.isEditable ||
            moved ||
            view.dragging ||
            !data ||
            data.types.includes("blocknote/html") ||
            data.types.includes("Files")
          ) {
            return false;
          }

          const html = data.getData("text/html");
          const target = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (!html || !target) return false;

          const $target = view.state.doc.resolve(target.pos);
          if ($target.parent.type.spec.code) return false;

          const { content } = cleanSnippetHTML(html);
          // Only what the user could not see was dragged: nothing to insert.
          if (!content.trim()) return true;

          view.dispatch(
            view.state.tr.setSelection(TextSelection.near($target)),
          );
          view.focus();
          editor.pasteHTML(content);
          return true;
        },
      },
    }),
  ],
}));
