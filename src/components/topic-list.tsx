import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { TopicItem } from "@/components/topic-item";
import type { TopicDocType } from "@/db/schemas/topic";
import { FoldersIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  NavigationType,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useRxCollection } from "rxdb/plugins/react";
import type { MangoQuerySelector } from "rxdb";
import { parseSearchQuery, searchTextPattern } from "@/lib/search-query";

interface TopicListProps {
  search: string;
  filter?: {
    onlyFavorites: boolean;
    onlyArchived: boolean;
  };
  topUIScrollOffset?: number; // Optional prop to adjust scroll position when navigating back from detail view with a top UI (like the bottom nav)
}

export function TopicList({
  search,
  filter,
  topUIScrollOffset,
}: TopicListProps) {
  const [topics, setTopics] = useState<TopicDocType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const collection = useRxCollection("topics");
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const onlyFavorites = filter?.onlyFavorites ?? false;
  const onlyArchived = filter?.onlyArchived ?? false;

  // A site filter is about where an entry was captured from, and a topic
  // has no site — so it matches no topics, rather than being ignored and
  // quietly listing every one of them.
  const matchesNoTopics = parseSearchQuery(search).site !== null;

  // On POP, restore the scroll position (plain number, no JSON overhead)
  const savedScrollTop = useMemo(() => {
    if (navigationType !== NavigationType.Pop) return 0;
    return parseInt(sessionStorage.getItem("topicListScrollTop") || "0", 10);
  }, [navigationType]);

  // If we arrived here via standard navigation (not back/POP), clear saved scroll
  useEffect(() => {
    if (navigationType !== NavigationType.Pop) {
      sessionStorage.removeItem("topicListScrollTop");
    }
  }, [navigationType]);

  // Clear saved scroll when search or filters actively change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.removeItem("topicListScrollTop");
  }, [search, onlyFavorites, onlyArchived]);

  useEffect(() => {
    if (!collection || matchesNoTopics) return;

    const { text } = parseSearchQuery(search);

    const selector: MangoQuerySelector<TopicDocType> = {};
    if (onlyArchived) {
      selector.isArchived = true;
    } else {
      selector.isArchived = false;
    }

    if (onlyFavorites) {
      selector.isFavorite = true;
    }

    // Matched against the pre-lowercased searchBlob (name + tags + description snippet)
    const pattern = searchTextPattern(text);
    if (pattern) selector.searchBlob = { $regex: pattern };

    const sub = collection
      .find({
        selector,
        sort: onlyArchived
          ? [{ updatedAt: "desc" }]
          : [{ isPinned: "desc" }, { updatedAt: "desc" }],
      })
      .$.subscribe({
        next: (results) => {
          setTopics(results as TopicDocType[]);
          setIsDataLoaded(true);
        },
        error: (err) => {
          console.error("Error executing topics query:", err);
          setTopics([]);
          setIsDataLoaded(true);
        },
      });

    return () => sub.unsubscribe();
  }, [collection, search, onlyFavorites, onlyArchived, matchesNoTopics]);

  const visibleTopics = matchesNoTopics ? [] : topics;
  const isLoaded = matchesNoTopics || isDataLoaded;

  return (
    <>
      <div className="flex items-center gap-2.5 w-full px-1.5 pb-0.75">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium tracking-widest">
          <FoldersIcon className="size-3.5 inline -mt-0.5" /> {visibleTopics.length}
          {/* {topics.length === 1 ? " item" : " items"} */}
        </span>
        <Separator className="flex-1" />
      </div>
      {isLoaded && visibleTopics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
            {search.trim() ? (
            <>
              <p className="text-muted-foreground mb-3">
                No topics found matching{" "}
                <span className="text-lc-muted-foreground-hover inline-block max-w-32 truncate align-bottom">
                  "{search}"
                </span>
                . <br /> Try changing your search query.
              </p>
              <div className="flex justify-center items-center gap-3 w-1/6 max-w-24 mx-auto mb-1">
                <Separator />
                <span className="text-muted-foreground">or</span>
                <Separator />
              </div>
              <Button
                variant="link"
                onClick={() =>
                  navigate(
                    `/library/topics/new?name=${encodeURIComponent(search)}`,
                    { viewTransition: true },
                  )
                }
              >
                Create Topic{" "}
                <span className="inline-block max-w-34 truncate align-bottom text-lc-muted-foreground-hover">
                  "{search}"
                </span>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-3">No topics found.</p>
              <Separator className="max-w-24 mx-auto mb-1" />
              <Button
                variant="link"
                onClick={() =>
                  navigate("/library/topics/new", { viewTransition: true })
                }
              >
                Create Topic
              </Button>
            </>
          )}
        </div>
      )}

      {isLoaded && visibleTopics.length > 0 && (
        <Virtuoso
          useWindowScroll
          initialScrollTop={savedScrollTop}
          data={visibleTopics}
          // Two different knobs: overscan chunks the rendering so scrolling
          // causes fewer re-renders, while increaseViewportBy renders items
          // before they come into view — that is the one that stops an item
          // appearing late. Downwards is where reading happens, so it gets
          // more. Both cost DOM nodes, so raise them in small steps.
          overscan={220} // MAYBE: increase/decrease (was initially 200)
          increaseViewportBy={{ top: 200, bottom: 400 }}
          // A render function Virtuoso calls, not a component, so nothing remounts.
          // oxlint-disable-next-line react/no-unstable-nested-components
          itemContent={(_, topic) => (
            <div className="px-0.75 py-1.25">
              <TopicItem topic={topic} topUIScrollOffset={topUIScrollOffset} />
            </div>
          )}
        />
      )}
    </>
  );
}
