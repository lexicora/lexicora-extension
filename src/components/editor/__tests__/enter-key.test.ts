import { describe, it, expect } from "vitest";
import { BlockNoteEditor } from "@blocknote/core";

import { appBlockNoteConfig } from "@/components/editor/config";
import { installInputModality } from "@/lib/input-modality";

/**
 * Covers pressing Enter in the editor, which once silently did nothing.
 *
 * The cause was two copies of prosemirror-model installed side by side. They
 * recognise each other's nodes by `instanceof`, so building a node with one
 * and handing it to the other throws — and Enter builds a new block, while
 * plain typing does not, which is why only Enter broke. The copies are forced
 * into one by `overrides` in package.json; this fails if they come apart again.
 */

async function pressEnterAtEnd({ trackModality }: { trackModality: boolean }) {
  const uninstall = trackModality ? installInputModality() : () => {};
  const host = document.createElement("div");
  document.body.appendChild(host);

  // The app's schema extends BlockNote's default one, which the generic options
  // type does not follow; the editor itself behaves the same either way.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editor: BlockNoteEditor<any, any, any> = BlockNoteEditor.create({
    ...appBlockNoteConfig,
    initialContent: [{ type: "paragraph", content: "First line" }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  editor.mount(host);
  await new Promise((resolve) => setTimeout(resolve, 0));

  editor.focus();
  editor.setTextCursorPosition(editor.document[0]!, "end");
  const before = editor.document.length;

  const view = (editor as unknown as { prosemirrorView?: { dom: HTMLElement } })
    .prosemirrorView;
  view!.dom.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    } as KeyboardEventInit),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  const after = editor.document.length;

  uninstall();
  host.remove();
  return { before, after };
}

describe("Enter in the editor", () => {
  it("creates a new block", async () => {
    const { before, after } = await pressEnterAtEnd({ trackModality: false });

    expect(after).toBe(before + 1);
  });

  it("still does with the focus-ring modality tracking installed", async () => {
    // The listener sees every keypress, Enter included, so it was the first
    // suspect; it only sets an attribute and must never block the key.
    const { before, after } = await pressEnterAtEnd({ trackModality: true });

    expect(after).toBe(before + 1);
  });
});
