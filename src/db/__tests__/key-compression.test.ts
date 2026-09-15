import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import Dexie from "dexie";

import { blockSchema } from "../schemas/block";
import { entrySchema } from "../schemas/entry";
import { topicSchema } from "../schemas/topic";
import { KEY_COMPRESSION_ENABLED } from "../key-compression";
import { withKeyCompression } from "../storage";

/**
 * Covers key compression end to end: that documents really are stored with
 * shortened keys, and that they come back out intact.
 *
 * Compression is switched on explicitly here rather than taken from the
 * schemas: it is off in development so the rows stay readable in DevTools, and
 * tests run in development. What the schemas do carry is checked at the bottom.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

const entry = {
  id: "e1",
  userId: NIL_UUID,
  topicId: "t1",
  title: "How RxDB works",
  description: "A local-first database for JavaScript.",
  tags: ["database"],
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  archivedExplicitly: false,
  languageCode: "en",
  url: "https://rxdb.info/how-it-works.html",
  hostnameUrl: "rxdb.info",
  pathnameUrl: "/how-it-works.html",
  searchUrl: "",
  faviconUrl: "",
  siteName: "RxDB",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

/** Builds a database, inserts the entry, and returns its raw IndexedDB row. */
async function storedRow(name: string, compressed: boolean) {
  const schema = { ...entrySchema, keyCompression: compressed };
  const db = await createRxDatabase({
    name,
    storage: compressed
      ? withKeyCompression(getRxStorageDexie())
      : getRxStorageDexie(),
    multiInstance: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.addCollections({ entries: { schema: schema as any } });
  await db.collections.entries!.insert(entry);
  const readBack = await db.collections.entries!.findOne("e1").exec();
  await db.close();

  const dexie = new Dexie(`rxdb-dexie-${name}--0--entries`);
  dexie.version(1).stores({ docs: "id" });
  await dexie.open();
  const rows = await dexie.table("docs").toArray();
  dexie.close();

  return { row: rows[0] as Record<string, unknown>, readBack };
}

describe("key compression", () => {
  it("stores shortened keys, keeping the primary key readable", async () => {
    const { row } = await storedRow(`kc${Date.now()}`, true);
    const keys = Object.keys(row);

    expect(keys).toContain("id");
    expect(keys).not.toContain("hostnameUrl");
    expect(keys).not.toContain("archivedExplicitly");
  });

  it("gives documents back with their real field names and values", async () => {
    const { readBack } = await storedRow(`kc${Date.now()}b`, true);

    expect(readBack?.toJSON()).toMatchObject({
      title: "How RxDB works",
      hostnameUrl: "rxdb.info",
      archivedExplicitly: false,
      tags: ["database"],
    });
  });

  it("stores less than the same document uncompressed", async () => {
    const stamp = Date.now();
    const { row: compressed } = await storedRow(`kc${stamp}c`, true);
    const { row: plain } = await storedRow(`kc${stamp}p`, false);

    const sizeOf = (row: unknown) => JSON.stringify(row).length;
    expect(sizeOf(compressed)).toBeLessThan(sizeOf(plain));

    // Reported rather than asserted: the ratio depends on the document.
    console.log(
      `entry row: ${sizeOf(plain)} → ${sizeOf(compressed)} chars ` +
        `(${Math.round((1 - sizeOf(compressed) / sizeOf(plain)) * 100)}% smaller)`,
    );
  });
});

describe("key compression, blocks", () => {
  // Blocks save proportionally less than entries: only schema properties are
  // compressed, and most of a block is `contentJson`, whose nested keys are
  // outside the schema. The fixed RxDB metadata on every row is untouched too.
  it("compresses blocks as well, though they gain less than entries", async () => {
    const block = {
      id: "b1",
      userId: NIL_UUID,
      entryId: "e1",
      order: 0,
      type: "paragraph",
      propsJson: { textAlignment: "left" },
      contentJson: [{ type: "text", text: "A sentence.", styles: {} }],
    };

    const stamp = Date.now();
    const rows = await Promise.all(
      [true, false].map(async (compressed) => {
        const db = await createRxDatabase({
          name: `kcb${stamp}${compressed}`,
          storage: compressed
            ? withKeyCompression(getRxStorageDexie())
            : getRxStorageDexie(),
          multiInstance: false,
        });
        await db.addCollections({
          blocks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema: { ...blockSchema, keyCompression: compressed } as any,
          },
        });
        await db.collections.blocks!.insert(block);
        await db.close();

        const dexie = new Dexie(`rxdb-dexie-kcb${stamp}${compressed}--0--blocks`);
        dexie.version(1).stores({ docs: "id" });
        await dexie.open();
        const stored = await dexie.table("docs").toArray();
        dexie.close();
        return JSON.stringify(stored[0]).length;
      }),
    );

    const [compressed, plain] = rows as [number, number];
    expect(compressed).toBeLessThan(plain);
    console.log(
      `block row: ${plain} → ${compressed} chars ` +
        `(${Math.round((1 - compressed / plain) * 100)}% smaller)`,
    );
  });
});

describe("schemas", () => {
  it("all follow the same switch, so none is left storing full keys", () => {
    // Guards against a schema hardcoding the flag and drifting from the rest,
    // which would store that collection differently from the others.
    for (const schema of [topicSchema, entrySchema, blockSchema]) {
      expect(schema.keyCompression).toBe(KEY_COMPRESSION_ENABLED);
    }
  });

  it("is off while developing, so stored rows stay readable", () => {
    expect(KEY_COMPRESSION_ENABLED).toBe(false);
  });
});
