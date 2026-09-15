import type { RxCollection } from "rxdb";

import type { EntryDocType } from "@/db/schemas/entry";

/**
 * Archiving a topic archives the entries that follow it, and restoring it
 * brings them back — but never touches entries the user archived by hand,
 * which stay archived on their own account.
 *
 * Shared by the topic list item and the topic detail page, which both offer
 * the toggle.
 */
export async function setTopicEntriesArchived(
  topicId: string,
  isArchived: boolean,
  entries: RxCollection | null | undefined,
): Promise<void> {
  if (!entries) return;

  const docs = await entries
    .find({ selector: { topicId, archivedExplicitly: false } })
    .exec();

  // Entries already in the wanted state are left alone: rewriting a document
  // that has not changed bumps its revision for nothing, and would later be
  // replicated as a change.
  const toChange = docs.filter(
    (doc) => (doc.get("isArchived") as boolean) !== isArchived,
  );
  if (toChange.length === 0) return;

  // One write for all of them. `query.patch()` would look tidier but patches
  // each document separately, which is what this replaces.
  await entries.bulkUpsert(
    toChange.map((doc) => ({
      ...(doc.toJSON() as EntryDocType),
      isArchived,
      // updatedAt is deliberately untouched: following a topic is not an edit,
      // and the library sorts by it.
    })),
  );
}
