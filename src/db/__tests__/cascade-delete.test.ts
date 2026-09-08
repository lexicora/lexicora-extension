import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";

import { topicSchema } from "../schemas/topic";
import { entrySchema } from "../schemas/entry";
import { blockSchema } from "../schemas/block";
import { deleteEntryCascade, deleteTopicCascade } from "../cascade-delete";

/**
 * Covers `db/cascade-delete`.
 *
 * RxDB has no foreign keys, so nothing stops a delete from leaving orphaned
 * children behind — and orphans are invisible, since no query lists blocks
 * whose entry is gone. These tests assert the cascade reaches every level and
 * stops at the boundary of what was asked for.
 *
 * The last test pins the write count, which is the reason the helper exists:
 * the previous per-document loop issued one write per block.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

type TestCollections = {
  topics: RxCollection;
  entries: RxCollection;
  blocks: RxCollection;
};

let db: RxDatabase<TestCollections>;
let dbCount = 0;

beforeEach(async () => {
  db = await createRxDatabase<TestCollections>({
    name: `cascadetest${dbCount++}`,
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
  vi.restoreAllMocks();
  await db.close();
});

const now = new Date().toISOString();

function makeTopic(id: string) {
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

function makeEntry(id: string, topicId: string) {
  return {
    id,
    userId: NIL_UUID,
    topicId,
    title: `Entry ${id}`,
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
    createdAt: now,
    updatedAt: now,
  };
}

function makeBlock(id: string, entryId: string, order = 0) {
  return {
    id,
    userId: NIL_UUID,
    entryId,
    order,
    type: "paragraph",
    propsJson: {},
  };
}

/** Collections in the shape the helper expects, matching the real call sites. */
function collections() {
  return {
    topics: db.collections.topics,
    entries: db.collections.entries,
    blocks: db.collections.blocks,
  };
}

describe("deleteEntryCascade", () => {
  beforeEach(async () => {
    await db.collections.topics.bulkInsert([makeTopic("t1")]);
    await db.collections.entries.bulkInsert([
      makeEntry("e1", "t1"),
      makeEntry("e2", "t1"),
    ]);
    await db.collections.blocks.bulkInsert([
      makeBlock("b1", "e1", 0),
      makeBlock("b2", "e1", 1),
      makeBlock("b3", "e2", 0),
    ]);
  });

  it("removes the entry and every block belonging to it", async () => {
    await deleteEntryCascade("e1", collections());

    expect(await db.collections.entries.findOne("e1").exec()).toBeNull();
    expect(await db.collections.blocks.findOne("b1").exec()).toBeNull();
    expect(await db.collections.blocks.findOne("b2").exec()).toBeNull();
  });

  it("leaves other entries and their blocks untouched", async () => {
    await deleteEntryCascade("e1", collections());

    expect(await db.collections.entries.findOne("e2").exec()).not.toBeNull();
    expect(await db.collections.blocks.findOne("b3").exec()).not.toBeNull();
  });

  it("leaves the parent topic in place", async () => {
    await deleteEntryCascade("e1", collections());

    expect(await db.collections.topics.findOne("t1").exec()).not.toBeNull();
  });

  it("does nothing when the entry does not exist", async () => {
    await deleteEntryCascade("missing", collections());

    expect(await db.collections.entries.find().exec()).toHaveLength(2);
    expect(await db.collections.blocks.find().exec()).toHaveLength(3);
  });

  it("does nothing when the collections are not ready yet", async () => {
    // `useRxCollection` returns null until the database resolves.
    await deleteEntryCascade("e1", { entries: null, blocks: null });

    expect(await db.collections.entries.findOne("e1").exec()).not.toBeNull();
  });
});

describe("deleteTopicCascade", () => {
  beforeEach(async () => {
    await db.collections.topics.bulkInsert([makeTopic("t1"), makeTopic("t2")]);
    await db.collections.entries.bulkInsert([
      makeEntry("e1", "t1"),
      makeEntry("e2", "t1"),
      makeEntry("e3", "t2"),
    ]);
    await db.collections.blocks.bulkInsert([
      makeBlock("b1", "e1", 0),
      makeBlock("b2", "e1", 1),
      makeBlock("b3", "e2", 0),
      makeBlock("b4", "e3", 0),
    ]);
  });

  it("removes the topic, its entries, and their blocks", async () => {
    await deleteTopicCascade("t1", collections());

    expect(await db.collections.topics.findOne("t1").exec()).toBeNull();
    expect(await db.collections.entries.find().exec()).toHaveLength(1);
    expect(await db.collections.blocks.find().exec()).toHaveLength(1);
  });

  it("leaves another topic's entries and blocks untouched", async () => {
    await deleteTopicCascade("t1", collections());

    expect(await db.collections.topics.findOne("t2").exec()).not.toBeNull();
    expect(await db.collections.entries.findOne("e3").exec()).not.toBeNull();
    expect(await db.collections.blocks.findOne("b4").exec()).not.toBeNull();
  });

  it("removes an empty topic without touching anything else", async () => {
    await db.collections.topics.insert(makeTopic("t3"));

    await deleteTopicCascade("t3", collections());

    expect(await db.collections.topics.findOne("t3").exec()).toBeNull();
    expect(await db.collections.entries.find().exec()).toHaveLength(3);
    expect(await db.collections.blocks.find().exec()).toHaveLength(4);
  });

  it("costs a fixed number of writes regardless of how much it deletes", async () => {
    // One bulk write per level: blocks, entries, then the topic itself. The
    // per-document loop this replaced scaled with the number of blocks.
    const spies = [
      vi.spyOn(db.collections.blocks.storageInstance, "bulkWrite"),
      vi.spyOn(db.collections.entries.storageInstance, "bulkWrite"),
      vi.spyOn(db.collections.topics.storageInstance, "bulkWrite"),
    ];

    await deleteTopicCascade("t1", collections());

    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
  });
});
