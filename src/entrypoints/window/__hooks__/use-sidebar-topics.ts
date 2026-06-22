import { useEffect, useState } from "react";
import { useRxCollection } from "rxdb/plugins/react";
import type { TopicDocType } from "@/db/schemas/topic";

const RECENT_LIMIT = 7;

export interface SidebarTopicsData {
  pinnedTopics: TopicDocType[];
  recentTopics: TopicDocType[];
}

/**
 * Reactive topic data for the windowed sidebar.
 *
 * - `pinnedTopics`: non-archived topics with `isPinned: true`, newest first.
 * - `recentTopics`: non-archived topics, newest first, limited to 7 and
 *   excluding any topic already shown in the pinned section.
 *
 * Mirrors the RxDB subscription pattern in the side-panel home's `useHomeData`.
 */
export function useSidebarTopics(): SidebarTopicsData {
  const topicsCollection = useRxCollection("topics");

  const [pinnedTopics, setPinnedTopics] = useState<TopicDocType[]>([]);
  const [recentTopics, setRecentTopics] = useState<TopicDocType[]>([]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({
        selector: { isPinned: true, isArchived: false },
        sort: [{ updatedAt: "desc" }],
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
    // Fetch a small buffer beyond RECENT_LIMIT so that excluding pinned topics
    // still leaves enough recent items to fill the section.
    const sub = topicsCollection
      .find({
        selector: { isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: RECENT_LIMIT + pinnedTopics.length,
      })
      .$.subscribe({
        next: (docs) =>
          setRecentTopics(docs.map((d) => d.toJSON() as TopicDocType)),
        error: () => setRecentTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection, pinnedTopics.length]);

  const pinnedIds = new Set(pinnedTopics.map((t) => t.id));
  const filteredRecent = recentTopics
    .filter((t) => !pinnedIds.has(t.id))
    .slice(0, RECENT_LIMIT);

  return { pinnedTopics, recentTopics: filteredRecent };
}
