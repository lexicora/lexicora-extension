import { useState, useEffect } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import type { TopicDocType } from "@/db/schemas/topic";
import type { EntryDocType } from "@/db/schemas/entry";

export interface HomeData {
  favoriteTopicsCount: number;
  favoriteEntriesCount: number;
  combinedTopics: TopicDocType[];
  maxTopicsToShow: number;
  recentEntries: EntryDocType[];
  /** True once both collections are known to hold nothing at all. */
  isLibraryEmpty: boolean;
}

export function useHomeData(): HomeData {
  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");

  const [favoriteTopicsCount, setFavoriteTopicsCount] = useState(0);
  const [favoriteEntriesCount, setFavoriteEntriesCount] = useState(0);
  const [pinnedTopics, setPinnedTopics] = useState<TopicDocType[]>([]);
  const [recentTopics, setRecentTopics] = useState<TopicDocType[]>([]);
  const [recentEntries, setRecentEntries] = useState<EntryDocType[]>([]);
  const [topicsCount, setTopicsCount] = useState<number | null>(null);
  const [entriesCount, setEntriesCount] = useState<number | null>(null);
  const [maxTopicsToShow, setMaxTopicsToShow] = useState(() => {
    const h = document.documentElement.clientHeight;
    return h >= 870 ? 5 : h >= 825 ? 4 : 3;
  });

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .count({ selector: { isFavorite: true } })
      .$.subscribe({
        next: setFavoriteTopicsCount,
        error: () => setFavoriteTopicsCount(0),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!entriesCollection) return;
    const sub = entriesCollection
      .count({ selector: { isFavorite: true } })
      .$.subscribe({
        next: setFavoriteEntriesCount,
        error: () => setFavoriteEntriesCount(0),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({
        selector: { isPinned: true, isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: 5,
      })
      .$.subscribe({
        next: (docs) =>
          setPinnedTopics(docs.map((d) => d.toJSON() as TopicDocType)),
        error: () => setPinnedTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({
        selector: { isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: 6,
      })
      .$.subscribe({
        next: (docs) =>
          setRecentTopics(docs.map((d) => d.toJSON() as TopicDocType)),
        error: () => setRecentTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!entriesCollection) return;
    const sub = entriesCollection
      .find({
        selector: { isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: 6,
      })
      .$.subscribe({
        next: (docs) =>
          setRecentEntries(docs.map((d) => d.toJSON() as EntryDocType)),
        error: () => setRecentEntries([]),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection]);

  // Totals drive the first-run empty state, so they count archived documents
  // too — an archived-only library is not an empty one.
  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection.count().$.subscribe({
      next: setTopicsCount,
      error: () => setTopicsCount(0),
    });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!entriesCollection) return;
    const sub = entriesCollection.count().$.subscribe({
      next: setEntriesCount,
      error: () => setEntriesCount(0),
    });
    return () => sub.unsubscribe();
  }, [entriesCollection]);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement.clientHeight;
      setMaxTopicsToShow(h >= 870 ? 5 : h >= 825 ? 4 : 3);
    };
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const combinedTopics = [
    ...pinnedTopics,
    ...recentTopics.filter(
      (topic) => !pinnedTopics.some((pinned) => pinned.id === topic.id),
    ),
  ].slice(0, maxTopicsToShow);

  // Show fewer entries than topics: topics are the primary way in, and the
  // panel still has to fit the capture button.
  const maxEntriesToShow = Math.max(2, maxTopicsToShow - 1);

  return {
    favoriteTopicsCount,
    favoriteEntriesCount,
    combinedTopics,
    maxTopicsToShow,
    recentEntries: recentEntries.slice(0, maxEntriesToShow),
    // Stays false until both counts have actually arrived, so the empty state
    // never flashes while the database is still opening.
    isLibraryEmpty: topicsCount === 0 && entriesCount === 0,
  };
}
