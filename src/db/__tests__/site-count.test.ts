import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { firstValueFrom, filter } from "rxjs";
import { createRxDatabase, type RxCollection, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { COLLECTION_SETTINGS } from "../collections";
import { countSiteEntries, siteCount$ } from "../site-count";

/**
 * Covers the "From this site" total — on Dexie, deliberately.
 *
 * Memory storage answers any count; Dexie refuses one it cannot answer from an
 * index alone. The first version passed every memory-storage test and showed
 * zero in the app for exactly that reason.
 */

const NIL = "00000000-0000-0000-0000-000000000000";

type Collections = { topics: RxCollection; entries: RxCollection; blocks: RxCollection };

let db: RxDatabase<Collections>;
let count = 0;

const entry = (id: string, hostnameUrl: string, isArchived = false) => ({
  id,
  userId: NIL,
  topicId: "t1",
  title: id,
  description: "",
  tags: [],
  isFavorite: false,
  isPinned: false,
  isArchived,
  archivedExplicitly: false,
  languageCode: "en",
  url: "",
  hostnameUrl,
  pathnameUrl: "",
  searchUrl: "",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
});

const hosts = ["react.dev", "www.react.dev"];

beforeEach(async () => {
  db = await createRxDatabase<Collections>({
    name: `sitecount${Date.now()}${count++}`,
    storage: getRxStorageDexie(),
    multiInstance: false,
  });
  await db.addCollections(COLLECTION_SETTINGS);
});

afterEach(async () => {
  await db.close();
});

describe("countSiteEntries", () => {
  it("counts on Dexie instead of being refused", async () => {
    await db.collections.entries.bulkInsert([entry("a", "react.dev")]);

    await expect(countSiteEntries(db.collections.entries, hosts)).resolves.toBe(1);
  });

  it("adds up both spellings of the host", async () => {
    await db.collections.entries.bulkInsert([
      entry("a", "react.dev"),
      entry("b", "www.react.dev"),
      entry("c", "react.dev"),
    ]);

    expect(await countSiteEntries(db.collections.entries, hosts)).toBe(3);
  });

  it("leaves out archived entries and other sites", async () => {
    await db.collections.entries.bulkInsert([
      entry("a", "react.dev"),
      entry("b", "react.dev", true),
      entry("c", "vuejs.org"),
    ]);

    expect(await countSiteEntries(db.collections.entries, hosts)).toBe(1);
  });

  it("is zero for a site with nothing captured", async () => {
    expect(await countSiteEntries(db.collections.entries, hosts)).toBe(0);
  });
});

describe("siteCount$", () => {
  it("updates as entries from the site are added", async () => {
    const counts = siteCount$(db.collections.entries, hosts);

    expect(await firstValueFrom(counts)).toBe(0);

    await db.collections.entries.bulkInsert([
      entry("a", "react.dev"),
      entry("b", "www.react.dev"),
    ]);

    expect(await firstValueFrom(counts.pipe(filter((n) => n === 2)))).toBe(2);
  });
});
