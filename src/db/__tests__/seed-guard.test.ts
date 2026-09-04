import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import {
  createRxDatabase,
  addRxPlugin,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";

import { seedDummyData } from "../seed";
import { topicSchema } from "../schemas/topic";
import { entrySchema } from "../schemas/entry";
import { blockSchema } from "../schemas/block";

/**
 * Regression test for issue #153.
 *
 * Development seeding runs on every database init. Guarding it only on "are
 * there any topics?" means an intentional "Clear All Data" leaves a database
 * that looks unseeded, so the dummy data is inserted again on the next open and
 * the cleared data appears to come back.
 */

addRxPlugin(RxDBCleanupPlugin);

type TestCollections = {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
};

let db: RxDatabase<TestCollections>;
let dbCount = 0;

/**
 * seedDummyData takes an untyped RxDatabase, which a typed one is not
 * assignable to because RxDatabase is invariant in its collections. The cast is
 * safe here: the seeded collections are exactly the ones declared above.
 */
const seed = (database: RxDatabase<TestCollections>) =>
  seedDummyData(database as unknown as RxDatabase);

async function openDb() {
  const database = await createRxDatabase<TestCollections>({
    name: `seedguard${Date.now()}${dbCount++}`,
    storage: getRxStorageDexie(),
    multiInstance: false,
    eventReduce: true,
  });

  await database.addCollections({
    topics: { schema: topicSchema },
    entries: { schema: entrySchema },
    blocks: { schema: blockSchema },
  });

  return database;
}

beforeEach(async () => {
  fakeBrowser.reset();
  db = await openDb();
});

afterEach(async () => {
  await db.close();
});

/** The clear performed by the "Clear All Data" setting. */
async function clearAllData(database: RxDatabase<TestCollections>) {
  await Promise.all([
    database.collections.topics.find().remove(),
    database.collections.entries.find().remove(),
    database.collections.blocks.find().remove(),
  ]);
  await Promise.all([
    database.collections.topics.cleanup(0),
    database.collections.entries.cleanup(0),
    database.collections.blocks.cleanup(0),
  ]);
}

describe("seedDummyData", () => {
  it("seeds an untouched database", async () => {
    await seed(db);

    expect(
      (await db.collections.topics.find().exec()).length,
    ).toBeGreaterThan(0);
  });

  it("does not seed twice in a row", async () => {
    await seed(db);
    const afterFirst = (await db.collections.topics.find().exec()).length;

    await seed(db);

    expect(await db.collections.topics.find().exec()).toHaveLength(afterFirst);
  });

  it("does not re-seed after the user clears all data", async () => {
    await seed(db);
    expect(
      (await db.collections.topics.find().exec()).length,
    ).toBeGreaterThan(0);

    await clearAllData(db);
    expect(await db.collections.topics.find().exec()).toHaveLength(0);

    // Simulates the next open of the side-panel, which re-runs initializeDb().
    await seed(db);

    expect(await db.collections.topics.find().exec()).toHaveLength(0);
    expect(await db.collections.entries.find().exec()).toHaveLength(0);
  });

  it("marks an already-populated database as seeded without inserting", async () => {
    await db.collections.topics.insert({
      id: "00000000-0000-0000-0000-0000000000aa",
      userId: "00000000-0000-0000-0000-000000000000",
      name: "Pre-existing",
      tags: [],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await seed(db);
    expect(await db.collections.topics.find().exec()).toHaveLength(1);

    await clearAllData(db);
    await seed(db);

    expect(await db.collections.topics.find().exec()).toHaveLength(0);
  });
});
