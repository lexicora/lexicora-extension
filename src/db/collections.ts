import { addRxPlugin } from "rxdb";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";

import { blockSchema } from "./schemas/block";
import { entrySchema } from "./schemas/entry";
import { topicSchema } from "./schemas/topic";

/**
 * The collections and their migrations, in one place so the app and the tests
 * open identical databases.
 *
 * Version 1 changed indexes only — `userId` dropped from all three, and
 * `hostnameUrl` added on entries — so documents carry over untouched and Dexie
 * rebuilds the indexes as it rewrites them. Any schema change alters the
 * schema's hash, indexes included, which is why even this needs a version and
 * a strategy.
 */
//* Registered here rather than at the app's entry: these collections declare
//* migrations, and RxDB throws without the plugin — so anything opening them,
//* the tests included, gets it by importing this module.
addRxPlugin(RxDBMigrationSchemaPlugin);

const carryOver = <T>(doc: T): T => doc;

export const COLLECTION_SETTINGS = {
  topics: { schema: topicSchema, migrationStrategies: { 1: carryOver } },
  entries: { schema: entrySchema, migrationStrategies: { 1: carryOver } },
  blocks: { schema: blockSchema, migrationStrategies: { 1: carryOver } },
};
