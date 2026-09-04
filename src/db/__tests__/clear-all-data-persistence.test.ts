import "fake-indexeddb/auto";
import { describe, it, expect, afterEach } from "vitest";
import {
  createRxDatabase,
  addRxPlugin,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";
import Dexie from "dexie";

import { topicSchema } from "../schemas/topic";
import { entrySchema } from "../schemas/entry";
import { blockSchema } from "../schemas/block";

/**
 * Reproduction for issue #153 against the *real* storage engine.
 *
 * The memory-storage tests cover RxDB's semantics. This file covers what
 * actually broke: whether a clear leaves anything behind in IndexedDB that a
 * later session could read back — which is what happens every time the
 * side-panel is closed and opened again.
 *
 * RxDB refuses to open two databases of the same name in one process, so rather
 * than reopening, these tests inspect the IndexedDB rows directly. If no rows
 * survive, no reopen can resurrect anything.
 */

addRxPlugin(RxDBCleanupPlugin);

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

type TestCollections = {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
};

let open: RxDatabase<TestCollections> | null = null;

async function openDb(name: string) {
  const db = await createRxDatabase<TestCollections>({
    name,
    storage: getRxStorageDexie(),
    multiInstance: false,
    eventReduce: true,
  });

  await db.addCollections({
    topics: { schema: topicSchema },
    entries: { schema: entrySchema },
    blocks: { schema: blockSchema },
  });

  open = db;
  return db;
}

afterEach(async () => {
  if (open) await open.close();
  open = null;
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

/**
 * Reads the collection's rows straight out of IndexedDB, bypassing RxDB, so
 * soft-deleted rows are visible.
 */
async function rowsInIndexedDb(dbName: string, collection: string) {
  const dexie = new Dexie(`rxdb-dexie-${dbName}--0--${collection}`);
  dexie.version(1).stores({ docs: "id" });
  await dexie.open();
  const rows = await dexie.table("docs").toArray();
  dexie.close();
  return rows;
}

describe("clear all data (dexie storage)", () => {
  it("purges the rows from IndexedDB, not just from query results", async () => {
    const name = `purge${Date.now()}`;
    const db = await openDb(name);

    await db.collections.topics.bulkInsert([makeTopic("a"), makeTopic("b")]);
    expect(await rowsInIndexedDb(name, "topics")).toHaveLength(2);

    // Exactly what the "Clear All Data" setting does.
    await db.collections.topics.find().remove();
    await db.collections.topics.cleanup(0);

    expect(await db.collections.topics.find().exec()).toHaveLength(0);
    expect(await rowsInIndexedDb(name, "topics")).toHaveLength(0);
  });

  it("stays cleared after the database is closed and reopened", async () => {
    const name = `reopen${Date.now()}`;

    let db = await openDb(name);
    await db.collections.topics.bulkInsert([makeTopic("a"), makeTopic("b")]);
    await db.collections.topics.find().remove();
    await db.collections.topics.cleanup(0);

    // Closing frees the database name, so this is a real reopen rather than a
    // second handle on the same instance.
    await db.close();
    open = null;

    db = await openDb(name);
    expect(await db.collections.topics.find().exec()).toHaveLength(0);
  });

  it("leaves soft-deleted rows behind when cleanup does not run", async () => {
    const name = `soft${Date.now()}`;
    const db = await openDb(name);

    await db.collections.topics.bulkInsert([makeTopic("a")]);
    await db.collections.topics.find().remove();

    // Without cleanup the row is still on disk, which is what made the original
    // implementation feel like the delete had not happened.
    expect(await rowsInIndexedDb(name, "topics")).toHaveLength(1);
  });
});
