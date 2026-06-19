import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { TopicItem } from "@/components/topic-item";
import { TopicDocType } from "@/db/schemas/topic";
import { FoldersIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useRxCollection } from "rxdb/plugins/react";
import type { MangoQuerySelector } from "rxdb";

// TODO: Maybe put the logic of setting the stuff for session storage in the return of component useEffect return statement for unmount.

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

  // On POP, restore the scroll position (plain number, no JSON overhead)
  const savedScrollTop = useMemo(() => {
    if (navigationType !== "POP") return 0;
    return parseInt(sessionStorage.getItem("topicListScrollTop") || "0", 10);
  }, [navigationType]);

  // If we arrived here via standard navigation (not back/POP), clear saved scroll
  useEffect(() => {
    if (navigationType !== "POP") {
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
    if (!collection) return;

    const selector: MangoQuerySelector<TopicDocType> = {};
    if (onlyArchived) {
      selector.isArchived = true;
    } else {
      selector.isArchived = false;
    }

    if (onlyFavorites) {
      selector.isFavorite = true;
    }

    if (search.trim()) {
      try {
        // Escape special characters so they are treated as literals
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Test the regex string before using it
        new RegExp(escapedSearch, "i");

        // Query against the pre-lowercased searchBlob (name + tags + description snippet)
        selector.searchBlob = { $regex: escapedSearch.toLowerCase() };
      } catch (error) {
        console.error("Failed to compile search regex:", error);
      }
    }

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
  }, [collection, search, onlyFavorites, onlyArchived]);

  return (
    <>
      <div className="flex items-center gap-2.5 w-full px-1.5 pb-0.75">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium tracking-widest">
          <FoldersIcon className="size-3.5 inline -mt-0.5" /> {topics.length}
          {/* {topics.length === 1 ? " item" : " items"} */}
        </span>
        <Separator className="flex-1" />
      </div>
      {isDataLoaded && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
          {/*TODO: Potentially reset search params, except for topic or entry tab, when navigating to create a new topic or entry */}
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

      {isDataLoaded && topics.length > 0 && (
        <Virtuoso
          useWindowScroll
          initialScrollTop={savedScrollTop}
          data={topics}
          overscan={220} // TODO: potentially increase/decrease (was initially 200)
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
