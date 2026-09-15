import type { RxCollection } from "rxdb";

import { scheduleCleanup } from "./cleanup";

/**
 * Cascade deletion for the topic → entries → blocks hierarchy.
 *
 * RxDB has no foreign keys, so removing a parent leaves its children behind as
 * orphans. Orphans are invisible — nothing lists blocks whose entry is gone —
 * so the cascade has to be correct at every call site. Keeping it here means
 * there is one place to fix rather than four.
 *
 * Deletion is soft: RxDB flags documents `_deleted` and only a cleanup purges
 * the rows. Each cascade queues one — debounced, so deleting several things in
 * a row still costs a single purge. See `db/cleanup`.
 *
 * Children are removed before their parent. If the second step fails, the user
 * is left with a visibly empty entry or topic they can delete again, rather
 * than orphans they cannot see.
 */

/** Collections a cascade needs. `null` matches what `useRxCollection` returns before the db is ready. */
export interface CascadeCollections {
  topics?: RxCollection | null;
  entries?: RxCollection | null;
  blocks?: RxCollection | null;
}

/**
 * Deletes an entry and every block belonging to it.
 *
 * Both steps are single bulk writes — `RxQuery.remove()` collects the matches
 * and hands them to `bulkRemove()` — so an entry with fifty blocks costs two
 * writes, not fifty-one.
 */
export async function deleteEntryCascade(
  entryId: string,
  { entries, blocks }: CascadeCollections,
): Promise<void> {
  if (!entries) return;

  if (blocks) {
    await blocks.find({ selector: { entryId } }).remove();
  }

  const entryDoc = await entries.findOne({ selector: { id: entryId } }).exec();
  if (entryDoc) await entryDoc.remove();

  scheduleCleanup({ entries, blocks });
}

/**
 * Deletes a topic, every entry in it, and every block in those entries.
 *
 * Costs three writes regardless of the topic's size. The previous per-document
 * loop cost roughly one write per block, so a large topic meant hundreds.
 *
 * Blocks are matched with `$in` over the entry ids because blocks reference
 * their entry, not their topic. `entryId` is indexed (see `db/schemas/block`).
 */
export async function deleteTopicCascade(
  topicId: string,
  { topics, entries, blocks }: CascadeCollections,
): Promise<void> {
  if (!topics) return;

  if (entries) {
    const entryDocs = await entries.find({ selector: { topicId } }).exec();

    if (entryDocs.length > 0) {
      if (blocks) {
        const entryIds = entryDocs.map((doc) => doc.primary as string);
        await blocks.find({ selector: { entryId: { $in: entryIds } } }).remove();
      }
      // Passing the documents rather than their ids skips a re-read.
      await entries.bulkRemove(entryDocs);
    }
  }

  const topicDoc = await topics.findOne({ selector: { id: topicId } }).exec();
  if (topicDoc) await topicDoc.remove();

  scheduleCleanup({ topics, entries, blocks });
}
