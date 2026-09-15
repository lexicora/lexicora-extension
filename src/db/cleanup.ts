import type { RxCollection } from "rxdb";

/**
 * Purging soft-deleted documents.
 *
 * RxDB only flags documents `_deleted`; the rows stay until a cleanup runs.
 * Three things trigger one, on purpose:
 *
 * 1. **After deletions** — `scheduleCleanup`, debounced, so a burst of deletes
 *    (a topic and all its entries, a few list items in a row) costs one purge
 *    rather than one each. A purge scans every document older than the cutoff,
 *    so its cost barely depends on how much it reclaims: doing it once per
 *    burst is what keeps it cheap.
 * 2. **Periodically** — RxDB's own `cleanupPolicy`, configured in `db/index`.
 * 3. **On request** — `cleanupNow`, behind the button in Data Management.
 *
 * The side panel can close before a scheduled purge fires. That is what the
 * other two are for: nothing depends on any single one of them running.
 */

/** Long enough to fold a burst of deletions into one purge, short enough to still happen. */
const CLEANUP_DELAY_MS = 15_000;

export interface CleanupCollections {
  topics?: RxCollection | null;
  entries?: RxCollection | null;
  blocks?: RxCollection | null;
}

let pendingTimer: ReturnType<typeof setTimeout> | null = null;

/** Purges every soft-deleted document now. */
export async function cleanupNow(collections: CleanupCollections): Promise<void> {
  const present = Object.values(collections).filter(
    (collection): collection is RxCollection => !!collection,
  );
  // cleanup(0) purges regardless of age: everything flagged deleted is gone,
  // which is what both the button and a post-deletion purge mean.
  await Promise.all(present.map((collection) => collection.cleanup(0)));
}

/**
 * Queues a purge, restarting the wait if one is already queued. Failures are
 * swallowed: this is housekeeping, and the periodic policy will try again.
 */
export function scheduleCleanup(collections: CleanupCollections): void {
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    cleanupNow(collections).catch(() => null);
  }, CLEANUP_DELAY_MS);
}

/** Cancels a queued purge. For tests, and for teardown. */
export function cancelScheduledCleanup(): void {
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = null;
}
