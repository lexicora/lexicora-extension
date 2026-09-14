import { blockSchema } from "./schemas/block";
import { entrySchema } from "./schemas/entry";
import { topicSchema } from "./schemas/topic";

/**
 * The collections, in one place so the app and the tests open identical
 * databases.
 *
 * No schema versions or migrations: nothing is released yet, so schema changes
 * are made in place and any local database is recreated. The day something is
 * distributed, changes here need a version bump, a migration strategy per
 * collection and RxDB's migration-schema plugin.
 */
export const COLLECTION_SETTINGS = {
  topics: { schema: topicSchema },
  entries: { schema: entrySchema },
  blocks: { schema: blockSchema },
};
