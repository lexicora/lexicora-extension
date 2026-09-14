import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { createRxDatabase, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { COLLECTION_SETTINGS } from "../collections";

/**
 * Covers the version 0 → 1 migration against real storage.
 *
 * Version 1 only changed indexes — `userId` dropped, `hostnameUrl` added — so
 * nothing about a document changes. That is exactly why it is worth a test:
 * the risk is not losing a field but failing to open at all, which would greet
 * an existing user with an empty library.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/** The entry schema as version 0 shipped it: indexed by userId, no hostnameUrl. */
const entrySchemaV0 = {
  title: "entry schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 100 },
    userId: { type: "string", maxLength: 100 },
    topicId: { type: "string", maxLength: 100 },
    title: { type: "string", maxLength: 255 },
    description: { type: "string", maxLength: 1000 },
    tags: { type: "array", maxItems: 10, items: { type: "string", maxLength: 50 } },
    isFavorite: { type: "boolean" },
    isPinned: { type: "boolean" },
    isArchived: { type: "boolean" },
    archivedExplicitly: { type: "boolean" },
    languageCode: { type: "string", maxLength: 10 },
    url: { type: "string", maxLength: 2048 },
    hostnameUrl: { type: "string", maxLength: 600 },
    pathnameUrl: { type: "string", maxLength: 700 },
    searchUrl: { type: "string", maxLength: 700 },
    faviconUrl: { type: "string", maxLength: 1000 },
    siteName: { type: "string", maxLength: 255 },
    searchBlob: { type: "string", maxLength: 3620 },
    createdAt: { type: "string", maxLength: 30 },
    updatedAt: { type: "string", maxLength: 30 },
  },
  required: ["id", "userId", "topicId", "title", "createdAt", "updatedAt"],
  indexes: ["topicId", "userId"],
} as const;

const oldEntry = {
  id: "e1",
  userId: NIL_UUID,
  topicId: "t1",
  title: "Captured before the migration",
  description: "",
  tags: [],
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  archivedExplicitly: false,
  languageCode: "en",
  url: "https://rxdb.info/key-compression.html",
  hostnameUrl: "rxdb.info",
  pathnameUrl: "/key-compression.html",
  searchUrl: "",
  faviconUrl: "",
  siteName: "RxDB",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

async function openAtVersion0(name: string) {
  const db = await createRxDatabase({
    name,
    storage: getRxStorageDexie(),
    multiInstance: false,
    ignoreDuplicate: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.addCollections({ entries: { schema: entrySchemaV0 as any } });
  return db as RxDatabase;
}

describe("entries schema migration 0 → 1", () => {
  it("keeps documents written by the previous version", async () => {
    const name = `migrate${Date.now()}`;

    const before = await openAtVersion0(name);
    await before.collections.entries!.insert(oldEntry);
    await before.close();

    const after = await createRxDatabase({
      name,
      storage: getRxStorageDexie(),
      multiInstance: false,
    });
    await after.addCollections(COLLECTION_SETTINGS);

    const migrated = await after.collections.entries!.findOne("e1").exec();
    expect(migrated?.title).toBe("Captured before the migration");
    // The field stays even though its index is gone.
    expect(migrated?.userId).toBe(NIL_UUID);

    // And the index added in version 1 serves the query the home page makes.
    const fromSite = await after.collections
      .entries!.find({ selector: { hostnameUrl: "rxdb.info" } })
      .exec();
    expect(fromSite.map((d) => d.id)).toEqual(["e1"]);

    await after.close();
  });
});
