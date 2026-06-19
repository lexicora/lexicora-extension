import { useState, useEffect } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import { type BlockDocType } from "@/db/schemas/block";
import { type EntryDocType } from "@/db/schemas/entry";
import { type TopicDocType } from "@/db/schemas/topic";
import { convertDbBlocksToBlockNote } from "@/lib/utils/block-converter";

export interface EntryDetailData {
  /** undefined = loading, null = not found */
  entry: EntryDocType | null | undefined;
  topic: TopicDocType | null;
  /** null = blocks not yet loaded */
  blocks: unknown[] | null;
}

export function useEntryDetail(id: string | undefined): EntryDetailData {
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");
  const topicsCollection = useRxCollection("topics");

  const [entry, setEntry] = useState<EntryDocType | null | undefined>(
    undefined,
  );
  const [topic, setTopic] = useState<TopicDocType | null>(null);
  const [blocks, setBlocks] = useState<unknown[] | null>(null);

  // Reactive subscription — keeps entry in sync when attributes are toggled
  useEffect(() => {
    if (!entriesCollection || !id) return;
    const sub = entriesCollection.findOne({ selector: { id } }).$.subscribe({
      next: (doc) => setEntry(doc ? (doc.toJSON() as EntryDocType) : null),
      error: (err) => {
        console.error("Error loading entry:", err);
        setEntry(null);
      },
    });
    return () => sub.unsubscribe();
  }, [entriesCollection, id]);

  // Reactive subscription for the associated topic
  useEffect(() => {
    if (!topicsCollection || !entry?.topicId) return;
    const sub = topicsCollection
      .findOne({ selector: { id: entry.topicId } })
      .$.subscribe({
        next: (doc) => setTopic(doc ? (doc.toJSON() as TopicDocType) : null),
        error: () => setTopic(null),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection, entry?.topicId]);

  // One-shot load — read-only view doesn't need live block updates
  useEffect(() => {
    if (!blocksCollection || !id) return;
    blocksCollection
      .find({ selector: { entryId: id } })
      .exec()
      .then((docs) =>
        setBlocks(convertDbBlocksToBlockNote(docs as BlockDocType[])),
      )
      .catch((err) => {
        console.error("Error loading blocks:", err);
        setBlocks([]);
      });
  }, [blocksCollection, id]);

  return { entry, topic, blocks };
}
