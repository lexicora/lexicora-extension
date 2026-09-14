import { useState, useEffect } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import type { TopicDocType } from "@/db/schemas/topic";
import type { EntryDocType } from "@/db/schemas/entry";
import { FEATURES } from "@/constants/features";
import { aiTopicRows, allocateHomeRows, homeRowSpace } from "../home-capacity";

/**
 * How many rows the queries fetch. The home page shows as many as fit, which
 * on a tall side panel is more than the old fixed three — this is the ceiling
 * on that, not the number displayed.
 */
const QUERY_LIMIT = 12;

export interface HomeData {
  favoriteTopicsCount: number;
  favoriteEntriesCount: number;
  /** Pinned first, then recent, de-duplicated, cut to what fits. */
  combinedTopics: TopicDocType[];
  /** How many topics fit, so the page knows whether to offer "Create a topic". */
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
  const [viewportHeight, setViewportHeight] = useState(
    () => document.documentElement.clientHeight,
  );

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
        limit: QUERY_LIMIT,
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
        limit: QUERY_LIMIT,
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
        limit: QUERY_LIMIT,
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
    const update = () => setViewportHeight(document.documentElement.clientHeight);
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const allTopics = [
    ...pinnedTopics,
    ...recentTopics.filter(
      (topic) => !pinnedTopics.some((pinned) => pinned.id === topic.id),
    ),
  ];

  // With the AI prompt on, the topic count is what is left once the textarea
  // has its height. With it off, the rows share out the space the textarea is
  // not using, which is why the page no longer stops at three.
  const { maxTopics, maxEntries } = FEATURES.AI
    ? {
        maxTopics: aiTopicRows(viewportHeight),
        maxEntries: Math.max(2, aiTopicRows(viewportHeight) - 1),
      }
    : allocateHomeRows({
        availablePx: homeRowSpace(viewportHeight),
        topicsAvailable: allTopics.length,
        entriesAvailable: recentEntries.length,
      });

  return {
    favoriteTopicsCount,
    favoriteEntriesCount,
    combinedTopics: allTopics.slice(0, maxTopics),
    maxTopicsToShow: maxTopics,
    recentEntries: recentEntries.slice(0, maxEntries),
    // Stays false until both counts have actually arrived, so the empty state
    // never flashes while the database is still opening.
    isLibraryEmpty: topicsCount === 0 && entriesCount === 0,
  };
}
