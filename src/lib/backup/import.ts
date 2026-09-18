import type { RxCollection } from "rxdb";

import { scheduleCleanup } from "@/db/cleanup";
import { clearAllData } from "@/db/clear-all";

import type { Backup } from "./format";

/**
 * Restoring a backup into the library.
 *
 * The one real decision is what to do with an item that is both in the file
 * and already here. Three answers, chosen by the user:
 *
 * - `merge`: keep whichever copy was edited more recently, by `updatedAt`.
 *   The default — it is what "import my backup on a second machine" means.
 * - `skip`: never touch what is already here; only add what is missing.
 * - `replace`: clear the library first, then import. A true restore.
 *
 * An entry and its notes travel together. When the file's copy of an entry
 * wins, its whole block set replaces the local one; when the local copy wins,
 * the file's blocks for it are ignored. Blocks are never merged one by one —
 * a note that is half old and half new has colliding orders and dangling
 * parents, and is not a note anyone wrote.
 *
 * Not RxDB's json-dump plugin: it refuses a file on any schema-hash mismatch,
 * fails on ids that already exist, and has no merge rule.
 */

export type ImportMode = "merge" | "skip" | "replace";

export interface ImportCollections {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
}

export interface ImportCounts {
  added: number;
  updated: number;
  /** Already here and left alone. */
  skipped: number;
}

export interface ImportResult {
  topics: ImportCounts;
  entries: ImportCounts;
  /** Blocks written. Blocks of skipped entries are not counted. */
  blocks: number;
  /** Entries in the file whose topic is neither in the file nor in the library. */
  orphanedEntries: number;
}

export type ImportStage = "topics" | "entries" | "notes";

export interface ImportProgress {
  stage: ImportStage;
  done: number;
  total: number;
}

/** Documents per bulk write, so a large library is not one giant transaction. */
const WRITE_CHUNK = 200;
/** Entry ids per `$in` query when purging replaced blocks. */
const QUERY_CHUNK = 100;

type Decision = "add" | "update" | "skip";

function isNewer(file: string, local: string): boolean {
  const fileTime = Date.parse(file);
  const localTime = Date.parse(local);
  if (Number.isNaN(localTime)) return true;
  if (Number.isNaN(fileTime)) return false;
  return fileTime > localTime;
}

function decide(
  mode: ImportMode,
  fileUpdatedAt: string,
  localUpdatedAt: string | undefined,
): Decision {
  if (localUpdatedAt === undefined) return "add";
  if (mode === "skip") return "skip";
  // A tie stays local: nothing is gained by rewriting an identical record.
  return isNewer(fileUpdatedAt, localUpdatedAt) ? "update" : "skip";
}

/** The first occurrence of an id wins. RxDB refuses a bulk write that repeats one. */
function dedupeById<T extends { id: string }>(docs: T[]): T[] {
  const seen = new Set<string>();
  return docs.filter((doc) => {
    if (seen.has(doc.id)) return false;
    seen.add(doc.id);
    return true;
  });
}

