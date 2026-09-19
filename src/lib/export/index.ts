import { strToU8, zipSync, type Zippable } from "fflate";
import type { RxCollection } from "rxdb";

import type { BlockDocType } from "@/db/schemas/block";
import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";
import {
  convertDbBlocksToBlockNote,
  type BlockNoteBlock,
} from "@/lib/utils/block-converter";

import { blocksToHtml, blocksToMarkdown } from "./blocks";
import { writeRichClipboard } from "./clipboard";
import { downloadBlob } from "./download";
import {
  entryToClipboardHtml,
  entryToClipboardMarkdown,
  entryToMarkdownFile,
  escapeLinkText,
  reserveFilename,
  toSafeFilename,
  topicToClipboardHtml,
  topicToClipboardMarkdown,
  topicToMarkdownFile,
} from "./format";

/**
 * Export actions for entries and topics: rich copy and Markdown download.
 *
 * The formats themselves live in `./format`; this module gathers the data,
 * converts blocks and hands the result to the clipboard or a download.
 */

const MARKDOWN_TYPE = "text/markdown;charset=utf-8";

/** Collections a topic export reads. `null` matches `useRxCollection` before the db is ready. */
export interface ExportCollections {
  entries?: RxCollection | null;
  blocks?: RxCollection | null;
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

/**
 * Copies an entry as HTML plus Markdown in one clipboard item. With
 * `contentOnly`, only the editor content is copied, without the header.
 */
export async function copyEntry(
  entry: EntryDocType,
  topic: TopicDocType | null,
  blocks: BlockNoteBlock[],
  { contentOnly = false }: { contentOnly?: boolean } = {},
): Promise<void> {
  const topicName = topic?.name ?? null;
  await writeRichClipboard({
    text: entryToClipboardMarkdown(
      { entry, topicName, contentMarkdown: blocksToMarkdown(blocks) },
      { contentOnly },
    ),
    html: entryToClipboardHtml(
      { entry, topicName, contentHtml: blocksToHtml(blocks) },
      { contentOnly },
    ),
  });
}

/** Downloads an entry as a single `.md` note named after its title. */
export function downloadEntry(
  entry: EntryDocType,
  topic: TopicDocType | null,
  blocks: BlockNoteBlock[],
): void {
  const markdown = entryToMarkdownFile({
    entry,
    topicName: topic?.name ?? null,
    contentMarkdown: blocksToMarkdown(blocks),
  });
  downloadBlob(
    new Blob([markdown], { type: MARKDOWN_TYPE }),
    reserveFilename(entry.title, "md", new Set()),
  );
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

/**
 * Every entry in the topic, archived ones included — an export is the user's
 * data leaving the app, so nothing is silently dropped. Archived notes are
 * marked `archived: true` in their front matter instead. Newest first, as the
 * library lists them.
 */
async function loadTopicEntries(
  topicId: string,
  entries: RxCollection,
): Promise<EntryDocType[]> {
  const docs = await entries.find({ selector: { topicId } }).exec();
  return docs
    .map((doc) => doc.toJSON() as EntryDocType)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Loads every block of the given entries in one query, grouped per entry. */
async function loadBlocksByEntry(
  entryIds: string[],
  blocks: RxCollection,
): Promise<Map<string, BlockNoteBlock[]>> {
  const byEntry = new Map<string, BlockDocType[]>();
  if (entryIds.length > 0) {
    const docs = await blocks
      .find({ selector: { entryId: { $in: entryIds } } })
      .exec();
    for (const doc of docs) {
      const block = doc.toJSON() as BlockDocType;
      const group = byEntry.get(block.entryId) ?? [];
      group.push(block);
      byEntry.set(block.entryId, group);
    }
  }

  return new Map(
    [...byEntry].map(([id, group]) => [id, convertDbBlocksToBlockNote(group)]),
  );
}

/**
 * Copies a topic's header and the list of its entries, each linked to its
 * source. Entry content is left out on purpose: a whole topic on the clipboard
 * is rarely what anyone wants to paste — the download is the full export.
 */
export async function copyTopic(
  topic: TopicDocType,
  { entries }: ExportCollections,
): Promise<void> {
  const topicEntries = entries ? await loadTopicEntries(topic.id, entries) : [];
  await writeRichClipboard({
    text: topicToClipboardMarkdown(topic, topicEntries),
    html: topicToClipboardHtml(topic, topicEntries),
  });
}

function toDate(iso: string): Date {
  const date = new Date(iso);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Builds a topic's zip archive: one folder named after the topic, holding an
 * index note for the topic and one note per entry, linked from the index.
 *
 * The topic note claims its name first, so an entry with the same title is the
 * one that becomes "Title (2).md". Each file's modification time is its
 * record's `updatedAt`, so sorting the folder by date in a file manager or vault
 * matches Lexicora.
 */
export function buildTopicFolder(
  topic: TopicDocType,
  entries: EntryDocType[],
  blocksByEntry: Map<string, BlockNoteBlock[]>,
): Zippable {
  const used = new Set<string>();
  const topicFilename = reserveFilename(topic.name, "md", used);
  const entryFiles = entries.map((entry) => ({
    entry,
    filename: reserveFilename(entry.title, "md", used),
  }));

  const folder: Zippable = {};
  for (const { entry, filename } of entryFiles) {
    const markdown = entryToMarkdownFile({
      entry,
      topicName: topic.name,
      contentMarkdown: blocksToMarkdown(blocksByEntry.get(entry.id) ?? []),
    });
    folder[filename] = [strToU8(markdown), { mtime: toDate(entry.updatedAt) }];
  }
  folder[topicFilename] = [
    strToU8(topicToMarkdownFile(topic, entryFiles)),
    { mtime: toDate(topic.updatedAt) },
  ];

  return folder;
}

export function buildTopicArchive(
  topic: TopicDocType,
  entries: EntryDocType[],
  blocksByEntry: Map<string, BlockNoteBlock[]>,
): Uint8Array<ArrayBuffer> {
  return zipSync(
    { [toSafeFilename(topic.name)]: buildTopicFolder(topic, entries, blocksByEntry) },
    { level: 6 },
  );
}

/** Downloads a topic and all its entries as a zip of Markdown notes. */
export async function downloadTopic(
  topic: TopicDocType,
  { entries, blocks }: ExportCollections,
): Promise<void> {
  const topicEntries = entries ? await loadTopicEntries(topic.id, entries) : [];
  const blocksByEntry = blocks
    ? await loadBlocksByEntry(
        topicEntries.map((e) => e.id),
        blocks,
      )
    : new Map<string, BlockNoteBlock[]>();

  const archive = buildTopicArchive(topic, topicEntries, blocksByEntry);
  downloadBlob(
    new Blob([archive], { type: "application/zip" }),
    `${toSafeFilename(topic.name)}.zip`,
  );
}

// ---------------------------------------------------------------------------
// The whole library
// ---------------------------------------------------------------------------

/** Reserves a folder name, numbering clashes the way file names are numbered. */
function reserveFolder(name: string, used: Set<string>): string {
  const base = toSafeFilename(name);
  let candidate = base;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) {
    candidate = `${base} (${n})`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/** The archive's index note: every topic, linked to its own note. */
function libraryIndexMarkdown(
  topics: Array<{ topic: TopicDocType; folder: string; filename: string }>,
): string {
  const lines = [
    "# Lexicora library",
    "",
    `${topics.length} ${topics.length === 1 ? "topic" : "topics"}, exported ${new Date().toLocaleString()}.`,
    "",
  ];
  for (const { topic, folder, filename } of topics) {
    const target = `${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    lines.push(`- [${escapeLinkText(topic.name)}](${target})`);
  }
  return `${lines.join("\n")}\n`;
}

export interface LibraryExportProgress {
  /** Topics finished so far. */
  done: number;
  total: number;
}

/**
 * Downloads the whole library as one zip: a folder per topic, each holding its
 * topic note and one note per entry, plus an index note listing the topics.
 *
 * Built a topic at a time rather than loading everything first, so memory
 * stays bounded by the largest topic and progress can be reported — a library
 * of any size takes a while, and the caller shows that.
 */
export async function downloadLibrary(
  { topics, entries, blocks }: ExportCollections & { topics?: RxCollection | null },
  onProgress?: (progress: LibraryExportProgress) => void,
): Promise<number> {
  if (!topics) return 0;

  const topicDocs = (await topics.find().exec())
    .map((doc) => doc.toJSON() as TopicDocType)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (topicDocs.length === 0) return 0;

  const archive: Zippable = {};
  const usedFolders = new Set<string>();
  const index: Array<{ topic: TopicDocType; folder: string; filename: string }> = [];

  for (const [position, topic] of topicDocs.entries()) {
    const topicEntries = entries ? await loadTopicEntries(topic.id, entries) : [];
    const blocksByEntry = blocks
      ? await loadBlocksByEntry(
          topicEntries.map((entry) => entry.id),
          blocks,
        )
      : new Map<string, BlockNoteBlock[]>();

    const folder = reserveFolder(topic.name, usedFolders);
    const contents = buildTopicFolder(topic, topicEntries, blocksByEntry);
    archive[folder] = contents;

    // The topic note is the one named after the topic, which buildTopicFolder
    // reserves first — so it survives an entry of the same name.
    index.push({
      topic,
      folder,
      filename: `${toSafeFilename(topic.name)}.md`,
    });
    onProgress?.({ done: position + 1, total: topicDocs.length });
  }

  archive["Lexicora library.md"] = [
    strToU8(libraryIndexMarkdown(index)),
    { mtime: new Date() },
  ];

  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "_")
    .replace(/:/g, "-");
  downloadBlob(
    new Blob([zipSync(archive, { level: 6 })], { type: "application/zip" }),
    `lexicora-markdown-${timestamp}.zip`,
  );

  return topicDocs.length;
}
