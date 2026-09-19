import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRxDatabase, type RxDatabase, type RxCollection } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { strFromU8, unzipSync } from "fflate";

import { COLLECTION_SETTINGS } from "@/db/collections";

const saved: Array<{ blob: Blob; filename: string }> = [];
vi.mock("../download", () => ({
  downloadBlob: (blob: Blob, filename: string) => {
    saved.push({ blob, filename });
  },
}));

const { downloadLibrary } = await import("../index");

/**
 * Covers the whole-library export: a folder per topic, an index note, and the
 * progress the settings page reports while it runs.
 */

const NIL = "00000000-0000-0000-0000-000000000000";

type Collections = {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
};

let db: RxDatabase<Collections>;
let count = 0;

const topic = (id: string, name: string) => ({
  id,
  userId: NIL,
  name,
  description: "",
  tags: [],
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-09-02T11:30:00.000Z",
});

const entry = (id: string, topicId: string, title: string) => ({
  id,
  userId: NIL,
  topicId,
  title,
  description: "",
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
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
});

beforeEach(async () => {
  saved.length = 0;
  db = await createRxDatabase<Collections>({
    name: `library${count++}`,
    storage: getRxStorageMemory(),
    multiInstance: false,
  });
  await db.addCollections(COLLECTION_SETTINGS);
});

afterEach(async () => {
  await db.close();
});

async function filesInDownload() {
  const bytes = new Uint8Array(await saved[0]!.blob.arrayBuffer());
  return Object.fromEntries(
    Object.entries(unzipSync(bytes))
      .filter(([path]) => !path.endsWith("/"))
      .map(([path, data]) => [path, strFromU8(data)]),
  );
}

describe("downloadLibrary", () => {
  it("writes a folder per topic, plus an index of them", async () => {
    await db.collections.topics.bulkInsert([
      topic("t1", "Research"),
      topic("t2", "Recipes"),
    ]);
    await db.collections.entries.bulkInsert([
      entry("e1", "t1", "How RxDB works"),
      entry("e2", "t2", "Sourdough"),
    ]);

    const topics = await downloadLibrary({
      topics: db.collections.topics,
      entries: db.collections.entries,
      blocks: db.collections.blocks,
    });

    expect(topics).toBe(2);
    expect(Object.keys(await filesInDownload()).sort()).toEqual([
      "Lexicora library.md",
      "Recipes/Recipes.md",
      "Recipes/Sourdough.md",
      "Research/How RxDB works.md",
      "Research/Research.md",
    ]);
  });

  it("links the index to notes that exist", async () => {
    await db.collections.topics.bulkInsert([topic("t1", "A/B testing")]);

    await downloadLibrary({
      topics: db.collections.topics,
      entries: db.collections.entries,
      blocks: db.collections.blocks,
    });

    const files = await filesInDownload();
    const targets = [
      ...files["Lexicora library.md"]!.matchAll(/\]\(([^)]+)\)/g),
    ].map((match) => decodeURIComponent(match[1]!));

    expect(targets).toEqual(["A B testing/A B testing.md"]);
    for (const target of targets) expect(files[target]).toBeDefined();
  });

  it("escapes brackets and backslashes in the index's link text", async () => {
    await db.collections.topics.bulkInsert([topic("t1", "Notes [draft] C:\\")]);

    await downloadLibrary({
      topics: db.collections.topics,
      entries: db.collections.entries,
      blocks: db.collections.blocks,
    });

    const files = await filesInDownload();
    expect(files["Lexicora library.md"]).toContain(
      "- [Notes \\[draft\\] C:\\\\](",
    );
  });

  it("reports progress per topic, for the toast", async () => {
    await db.collections.topics.bulkInsert([
      topic("t1", "One"),
      topic("t2", "Two"),
      topic("t3", "Three"),
    ]);
    const progress: string[] = [];

    await downloadLibrary(
      {
        topics: db.collections.topics,
        entries: db.collections.entries,
        blocks: db.collections.blocks,
      },
      ({ done, total }) => progress.push(`${done}/${total}`),
    );

    expect(progress).toEqual(["1/3", "2/3", "3/3"]);
  });

  it("downloads nothing when the library is empty", async () => {
    const topics = await downloadLibrary({
      topics: db.collections.topics,
      entries: db.collections.entries,
      blocks: db.collections.blocks,
    });

    expect(topics).toBe(0);
    expect(saved).toHaveLength(0);
  });

  it("names the file with a timestamp, like the JSON export", async () => {
    await db.collections.topics.bulkInsert([topic("t1", "Research")]);

    await downloadLibrary({
      topics: db.collections.topics,
      entries: db.collections.entries,
      blocks: db.collections.blocks,
    });

    expect(saved[0]!.filename).toMatch(
      /^lexicora-markdown-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/,
    );
  });
});
