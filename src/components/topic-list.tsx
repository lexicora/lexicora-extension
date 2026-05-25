import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

import { getDb } from "@/db";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { FoldersIcon, StarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

interface TopicItemProps {
  topic: TopicDocType;
  onNavigate?: (id: string) => void;
  // potentially more fields, like author, tags, etc.
}

function TopicItem({ topic, onNavigate }: TopicItemProps) {
  const navigate = useNavigate();

  const formattedDate = formatDate(topic.updatedAt);

  return (
    <Item key={topic.id} variant="default" asChild>
      <Button
        variant="ghost"
        className={cn(
          "h-full /*min-h-26.25*/ flex-col !items-start pt-3 pb-3.25 px-3.25 rounded-2xl",
          topic.tags.length === 0 && "pb-2.5",
          //"bg-gray-100/50 hover:bg-gray-200/60 dark:bg-gray-900/50 dark:hover:bg-gray-800/60",
          "bg-slate-200/75 hover:bg-slate-300/70 dark:bg-muted/50 dark:hover:bg-muted/80",
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
        <div className="flex w-full justify-between items-start gap-4">
          <ItemContent
            className={cn(
              "flex-3 flex-col justify-between items-start gap-2",
              topic.tags.length === 0 && "gap-2.25",
            )}
          >
            <ItemTitle className="line-clamp-1 truncate max-w-[calc(100vw-178px)]">
              {topic.name}
            </ItemTitle>
            <ItemDescription className="truncate max-w-[50vw]">
              {topic.description || "-"}
            </ItemDescription>
          </ItemContent>
          <ItemContent
            className={cn(
              "flex-1 flex-col justify-between items-end gap-3.25 mt-px",
              topic.tags.length === 0 && "gap-3.75 /mt-0.5",
            )}
          >
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
              )}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const db = await getDb();
                if (db) {
                  const doc = await db.collections.topics
                    .findOne({ selector: { id: topic.id } })
                    .exec();
                  if (doc) {
                    await doc.incrementalPatch({
                      isFavorite: !topic.isFavorite,
                    });
                  }
                }
              }}
            >
              <StarIcon
                className={cn(
                  "size-4",
                  topic.isFavorite
                    ? "text-yellow-600/75 fill-yellow-600/75 dark:text-yellow-500 dark:fill-yellow-500"
                    : "text-gray-500/75 dark:text-gray-400",
                )}
              />
            </div>
            <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedDate}
            </ItemDescription>
          </ItemContent>
        </div>

        {topic.tags && topic.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 w-full mt-0">
            {topic.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-md bg-gray-400/37 dark:bg-gray-600/40 text-[11px] font-medium text-lc-muted-foreground-hover truncate max-w-[100px]"
              >
                {tag}
              </span>
            ))}
            {topic.tags.length > 5 && (
              <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                +{topic.tags.length - 5}
              </span>
            )}
          </div>
        )}
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
  const isFirstRender = useRef(true);

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
          // TODO: Potentially add tags to the search.
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
          // if (import.meta.env.DEV) {
          //   console.log(`[EntryList] ${results.length} entries loaded`);
          // }
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
    <div className="animate-in fade-in-40">
      <div className="flex items-center gap-2.5 w-full px-2 pb-0.5">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium /uppercase tracking-widest">
          <FoldersIcon className="size-3.5 inline -mt-0.5" /> {topics.length}
          {/* {topics.length === 1 ? " item" : " items"} */}
        </span>
        <Separator className="flex-1" />
      </div>
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
          useWindowScroll
          initialScrollTop={savedScrollTop}
          data={topics}
          overscan={200}
          itemContent={(_, topic) => (
            <div className="px-1.25 py-1.5">
              <TopicItem
                topic={topic}
                onNavigate={(id) => {
                  // Save scroll position as a plain number before navigating away
                  const adjustedScrollTop = window.scrollY - 229; // Adjust for top bar height (and potential margin)
                  sessionStorage.setItem(
                    "topicListScrollTop",
                    adjustedScrollTop.toString(),
                  );
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
