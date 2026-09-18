import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  addRxPlugin,
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";

import { COLLECTION_SETTINGS } from "@/db/collections";
import { cancelScheduledCleanup } from "@/db/cleanup";
import type { BlockDocType } from "@/db/schemas/block";
import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";

import type { Backup } from "../format";
import { describeImport, importBackup, summarizeImport } from "../import";

/**
 * Covers the three import modes against a real (in-memory) database, and the
 * rule that an entry and its notes move as one.
 */

addRxPlugin(RxDBCleanupPlugin);

const NIL = "00000000-0000-0000-0000-000000000000";
const uuid = (n: number) =>
  `019a0000-0000-7000-8000-${n.toString(16).padStart(12, "0")}`;
const T1 = uuid(1);
const T2 = uuid(2);
const E1 = uuid(101);
const E2 = uuid(102);
const B1 = uuid(201);
const B2 = uuid(202);
const B3 = uuid(203);

const OLD = "2026-09-01T10:00:00.000Z";
const NEW = "2026-09-15T10:00:00.000Z";

function topic(
  id: string,
  overrides: Partial<TopicDocType> = {},
): TopicDocType {
  return {
    id,
    userId: NIL,
    name: `Topic ${id.slice(-2)}`,
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: OLD,
    updatedAt: OLD,
    ...overrides,
  };
}

function entry(
  id: string,
  topicId: string,
  overrides: Partial<EntryDocType> = {},
): EntryDocType {
  return {
    id,
    userId: NIL,
    topicId,
    title: `Entry ${id.slice(-2)}`,
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    archivedExplicitly: false,
    languageCode: "en",
    url: "",
    hostnameUrl: "",
    pathnameUrl: "",
    searchUrl: "",
    createdAt: OLD,
    updatedAt: OLD,
    ...overrides,
  };
}

function block(
  id: string,
  entryId: string,
  text: string,
  overrides: Partial<BlockDocType> = {},
): BlockDocType {
  return {
    id,
    userId: NIL,
    entryId,
    order: 0,
    type: "paragraph",
    propsJson: {},
    contentJson: [{ type: "text", text, styles: {} }],
    ...overrides,
  };
}

function backup(records: Partial<Backup> = {}): Backup {
  return { formatVersion: 1, topics: [], entries: [], blocks: [], ...records };
}

type TestCollections = {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
};

let db: RxDatabase<TestCollections>;
let dbCount = 0;

beforeEach(async () => {
  db = await createRxDatabase<TestCollections>({
    name: `importtest${dbCount++}`,
    storage: getRxStorageMemory(),
    // Single-instance so cleanup never waits for leadership — see the
    // clear-all-data test for why.
    multiInstance: false,
    eventReduce: true,
  });
  await db.addCollections(COLLECTION_SETTINGS);
});

afterEach(async () => {
  cancelScheduledCleanup();
  await db.close();
});

const collections = () => ({
  topics: db.collections.topics,
  entries: db.collections.entries,
  blocks: db.collections.blocks,
});

async function all<T>(collection: RxCollection): Promise<T[]> {
  const docs = await collection.find().exec();
  return docs.map((doc) => doc.toJSON() as T);
}

async function blockTexts(entryId: string): Promise<string[]> {
  const blocks = await all<BlockDocType>(db.collections.blocks);
  return blocks
    .filter((b) => b.entryId === entryId)
    .sort((a, b) => a.order - b.order)
    .map((b) => (b.contentJson as Array<{ text: string }>)[0]!.text);
}

describe("importBackup into an empty library", () => {
  it("adds everything and counts it", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1)],
        entries: [entry(E1, T1)],
        blocks: [block(B1, E1, "one"), block(B2, E1, "two", { order: 1 })],
      }),
      "merge",
    );

    expect(result).toEqual({
      topics: { added: 1, updated: 0, skipped: 0 },
      entries: { added: 1, updated: 0, skipped: 0 },
      blocks: 2,
      orphanedEntries: 0,
    });
    expect(await all(db.collections.topics)).toHaveLength(1);
    expect(await blockTexts(E1)).toEqual(["one", "two"]);
  });

  it("reports progress per stage", async () => {
    const seen: string[] = [];

    await importBackup(
      collections(),
      backup({ topics: [topic(T1)], entries: [entry(E1, T1)], blocks: [] }),
      "merge",
      ({ stage, done, total }) => seen.push(`${stage} ${done}/${total}`),
    );

    expect(seen).toEqual([
      "topics 0/1",
      "topics 1/1",
      "entries 0/1",
      "entries 1/1",
      "notes 0/0",
    ]);
  });

  it("leaves out entries whose topic is nowhere to be found", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1)],
        entries: [entry(E1, T1), entry(E2, T2)],
        blocks: [block(B1, E2, "orphaned")],
      }),
      "merge",
    );

    expect(result.orphanedEntries).toBe(1);
    expect(result.entries.added).toBe(1);
    expect(result.blocks).toBe(0);
    expect(await all(db.collections.entries)).toHaveLength(1);
  });

  it("takes the first of two records with the same id", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1, { name: "First" }), topic(T1, { name: "Second" })],
      }),
      "merge",
    );

    expect(result.topics.added).toBe(1);
    const [only] = await all<TopicDocType>(db.collections.topics);
    expect(only?.name).toBe("First");
  });
});

