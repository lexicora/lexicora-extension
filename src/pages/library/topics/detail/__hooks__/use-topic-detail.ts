import { useState, useEffect } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import { type EntryDocType } from "@/db/schemas/entry";
import { type TopicDocType } from "@/db/schemas/topic";

export interface TopicDetailData {
  /** undefined = loading, null = not found */
  topic: TopicDocType | null | undefined;
  favoriteEntries: EntryDocType[];
  /**
   * The entries the topic's entry list opens on: the unarchived ones, or for
   * an archived topic every archived entry — those archived with it and those
   * archived by hand before. That number can change when the topic is
   * archived, so the page labels it "Total archived" rather than "Total".
   */
  entriesCount: number;
}

export function useTopicDetail(id: string | undefined): TopicDetailData {
  const collection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");

  const [topic, setTopic] = useState<TopicDocType | null | undefined>(
    undefined,
  );
  const [favoriteEntries, setFavoriteEntries] = useState<EntryDocType[]>([]);
  const [entriesCount, setEntriesCount] = useState(0);

  useEffect(() => {
    if (!collection || !id) return;
    const sub = collection.findOne({ selector: { id } }).$.subscribe({
      next: (doc) => setTopic(doc ? (doc.toJSON() as TopicDocType) : null),
      error: (err) => {
        console.error("Error loading topic:", err);
        setTopic(null);
      },
    });
    return () => sub.unsubscribe();
  }, [collection, id]);

  useEffect(() => {
    if (!entriesCollection || !id) return;
    const sub = entriesCollection
      .find({
        selector: { topicId: id, isFavorite: true, isArchived: false },
        sort: [{ updatedAt: "desc" }],
      })
      .$.subscribe({
        next: (docs) => setFavoriteEntries(docs as EntryDocType[]),
        error: (err) => {
          console.error("Error loading favorite entries:", err);
          setFavoriteEntries([]);
        },
      });
    return () => sub.unsubscribe();
  }, [entriesCollection, id]);

  const isArchived = topic?.isArchived ?? false;
  useEffect(() => {
    if (!entriesCollection || !id) return;
    const sub = entriesCollection
      .count({ selector: { topicId: id, isArchived } })
      .$.subscribe({
        next: setEntriesCount,
        error: () => setEntriesCount(0),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection, id, isArchived]);

  return { topic, favoriteEntries, entriesCount };
}
