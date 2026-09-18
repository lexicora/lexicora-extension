import { describe, it, expect } from "vitest";
import { BlockNoteEditor } from "@blocknote/core";

import { appBlockNoteConfig } from "@/components/editor/config";

/**
 * Covers the alert block's trips in and out of the editor: what copy and the
 * app's exports produce (GitHub alert Markdown), and what pasting GitHub or
 * Obsidian alerts produces (an alert block, not a quote).
 */

// The app's schema extends BlockNote's default one, which the generic options
// type does not follow; the editor itself behaves the same either way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = BlockNoteEditor<any, any, any>;

function createEditor(): AnyEditor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return BlockNoteEditor.create(appBlockNoteConfig as any);
}

function textOf(block: { content?: unknown }): string {
  return (block.content as { text?: string }[])
    .map((inline) => inline.text ?? "")
    .join("");
}

describe("alert block export", () => {
  it("writes GitHub alert Markdown: marker line, then the message", () => {
    const editor = createEditor();
    const markdown = editor.blocksToMarkdownLossy([
      { type: "alert", props: { type: "warning" }, content: "Mind the gap" },
    ]);
    expect(markdown).toBe("> [!WARNING]\n> Mind the gap\n");
  });

  it("defaults to a note", () => {
    const editor = createEditor();
    const markdown = editor.blocksToMarkdownLossy([
      { type: "alert", content: "Just so you know" },
    ]);
    expect(markdown).toBe("> [!NOTE]\n> Just so you know\n");
  });

  it("keeps inline formatting in the message", () => {
    const editor = createEditor();
    const markdown = editor.blocksToMarkdownLossy([
      {
        type: "alert",
        props: { type: "tip" },
        content: [
          { type: "text", text: "Use ", styles: {} },
          { type: "text", text: "bold", styles: { bold: true } },
          { type: "text", text: " sparingly", styles: {} },
        ],
      },
    ]);
    expect(markdown).toBe("> [!TIP]\n> Use **bold** sparingly\n");
  });

  it("sits between other blocks without merging into them", () => {
    const editor = createEditor();
    const markdown = editor.blocksToMarkdownLossy([
      { type: "paragraph", content: "Before" },
      { type: "alert", props: { type: "caution" }, content: "Careful" },
      { type: "paragraph", content: "After" },
    ]);
    expect(markdown).toBe("Before\n\n> [!CAUTION]\n> Careful\n\nAfter\n");
  });

  it("exports HTML as a marked blockquote", () => {
    const editor = createEditor();
    const html = editor.blocksToHTMLLossy([
      { type: "alert", props: { type: "important" }, content: "Read this" },
    ]);
    expect(html).toContain('<blockquote data-alert-type="important"');
    expect(html).toContain("[!IMPORTANT]");
    expect(html).toContain("Read this");
  });
});

describe("alert block parsing", () => {
  it("turns GitHub alert Markdown into an alert block", async () => {
    const editor = createEditor();
    const blocks = await editor.tryParseMarkdownToBlocks(
      "> [!IMPORTANT]\n> Read this first\n",
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.type).toBe("alert");
    expect(blocks[0]!.props.type).toBe("important");
    expect(textOf(blocks[0]!)).toBe("Read this first");
  });

  it("reads Obsidian's lowercase callout marker", async () => {
    const editor = createEditor();
    const blocks = await editor.tryParseMarkdownToBlocks(
      "> [!warning]\n> Mind the gap\n",
    );
    expect(blocks[0]!.type).toBe("alert");
    expect(blocks[0]!.props.type).toBe("warning");
    expect(textOf(blocks[0]!)).toBe("Mind the gap");
  });

  it("turns GitHub's rendered alert HTML into an alert block", async () => {
    const editor = createEditor();
    const blocks = await editor.tryParseHTMLToBlocks(
      '<div class="markdown-alert markdown-alert-caution">' +
        '<p class="markdown-alert-title">Caution</p>' +
        "<p>Danger ahead</p></div>",
    );
    expect(blocks[0]!.type).toBe("alert");
    expect(blocks[0]!.props.type).toBe("caution");
    expect(textOf(blocks[0]!)).toBe("Danger ahead");
  });

  it("leaves an ordinary quote alone", async () => {
    const editor = createEditor();
    const blocks = await editor.tryParseMarkdownToBlocks("> Just a quote\n");
    expect(blocks[0]!.type).toBe("quote");
    expect(textOf(blocks[0]!)).toBe("Just a quote");
  });

  it("round-trips through Markdown", async () => {
    const editor = createEditor();
    const markdown = editor.blocksToMarkdownLossy([
      { type: "alert", props: { type: "tip" }, content: "Try the slash menu" },
    ]);
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    expect(blocks[0]!.type).toBe("alert");
    expect(blocks[0]!.props.type).toBe("tip");
    expect(textOf(blocks[0]!)).toBe("Try the slash menu");
  });

  it("round-trips through its own HTML", async () => {
    const editor = createEditor();
    const html = editor.blocksToHTMLLossy([
      { type: "alert", props: { type: "note" }, content: "Hello" },
    ]);
    const blocks = await editor.tryParseHTMLToBlocks(html);
    expect(blocks[0]!.type).toBe("alert");
    expect(blocks[0]!.props.type).toBe("note");
    expect(textOf(blocks[0]!)).toBe("Hello");
  });
});
