import { BlockNoteEditor } from "@blocknote/core";
import { appBlockNoteConfig } from "@/components/editor/config";
import type { BlockNoteBlock } from "@/lib/utils/block-converter";

/**
 * Converts stored blocks to Markdown and HTML without rendering an editor.
 *
 * BlockNote's converters take the blocks to convert as an argument, so a single
 * never-mounted editor can serve every export — including a topic's entries,
 * none of which are on screen. It uses the app's editor config, so custom
 * blocks such as code blocks come out the same as they look in the editor.
 */

type Converter = ReturnType<typeof BlockNoteEditor.create>;
type ConvertibleBlocks = Parameters<Converter["blocksToMarkdownLossy"]>[0];

let converter: Converter | null = null;

// Created on first use rather than at import, so opening a page that could
// export costs nothing until an export actually happens.
function getConverter(): Converter {
  converter ??= BlockNoteEditor.create(appBlockNoteConfig);
  return converter;
}

/** `BlockNoteBlock` is our structural bridge type; BlockNote wants its own, which it satisfies at runtime. */
function asConvertible(blocks: BlockNoteBlock[]): ConvertibleBlocks {
  return blocks as unknown as ConvertibleBlocks;
}

export function blocksToMarkdown(blocks: BlockNoteBlock[]): string {
  if (blocks.length === 0) return "";
  return getConverter().blocksToMarkdownLossy(asConvertible(blocks));
}

export function blocksToHtml(blocks: BlockNoteBlock[]): string {
  if (blocks.length === 0) return "";
  return getConverter().blocksToHTMLLossy(asConvertible(blocks));
}
