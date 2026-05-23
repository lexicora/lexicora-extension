import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

import { getDb } from "@/db";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

interface TopicItemProps {
  topic: TopicDocType;
  onNavigate?: (id: string) => void;
  // potentially more fields, like author, tags, etc.
}

function TopicItem({ topic, onNavigate }: TopicItemProps) {
  const navigate = useNavigate();

  // Format the date using the modern Temporal API (with a standard Date fallback).
  // We use `updatedAt` because library items are typically sorted and searched by recent activity.
  const formattedDate = (() => {
    try {
      // @ts-ignore - TS might not have Temporal types inherently available yet.
      const instant = Temporal.Instant.from(topic.updatedAt);
      return instant.toLocaleString(navigator.language, {
        dateStyle: "medium", // 'medium' is usually nicely balanced (e.g. Oct 18, 2026)
        timeStyle: "short",
      });
    } catch (e) {
      // Safe fallback if Temporal throws/isn't supported
      return new Date(topic.updatedAt).toLocaleString(navigator.language, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  })();

  return (
    <Item key={topic.id} variant="outline" asChild>
      <Button
        variant="outline"
        className={cn(
          "h-full py-3 px-3.5 rounded-lg",
          "bg-gray-100/50 hover:bg-gray-200/60 dark:bg-gray-900/50 dark:hover:bg-gray-800/60",
          // TODO: Maybe change colors, to zero border, but then the background more prominent.
        )}
        onClick={(e) => {
          e.preventDefault();
          if (onNavigate) {
            onNavigate(topic.id);
          } else {
            navigate(`/library/topics/${topic.id}`, { viewTransition: true });
          }
        }}
      >
        <ItemContent className="flex-3 flex-col justify-between items-start /*gap-1.75*/ gap-[0.48rem]">
          <ItemTitle className="line-clamp-1 truncate max-w-[50vw]">
            {topic.name}
            {/* -{" "}
            <span className="text-muted-foreground">{formattedDate}</span> */}
          </ItemTitle>
          {/* <ItemDescription>
            {topic.entryCount} {topic.entryCount === 1 ? "entry" : "entries"}
          </ItemDescription> */}
          <ItemDescription className="truncate max-w-[50vw]">
            {topic.description || "-"}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex-1 flex-col justify-between items-end gap-3">
          <div className="flex justify-end">
            <StarIcon
              className={cn(
                "size-4",
                topic.isFavorite
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-400",
              )}
            />
          </div>
          <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </ItemDescription>
        </ItemContent>
      </Button>
    </Item>
  );
}

// TODO: Maybe put the logic of setting the stuff for session storage in the return of component useEffect return statement for unmount.

interface TopicListProps {
  search: string;
  onlyFavorites: boolean;
}

export function TopicList({ search, onlyFavorites }: TopicListProps) {
  const [topics, setTopics] = useState<TopicDocType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isFirstRender = useRef(true);

  // Load Virtuoso's last state to prevent layout thrashing on mount
  const restoredState = useMemo(() => {
    if (navigationType !== "POP") return undefined;
    const str = sessionStorage.getItem("topicListVirtuosoState");
    try {
      return str ? JSON.parse(str) : undefined;
    } catch {
      return undefined;
    }
  }, [navigationType]);

  // If we arrived here via standard navigation (not back/POP), reset the Virtuoso state
  useEffect(() => {
    if (navigationType !== "POP") {
      sessionStorage.removeItem("topicListVirtuosoState");
    }
  }, [navigationType]);

  // Reset Virtuoso state when search or filters actively change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.removeItem("topicListVirtuosoState");
  }, [search, onlyFavorites]);

  useEffect(() => {
    let sub: any;

    const fetchTopics = async () => {
      const db = await getDb();
      if (!db) return;

      const selector: any = {};
      if (onlyFavorites) {
        selector.isFavorite = true;
      }

      if (search.trim()) {
        try {
          // Escape special characters so they are treated as literals
          const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

          // Test the regex string before using it
          new RegExp(escapedSearch, "i");

          // RxDB requires the regex operator to be a string
          selector.name = { $regex: escapedSearch, $options: "i" };
          //? Maybe add description too, though preferably only indexed fields.
        } catch (error) {
          console.error("Failed to compile search regex:", error);
        }
      }

      const query = db.collections.topics.find({
        selector,
        sort: [{ updatedAt: "desc" }], // TODO: Make sorting dynamic based on user selection (e.g. sort by createdAt, name, etc.). passed down from library page.
      });

      sub = query.$.subscribe({
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
    };

    fetchTopics();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [search, onlyFavorites]);

  return (
    <div /* maybe change to render fragment */>
      {isDataLoaded && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
          ref={virtuosoRef}
          useWindowScroll
          restoreStateFrom={restoredState}
          data={topics}
          itemContent={(_, topic) => (
            <div className="px-1.5 py-1.5">
              <TopicItem
                topic={topic}
                onNavigate={(id) => {
                  // Capture exact dimensions and scroll boundaries before destroying the list
                  virtuosoRef.current?.getState((state) => {
                    sessionStorage.setItem(
                      "topicListVirtuosoState",
                      JSON.stringify(state),
                    );
                  });
                  navigate(`/library/topics/${id}`, { viewTransition: true });
                }}
              />
            </div>
          )}
        />
      )}
    </div>
  );
}
