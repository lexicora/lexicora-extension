import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

// Schemas
import { topicSchema } from './schemas/topic';
import { entrySchema } from './schemas/entry';
import { blockSchema } from './schemas/block';

// Add plugins
if (import.meta.env?.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

// Helper function to initialize the db
export async function initializeDb() {
  const db = await createRxDatabase({
    name: 'lexicoradb', // name of the database
    storage: getRxStorageDexie(),
    multiInstance: true, // true by default - highly important for extensions crossing contexts
    ignoreDuplicate: true,
  });

  // Add the collections
  await db.addCollections({
    topics: { schema: topicSchema },
    entries: { schema: entrySchema },
    blocks: { schema: blockSchema },
  });

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
