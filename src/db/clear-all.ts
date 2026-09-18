import type { RxCollection } from "rxdb";
import { cleanupNow, type CleanupCollections } from "./cleanup";

/**
 * Deletes every topic, entry and block — for real.
 *
 * `remove()` only soft-deletes (sets `_deleted: true`), so each collection is
 * then cleaned up with a zero threshold to physically purge the rows from
 * IndexedDB. Requires RxDBCleanupPlugin (see src/db).
 *
 * Behind "Clear all data" in Settings → Storage, and the first step of a
 * backup import that replaces the library.
 */
export async function clearAllData(
  collections: CleanupCollections,
): Promise<void> {
  const present = Object.values(collections).filter(
    (collection): collection is RxCollection => !!collection,
  );
  await Promise.all(present.map((collection) => collection.find().remove()));
  await cleanupNow(collections);
}
