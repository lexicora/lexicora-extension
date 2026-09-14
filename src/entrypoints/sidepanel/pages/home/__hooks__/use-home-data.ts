import { useState, useEffect } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import type { TopicDocType } from "@/db/schemas/topic";
import type { EntryDocType } from "@/db/schemas/entry";
import { FEATURES } from "@/constants/features";
import {
  HOME_ENTRY_LIMIT,
  HOME_TOPIC_LIMIT,
  aiTopicRows,
  splitEntryRows,
} from "../home-capacity";

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
  /** Entries from the site in the active tab, cut to their share of the rows. */
  siteEntries: EntryDocType[];
  /** True once both collections are known to hold nothing at all. */
  isLibraryEmpty: boolean;
}

export function useHomeData({
  capturedPage = null,
  siteEntries = [],
}: {
  /** The entry for the page in the active tab, which takes a row of its own. */
  capturedPage?: EntryDocType | null;
  /** Everything else captured from that site, before it is cut to size. */
  siteEntries?: EntryDocType[];
} = {}): HomeData {
  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");

  const [favoriteTopicsCount, setFavoriteTopicsCount] = useState(0);
  const [favoriteEntriesCount, setFavoriteEntriesCount] = useState(0);
  const [pinnedTopics, setPinnedTopics] = useState<TopicDocType[]>([]);
  const [recentTopics, setRecentTopics] = useState<TopicDocType[]>([]);
  const [recentEntries, setRecentEntries] = useState<EntryDocType[]>([]);
  const [topicsCount, setTopicsCount] = useState<number | null>(null);
  const [entriesCount, setEntriesCount] = useState<number | null>(null);
  // Only drives the AI layout's topic count; see home-capacity.
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

  // Entries from the current site belong to their own group, so they are not
  // repeated under "Recent entries" — including the ones that did not fit.
  const sitePool = FEATURES.AI ? [] : siteEntries;
  const claimed = new Set([capturedPage?.id, ...sitePool.map((e) => e.id)]);
  const recentPool = recentEntries.filter((entry) => !claimed.has(entry.id));

  // Fixed counts, since the page scrolls. The AI layout keeps stepping with
  // the viewport, because its textarea claims whatever height is left.
  const { maxTopics, maxEntries } = FEATURES.AI
    ? {
        maxTopics: aiTopicRows(viewportHeight),
        maxEntries: Math.max(2, aiTopicRows(viewportHeight) - 1),
      }
    : { maxTopics: HOME_TOPIC_LIMIT, maxEntries: HOME_ENTRY_LIMIT };

  const { siteRows, recentRows } = splitEntryRows({
    maxEntries,
    siteAvailable: sitePool.length,
    recentAvailable: recentPool.length,
  });

  return {
    favoriteTopicsCount,
    favoriteEntriesCount,
    combinedTopics: allTopics.slice(0, maxTopics),
    maxTopicsToShow: maxTopics,
    recentEntries: recentPool.slice(0, recentRows),
    siteEntries: sitePool.slice(0, siteRows),
    // Stays false until both counts have actually arrived, so the empty state
    // never flashes while the database is still opening.
    isLibraryEmpty: topicsCount === 0 && entriesCount === 0,
  };
}
