import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { COLLECTION_SETTINGS } from "./collections";
//import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
//import { disableWarnings, RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

import { filterConsole } from "@/lib/utils/filter-console";
import { buildEntrySearchBlob, buildTopicSearchBlob } from "./search-blob";

const isDev = import.meta.env.DEV;

/**
 * Cleanup: required so removed documents are physically purged from IndexedDB
 * instead of lingering as soft-deleted (`_deleted: true`) rows. Also what makes
 * the "Clear all data" setting a real deletion — see `collection.cleanup(0)`.
 *
 * Leader election: the cleanup plugin starts a background cleanup loop per
 * collection, and that loop awaits `database.waitForLeadership()` whenever the
 * database is multi-instance (it is — the side-panel and the window can both be
 * open at once). Without this plugin that call throws "You are using a function
 * which must be overwritten by a plugin". Electing a leader also keeps the loop
 * from running redundantly in every open context.
 *
 * Both must be registered before any database is created.
 */
addRxPlugin(RxDBCleanupPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

// Add plugins
// if (import.meta.env.DEV) {
//   disableWarnings();
//   addRxPlugin(RxDBDevModePlugin);
// }

// Helper function to initialize the db
export async function initializeDb() {
  if (!isDev) filterConsole();

  const db = await createRxDatabase({
    name: "lexicoradb", // name of the database
    storage: getRxStorageDexie(), // MAYBE: Include dexie.js plugins like dexie-worker or similar in the future. Data compression could be interesting. (encryption is built in to RxDB)
    multiInstance: true, // true by default - highly important for extensions crossing contexts
    ignoreDuplicate: false, // true is only allowed in development.
    closeDuplicates: isDev, // MAYBE: Set to true always. automatically close duplicate instances (e.g. from hot reload) - only relevant if ignoreDuplicate is true (enable if needed)
    eventReduce: true,
    //* The periodic half of the purge; the other two are in db/cleanup. RxDB's
    //* defaults assume a long-lived app: it waits a minute after the collection
    //* opens and keeps tombstones for a month. An extension session is often
    //* shorter than that first wait, so nothing was ever collected.
    //*
    //* Nothing here reads tombstones — there is no replication — so they can go
    //* as soon as they are cold. The loop only runs after writes, so an idle
    //* panel does not scan.
    cleanupPolicy: {
      minimumCollectionAge: 1000 * 10, // start collecting 10s after opening
      minimumDeletedTime: 1000 * 60, // a minute cold is cold enough
      runEach: 1000 * 60 * 2, // and again every 2 minutes, after writes
    },
  });

  // Add the collections — shared with the tests, see db/collections.
  await db.addCollections(COLLECTION_SETTINGS);

  // --- searchBlob middleware hooks ---
  // Automatically populate the searchBlob field on insert and update
  // so queries only need to scan a single denormalized string field.

  db.entries?.preInsert((doc) => {
    doc.searchBlob = buildEntrySearchBlob(doc);
  }, false); // maybe change to parallel if more hooks are added
  db.entries?.preSave((doc) => {
    doc.searchBlob = buildEntrySearchBlob(doc);
  }, false); // maybe change to parallel if more hooks are added

  db.topics?.preInsert((doc) => {
    doc.searchBlob = buildTopicSearchBlob(doc);
  }, false); // maybe change to parallel if more hooks are added
  db.topics?.preSave((doc) => {
    doc.searchBlob = buildTopicSearchBlob(doc);
  }, false); // maybe change to parallel if more hooks are added

  // Seed dummy data if in development mode
  if (isDev) {
    const { seedDummyData } = await import("./seed");
    await seedDummyData(db);
  }

  return db;
}

// Singleton instance
export let dbPromise: ReturnType<typeof initializeDb> | null = null;
export const getDb = () => {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
};

// TODO (sync, #68): Later implement Supabase sync plugin here.
