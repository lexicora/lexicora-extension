import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRxDatabase, addRxPlugin, type RxDatabase } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";

import { topicSchema } from "../schemas/topic";
import { entrySchema } from "../schemas/entry";
import { blockSchema } from "../schemas/block";

/**
 * Covers the "Clear All Data" setting (issue #153).
 *
 * `find().remove()` on its own only soft-deletes — the documents stay in storage
 * with `_deleted: true`. The setting promises a permanent delete, so it follows
 * up with `cleanup(0)`. These tests assert the documents are gone from the
 * underlying storage instance, not just filtered out of query results.
 */

addRxPlugin(RxDBCleanupPlugin);

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

let db: RxDatabase;
let dbCount = 0;

beforeEach(async () => {
  db = await createRxDatabase({
    // Unique per test so instances never collide.
    name: `cleartest${dbCount++}`,
    storage: getRxStorageMemory(),
    multiInstance: false,
    eventReduce: true,
  });

  await db.addCollections({
    topics: { schema: topicSchema },
    entries: { schema: entrySchema },
    blocks: { schema: blockSchema },
  });
});

afterEach(async () => {
  await db.close();
});

function makeTopic(id: string) {
  const now = new Date().toISOString();
  return {
    id,
    userId: NIL_UUID,
    name: `Topic ${id}`,
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Reads straight from the storage instance, including soft-deleted documents. */
async function rawDocCount(collectionName: string, ids: string[]) {
  const docs = await db.collections[collectionName].storageInstance
    .findDocumentsById(ids, true)
    .then((result) =>
      Array.isArray(result) ? result : Object.values(result ?? {}),
    );
  return docs.length;
}

describe("clear all data", () => {
  it("removes documents from query results", async () => {
    await db.collections.topics.bulkInsert([makeTopic("a"), makeTopic("b")]);
    expect(await db.collections.topics.find().exec()).toHaveLength(2);

    await db.collections.topics.find().remove();

    expect(await db.collections.topics.find().exec()).toHaveLength(0);
  });

  it("leaves soft-deleted documents in storage until cleanup runs", async () => {
    await db.collections.topics.bulkInsert([makeTopic("a")]);
    await db.collections.topics.find().remove();

    // Still physically present — this is the behaviour that made the original
    // implementation feel broken.
    expect(await rawDocCount("topics", ["a"])).toBe(1);
  });

  it("physically purges documents once cleanup(0) runs", async () => {
    await db.collections.topics.bulkInsert([makeTopic("a"), makeTopic("b")]);
    await db.collections.topics.find().remove();
    await db.collections.topics.cleanup(0);

    expect(await rawDocCount("topics", ["a", "b"])).toBe(0);
    expect(await db.collections.topics.find().exec()).toHaveLength(0);
  });

  it("stays empty when the collection is queried again afterwards", async () => {
    await db.collections.topics.bulkInsert([makeTopic("a")]);
    await db.collections.topics.find().remove();
    await db.collections.topics.cleanup(0);

    // Re-querying must not resurrect anything, which is what the bug report
    // described after reopening the extension.
    expect(await db.collections.topics.find().exec()).toHaveLength(0);
    expect(await db.collections.topics.findOne("a").exec()).toBeNull();
  });

  it("can be re-populated after a clear", async () => {
    await db.collections.topics.bulkInsert([makeTopic("a")]);
    await db.collections.topics.find().remove();
    await db.collections.topics.cleanup(0);

    await db.collections.topics.insert(makeTopic("c"));

    expect(await db.collections.topics.find().exec()).toHaveLength(1);
  });
});
