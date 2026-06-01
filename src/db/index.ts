import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { disableWarnings, RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

// Schemas
import { topicSchema } from "./schemas/topic";
import { entrySchema } from "./schemas/entry";
import { blockSchema } from "./schemas/block";
import { filterConsole } from "@/lib/utils/filter-console";

const isDev = import.meta.env.DEV;

// TODO: For testing always add same test data on db init.
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
    storage: getRxStorageDexie(), // TODO: Potentially include dexie.js plugins like dexie-worker or similar in the future. Data compression could be interesting. (encryption is built in to RxDB)
    multiInstance: true, // true by default - highly important for extensions crossing contexts
    ignoreDuplicate: false, // true is only allowed in development.
    closeDuplicates: isDev, // automatically close duplicate instances (e.g. from hot reload) - only relevant if ignoreDuplicate is true (enable if needed)
    eventReduce: true,
  });

  // Add the collections
  await db.addCollections({
    topics: { schema: topicSchema },
    entries: { schema: entrySchema },
    blocks: { schema: blockSchema },
  });

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

// TODO: Later implement Supabase sync plugin here.