describe("importBackup over an existing library", () => {
  beforeEach(async () => {
    await db.collections.topics.insert(topic(T1, { name: "Local topic" }));
    await db.collections.entries.insert(
      entry(E1, T1, { title: "Local entry", updatedAt: NEW }),
    );
    await db.collections.blocks.bulkInsert([
      block(B1, E1, "local one"),
      block(B2, E1, "local two", { order: 1 }),
    ]);
  });

  it("merge: an older copy in the file leaves the local one, notes included", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1, { name: "File topic", updatedAt: OLD })],
        entries: [entry(E1, T1, { title: "File entry", updatedAt: OLD })],
        blocks: [block(B3, E1, "file")],
      }),
      "merge",
    );

    expect(result.entries).toEqual({ added: 0, updated: 0, skipped: 1 });
    expect(result.blocks).toBe(0);
    const [only] = await all<EntryDocType>(db.collections.entries);
    expect(only?.title).toBe("Local entry");
    expect(await blockTexts(E1)).toEqual(["local one", "local two"]);
  });

  it("merge: a newer copy in the file replaces the entry and its whole note", async () => {
    const later = "2026-09-16T10:00:00.000Z";
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1)],
        entries: [entry(E1, T1, { title: "File entry", updatedAt: later })],
        blocks: [block(B3, E1, "file")],
      }),
      "merge",
    );

    expect(result.entries).toEqual({ added: 0, updated: 1, skipped: 0 });
    expect(result.blocks).toBe(1);
    const [only] = await all<EntryDocType>(db.collections.entries);
    expect(only?.title).toBe("File entry");
    // Not "file", "local one", "local two": the old set is gone.
    expect(await blockTexts(E1)).toEqual(["file"]);
  });

  it("merge: an identical timestamp stays local", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1, { name: "File topic", updatedAt: OLD })],
      }),
      "merge",
    );

    expect(result.topics).toEqual({ added: 0, updated: 0, skipped: 1 });
  });

  it("skip: never touches what is here, even when the file is newer", async () => {
    const later = "2026-09-16T10:00:00.000Z";
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T1, { name: "File topic", updatedAt: later })],
        entries: [
          entry(E1, T1, { title: "File entry", updatedAt: later }),
          entry(E2, T1, { title: "New entry" }),
        ],
        blocks: [block(B3, E1, "file"), block(uuid(204), E2, "new")],
      }),
      "skip",
    );

    expect(result.topics).toEqual({ added: 0, updated: 0, skipped: 1 });
    expect(result.entries).toEqual({ added: 1, updated: 0, skipped: 1 });
    expect(result.blocks).toBe(1);
    const entries = await all<EntryDocType>(db.collections.entries);
    expect(entries.map((e) => e.title).sort()).toEqual([
      "Local entry",
      "New entry",
    ]);
    expect(await blockTexts(E1)).toEqual(["local one", "local two"]);
    expect(await blockTexts(E2)).toEqual(["new"]);
  });

  it("replace: what is not in the file is gone afterwards", async () => {
    const result = await importBackup(
      collections(),
      backup({
        topics: [topic(T2)],
        entries: [entry(E2, T2)],
        blocks: [block(B3, E2, "only")],
      }),
      "replace",
    );

    expect(result.topics).toEqual({ added: 1, updated: 0, skipped: 0 });
    const topics = await all<TopicDocType>(db.collections.topics);
    expect(topics.map((t) => t.id)).toEqual([T2]);
    expect(await all(db.collections.entries)).toHaveLength(1);
    expect(await blockTexts(E1)).toEqual([]);
    expect(await blockTexts(E2)).toEqual(["only"]);
  });

  it("replace: an older copy in the file wins, because nothing is left to compare with", async () => {
    await importBackup(
      collections(),
      backup({
        topics: [topic(T1)],
        entries: [entry(E1, T1, { title: "Restored", updatedAt: OLD })],
      }),
      "replace",
    );

    const [only] = await all<EntryDocType>(db.collections.entries);
    expect(only?.title).toBe("Restored");
  });

  it("an entry the user deleted comes back from a backup", async () => {
    const doc = await db.collections.entries.findOne(E1).exec();
    await doc!.remove();
    expect(await all(db.collections.entries)).toHaveLength(0);

    const result = await importBackup(
      collections(),
      backup({ topics: [topic(T1)], entries: [entry(E1, T1)] }),
      "skip",
    );

    expect(result.entries.added).toBe(1);
    expect(await all(db.collections.entries)).toHaveLength(1);
  });

  it("an entry can join a topic that is local but not in the file", async () => {
    const result = await importBackup(
      collections(),
      backup({ entries: [entry(E2, T1)] }),
      "merge",
    );

    expect(result.orphanedEntries).toBe(0);
    expect(result.entries.added).toBe(1);
  });
});

describe("summaries", () => {
  it("says what was imported, or that there was nothing", () => {
    expect(
      summarizeImport({
        topics: { added: 1, updated: 0, skipped: 0 },
        entries: { added: 2, updated: 1, skipped: 4 },
        blocks: 9,
        orphanedEntries: 0,
      }),
    ).toBe("Imported 1 topic and 3 entries");
    expect(
      summarizeImport({
        topics: { added: 0, updated: 0, skipped: 3 },
        entries: { added: 0, updated: 0, skipped: 3 },
        blocks: 0,
        orphanedEntries: 0,
      }),
    ).toBe("Nothing new to import");
  });

  it("only mentions orphans when there are any", () => {
    const base = {
      topics: { added: 1, updated: 0, skipped: 0 },
      entries: { added: 1, updated: 0, skipped: 0 },
      blocks: 1,
    };
    const lines = describeImport({ ...base, orphanedEntries: 0 });
    expect(lines).toHaveLength(3);
    // "block" is not a word the user knows.
    expect(lines.join(" ")).not.toMatch(/block/i);
    expect(lines[2]).toBe("Notes: restored for 1 entry");
    expect(describeImport({ ...base, orphanedEntries: 2 })[3]).toMatch(
      /2 entries skipped/,
    );
  });
});
