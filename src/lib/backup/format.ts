import { z } from "zod";

import { blockSchema, type BlockDocType } from "@/db/schemas/block";
import { blockTypes, uuidSchema } from "@/db/schemas/common";
import { entrySchema, type EntryDocType } from "@/db/schemas/entry";
import { topicSchema, type TopicDocType } from "@/db/schemas/topic";
import { normalizeTags } from "@/lib/utils/tags";

/**
 * The JSON backup: what the Export page writes and the Import page reads.
 *
 * One file holds all three collections, flat, as they are stored — blocks are
 * keyed by `entryId` rather than nested under their entry, so the file maps
 * 1:1 onto the database and an import is three bulk writes.
 *
 * Two kinds of version, on purpose:
 * - `formatVersion` is the layout of this file. Bump it when the envelope or
 *   the meaning of a field changes, and teach `parseBackup` to read the old one.
 * - `schemaVersions` are the RxDB schema versions the records were written
 *   under. They are recorded so a future migration knows where a file came
 *   from; nothing checks them yet because no schema has ever been migrated
 *   (see db/collections).
 *
 * Storage-only fields never make it into the file. `searchBlob` is derived and
 * rebuilt by the insert and save hooks. `_rev`, `_meta` and `_deleted` are
 * RxDB's bookkeeping for one particular database and mean nothing in another:
 * `_rev` in particular is a per-document write counter, not a clock, so it
 * cannot say which of two copies is newer. `updatedAt` can, and the import
 * decides by it.
 */

export const BACKUP_APP = "lexicora";
export const BACKUP_FORMAT_VERSION = 1;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

// The shape the RxDB schema accepts, so whatever passes here can be written.
const uuid = z.string().regex(new RegExp(uuidSchema.pattern), "not a UUID");
// Written by `toISOString()`, but any offset form parses to a comparable date.
const timestamp = z.iso.datetime({ offset: true });
// Brought within the schema's limits rather than rejected: a stray tag is
// not worth failing someone's whole backup over.
const tags = z.array(z.unknown()).transform(normalizeTags);

/**
 * Records are checked against what the app itself would have written, with
 * the app's defaults for flags. Unknown keys are dropped, which is what strips
 * the storage-only fields from a file.
 */
const topicRecord = z.object({
  id: uuid,
  userId: uuid.default(NIL_UUID),
  name: z.string(),
  description: z.string().optional(),
  tags,
  isFavorite: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const entryRecord = z.object({
  id: uuid,
  userId: uuid.default(NIL_UUID),
  topicId: uuid,
  title: z.string(),
  description: z.string().optional(),
  tags,
  isFavorite: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  archivedExplicitly: z.boolean().default(false),
  languageCode: z.string().default(""),
  url: z.string().default(""),
  hostnameUrl: z.string().default(""),
  pathnameUrl: z.string().default(""),
  searchUrl: z.string().default(""),
  faviconUrl: z.string().optional(),
  siteName: z.string().optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const blockRecord = z.object({
  id: uuid,
  userId: uuid.default(NIL_UUID),
  entryId: uuid,
  parentBlockId: uuid.optional(),
  order: z.number(),
  type: z.enum(blockTypes),
  propsJson: z.record(z.string(), z.unknown()).default({}),
  contentJson: z.unknown().optional(),
});

const backupRecords = z.object({
  exportedAt: timestamp.optional(),
  topics: z.array(topicRecord),
  entries: z.array(entryRecord),
  blocks: z.array(blockRecord),
});

/**
 * Read first, on its own, so a file from a newer app gets a clear message
 * rather than a complaint about some field it has every right to contain.
 */
const envelope = z.object({
  formatVersion: z.number().int().optional(),
  topics: z.array(z.unknown()),
  entries: z.array(z.unknown()),
  blocks: z.array(z.unknown()),
});

export interface BackupRecords {
  topics: TopicDocType[];
  entries: EntryDocType[];
  blocks: BlockDocType[];
}

/** What the export writes. */
export interface BackupFile extends BackupRecords {
  app: typeof BACKUP_APP;
  formatVersion: number;
  schemaVersions: { topics: number; entries: number; blocks: number };
  exportedAt: string;
}

/** What the import reads: the records, plus what little of the envelope matters. */
export interface Backup extends BackupRecords {
  formatVersion: number;
  exportedAt?: string;
}

/** A file the import cannot use. The message is written for the user. */
export class BackupFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupFormatError";
  }
}

function withoutSearchBlob<T extends { searchBlob?: string }>(
  doc: T,
): Omit<T, "searchBlob"> {
  const { searchBlob: _dropped, ...rest } = doc;
  return rest;
}

export function buildBackup(
  { topics, entries, blocks }: BackupRecords,
  exportedAt: Date = new Date(),
): BackupFile {
  return {
    app: BACKUP_APP,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersions: {
      topics: topicSchema.version,
      entries: entrySchema.version,
      blocks: blockSchema.version,
    },
    exportedAt: exportedAt.toISOString(),
    topics: topics.map(withoutSearchBlob),
    entries: entries.map(withoutSearchBlob),
    blocks,
  };
}

/**
 * Parses and validates a backup file's text.
 *
 * Files written before `formatVersion` existed carry only the schema
 * `version`; their layout is the same as format 1, so they read as that.
 */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupFormatError("This file is not valid JSON.");
  }

  const env = envelope.safeParse(raw);
  if (!env.success) {
    throw new BackupFormatError("This file is not a Lexicora backup.");
  }

  const formatVersion = env.data.formatVersion ?? 1;
  if (formatVersion > BACKUP_FORMAT_VERSION) {
    throw new BackupFormatError(
      "This backup was made by a newer version of Lexicora. Update the extension and try again.",
    );
  }

  const parsed = backupRecords.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.map(String).join(".");
    throw new BackupFormatError(
      `This backup has an invalid record${where ? ` at ${where}` : ""}: ${issue?.message ?? "unknown problem"}.`,
    );
  }

  return {
    formatVersion,
    exportedAt: parsed.data.exportedAt,
    topics: parsed.data.topics as TopicDocType[],
    entries: parsed.data.entries as EntryDocType[],
    blocks: parsed.data.blocks as BlockDocType[],
  };
}