/** `id → updatedAt` of every live document, which is all a merge needs to know. */
async function loadUpdatedAt(
  collection: RxCollection,
): Promise<Map<string, string>> {
  const docs = await collection.find().exec();
  return new Map(
    docs.map((doc) => {
      const data = doc.toJSON() as { id: string; updatedAt?: string };
      return [data.id, data.updatedAt ?? ""];
    }),
  );
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

/**
 * Upserts in chunks. `bulkUpsert` inserts what is new and rewrites what
 * exists — including a document that was soft-deleted locally, which is the
 * right thing when a backup brings it back. Both paths run the collection's
 * hooks, so `searchBlob` is rebuilt without the file having to carry it.
 */
async function writeChunked<T extends { id: string }>(
  collection: RxCollection,
  docs: T[],
  onChunk: (done: number) => void,
): Promise<void> {
  let done = 0;
  for (const chunk of chunks(docs, WRITE_CHUNK)) {
    const result = await collection.bulkUpsert(chunk);
    if (result.error.length > 0) {
      const first = result.error[0];
      throw new Error(
        `Failed to write ${result.error.length} ${collection.name} (${first?.documentId ?? "?"}: status ${first?.status ?? "?"})`,
      );
    }
    done += chunk.length;
    onChunk(done);
  }
}

async function removeBlocksOf(
  blocks: RxCollection,
  entryIds: string[],
): Promise<void> {
  for (const chunk of chunks(entryIds, QUERY_CHUNK)) {
    await blocks.find({ selector: { entryId: { $in: chunk } } }).remove();
  }
}

export async function importBackup(
  collections: ImportCollections,
  backup: Backup,
  mode: ImportMode,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const { topics, entries, blocks } = collections;

  if (mode === "replace") await clearAllData(collections);

  // After a replace nothing is local, so every record in the file is new.
  const localTopics =
    mode === "replace"
      ? new Map<string, string>()
      : await loadUpdatedAt(topics);
  const localEntries =
    mode === "replace"
      ? new Map<string, string>()
      : await loadUpdatedAt(entries);

  // --- Topics ---
  const topicCounts: ImportCounts = { added: 0, updated: 0, skipped: 0 };
  const fileTopics = dedupeById(backup.topics);
  const topicsToWrite: typeof fileTopics = [];
  for (const topic of fileTopics) {
    const decision = decide(mode, topic.updatedAt, localTopics.get(topic.id));
    if (decision === "add") topicCounts.added++;
    else if (decision === "update") topicCounts.updated++;
    else topicCounts.skipped++;
    if (decision !== "skip") topicsToWrite.push(topic);
  }

  // --- Entries ---
  // A topic exists after this import if it is local or in the file: a skipped
  // file topic is one that is already here. Anything else is an orphan and is
  // left out rather than imported into a topic that does not exist.
  const knownTopics = new Set([
    ...localTopics.keys(),
    ...fileTopics.map((topic) => topic.id),
  ]);
  const entryCounts: ImportCounts = { added: 0, updated: 0, skipped: 0 };
  let orphanedEntries = 0;
  const fileEntries = dedupeById(backup.entries);
  const entriesToWrite: typeof fileEntries = [];
  const replacedEntryIds: string[] = [];
  for (const entry of fileEntries) {
    if (!knownTopics.has(entry.topicId)) {
      orphanedEntries++;
      continue;
    }
    const decision = decide(mode, entry.updatedAt, localEntries.get(entry.id));
    if (decision === "add") entryCounts.added++;
    else if (decision === "update") {
      entryCounts.updated++;
      replacedEntryIds.push(entry.id);
    } else entryCounts.skipped++;
    if (decision !== "skip") entriesToWrite.push(entry);
  }

  // --- Blocks ---
  // Only the notes of entries being written. A replaced entry loses its old
  // blocks first, so its note is never half old, half new.
  const writtenEntryIds = new Set(entriesToWrite.map((entry) => entry.id));
  const blocksToWrite = dedupeById(backup.blocks).filter((block) =>
    writtenEntryIds.has(block.entryId),
  );

  const report = (stage: ImportStage, total: number) => (done: number) =>
    onProgress?.({ stage, done, total });

  const reportTopics = report("topics", topicsToWrite.length);
  reportTopics(0);
  await writeChunked(topics, topicsToWrite, reportTopics);

  const reportEntries = report("entries", entriesToWrite.length);
  reportEntries(0);
  await writeChunked(entries, entriesToWrite, reportEntries);

  const reportNotes = report("notes", blocksToWrite.length);
  reportNotes(0);
  await removeBlocksOf(blocks, replacedEntryIds);
  await writeChunked(blocks, blocksToWrite, reportNotes);

  // The purged blocks are only soft-deleted; fold them into one cleanup.
  if (replacedEntryIds.length > 0) scheduleCleanup(collections);

  return {
    topics: topicCounts,
    entries: entryCounts,
    blocks: blocksToWrite.length,
    orphanedEntries,
  };
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** One line for the toast. */
export function summarizeImport(result: ImportResult): string {
  const topicCount = result.topics.added + result.topics.updated;
  const entryCount = result.entries.added + result.entries.updated;
  if (topicCount === 0 && entryCount === 0) return "Nothing new to import";
  return `Imported ${plural(topicCount, "topic")} and ${plural(entryCount, "entry", "entries")}`;
}

/**
 * The breakdown shown on the page afterwards, one line per collection.
 *
 * Notes are counted by entry, not by block: "block" is the editor's term and
 * means nothing to the user, and notes are only ever written whole, for the
 * entries that were written.
 */
export function describeImport(result: ImportResult): string[] {
  const line = (label: string, counts: ImportCounts) =>
    `${label}: ${counts.added} added, ${counts.updated} updated, ${counts.skipped} unchanged`;
  const entriesWritten = result.entries.added + result.entries.updated;
  const lines = [
    line("Topics", result.topics),
    line("Entries", result.entries),
    `Notes: restored for ${plural(entriesWritten, "entry", "entries")}`,
  ];
  if (result.orphanedEntries > 0) {
    lines.push(
      `${plural(result.orphanedEntries, "entry", "entries")} skipped because their topic is missing from the file`,
    );
  }
  return lines;
}
