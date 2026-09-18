import type { BlockDocType } from "@/db/schemas/block";
import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";
import { downloadBlob } from "@/lib/export/download";

import { buildBackup } from "./format";
import type { ImportCollections } from "./import";

export {
  BACKUP_FORMAT_VERSION,
  BackupFormatError,
  buildBackup,
  parseBackup,
  type Backup,
  type BackupFile,
} from "./format";
export {
  describeImport,
  importBackup,
  summarizeImport,
  type ImportCollections,
  type ImportMode,
  type ImportProgress,
  type ImportResult,
} from "./import";

/** Downloads the whole library as one JSON backup the Import page can read back. */
export async function downloadBackup(
  { topics, entries, blocks }: ImportCollections,
  now: Date = new Date(),
): Promise<void> {
  const [topicDocs, entryDocs, blockDocs] = await Promise.all([
    topics.find().exec(),
    entries.find().exec(),
    blocks.find().exec(),
  ]);

  const backup = buildBackup(
    {
      topics: topicDocs.map((doc) => doc.toJSON() as TopicDocType),
      entries: entryDocs.map((doc) => doc.toJSON() as EntryDocType),
      blocks: blockDocs.map((doc) => doc.toJSON() as BlockDocType),
    },
    now,
  );

  const timestamp = now
    .toISOString()
    .slice(0, 19)
    .replace("T", "_")
    .replace(/:/g, "-");
  downloadBlob(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    `lexicora-backup-${timestamp}.json`,
  );
}
