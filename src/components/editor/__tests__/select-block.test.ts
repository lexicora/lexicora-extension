import { describe, it, expect, afterEach } from "vitest";
import { BlockNoteEditor } from "@blocknote/core";
import { NodeSelection } from "prosemirror-state";

import { appBlockNoteConfig } from "@/components/editor/config";
import { selectBlock } from "@/components/editor/select-block";

/**
 * Covers `selectBlock`, run by a right click on the drag handle to select a
 * block's content and open the formatting toolbar over it.
 */

let host: HTMLElement | undefined;

afterEach(() => host?.remove());

async function createEditor(initialContent: unknown[]) {
  host = document.createElement("div");
  document.body.appendChild(host);
  // The app's schema extends BlockNote's default one, which the generic options
  // type does not follow; the editor itself behaves the same either way.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editor: BlockNoteEditor<any, any, any> = BlockNoteEditor.create({
    ...appBlockNoteConfig,
    initialContent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  editor.mount(host);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return editor;
}

describe("selectBlock", () => {
  it("selects all text of a block, but not its children", async () => {
    const editor = await createEditor([
      { type: "paragraph", content: "Before" },
      {
        type: "paragraph",
        content: "Target text",
        children: [{ type: "paragraph", content: "Child" }],
      },
    ]);
    const target = editor.document[1]!;

    expect(selectBlock(editor, target.id)).toBe(true);
    expect(editor.getSelectedText()).toBe("Target text");
  });

  it("selects a block without text as a node", async () => {
    const editor = await createEditor([
      { type: "image", props: { url: "https://example.com/a.png" } },
    ]);

    expect(selectBlock(editor, editor.document[0]!.id)).toBe(true);
    const selection = editor.prosemirrorState.selection;
    expect(selection).toBeInstanceOf(NodeSelection);
    expect((selection as NodeSelection).node.type.name).toBe("image");
  });

  it("does nothing for an unknown block", async () => {
    const editor = await createEditor([{ type: "paragraph", content: "Text" }]);

    expect(selectBlock(editor, "missing")).toBe(false);
  });
});
