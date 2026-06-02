import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import {
  ArchiveIcon,
  ArchiveXIcon,
  FoldersIcon,
  MinusIcon,
  PinIcon,
  PinOffIcon,
  StarIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useRxCollection } from "rxdb/plugins/react";

interface TopicItemProps {
  topic: TopicDocType;
  // potentially more fields, like author, tags, etc.
}

function TopicItem({ topic }: TopicItemProps) {
  const navigate = useNavigate();
  const formattedDate = formatDate(topic.updatedAt);
  const collection = useRxCollection("topics");

  const handleAttributeToggle = async (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
    attribute: "isFavorite" | "isPinned" | "isArchived",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (collection) {
      const doc = await collection
        .findOne({ selector: { id: topic.id } })
        .exec();
      if (doc) {
        const newValue = !topic[attribute];
        const patch: any = { [attribute]: newValue };

        if (attribute === "isArchived" && newValue) {
          // If we're archiving, also unpin and unfavorite to avoid confusion.
          patch.isPinned = false;
          patch.isFavorite = false;
        } else if (
          (attribute === "isFavorite" || attribute === "isPinned") &&
          topic.isArchived
        ) {
          // If a topic is archived and the favorite or pin is toggled, unarchive it.
          patch.isArchived = false;
        }

        await doc.incrementalPatch(patch);
      }
    }
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    // Save scroll position as a plain number before navigating away
    const adjustedScrollTop = window.scrollY - 229; // Adjust for top bar height (and potential margin)
    sessionStorage.setItem("topicListScrollTop", adjustedScrollTop.toString());

    navigate(`/library/topics/${topic.id}`, { viewTransition: true });
  };

  return (
    <Item
      key={topic.id}
      variant="default"
      className={cn(
        "button-default cursor-pointer",
        "h-full /*min-h-26.25*/ flex-col items-start py-2.75 px-3.25 rounded-2xl",
        !topic.tags?.length && "pb-2.5",
        "bg-slate-200/75 hover:bg-slate-300/70 dark:bg-muted/50 dark:hover:bg-muted/80",
      )}
      asChild
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigate(e);
        }}
      >
        <div className="flex w-full justify-between items-start gap-3.5">
          <ItemContent
            className={cn(
              "flex-3 flex-col justify-between items-start gap-2 max-w-[calc(100%-100px)]",
              !topic.tags?.length && "gap-2.25",
            )}
          >
            <ItemTitle className="line-clamp-1 truncate max-w-full">
              {topic.name}
            </ItemTitle>
            <ItemDescription className="line-clamp-2 mt-px truncate max-w-[min(100%,550px)]">
              {topic.description || <MinusIcon className="inline size-2.5" />}
            </ItemDescription>
          </ItemContent>
          <ItemContent
            className={cn(
              "flex-1 flex-col justify-between items-end gap-3.25 mt-0.5",
              !topic.tags?.length && "gap-3.75",
            )}
          >
            <div className="flex justify-end items-center gap-2.5">
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "group size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                )}
                onClick={(e) => handleAttributeToggle(e, "isArchived")}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleAttributeToggle(e, "isArchived");
                }}
              >
                <ArchiveIcon
                  className={cn(
                    "size-4 transition-colors",
                    topic.isArchived
                      ? "text-green-500/75 dark:text-green-600"
                      : "text-gray-400/75 dark:text-gray-600 group-hover:text-gray-500/75 dark:group-hover:text-gray-400",
                  )}
                />
              </div>
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "group size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                )}
                onClick={async (e) => handleAttributeToggle(e, "isPinned")}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleAttributeToggle(e, "isPinned");
                }}
              >
                <PinIcon
                  className={cn(
                    "size-4",
                    topic.isPinned
                      ? "text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500"
                      : "text-gray-500/75 dark:text-gray-400",
                  )}
                />
              </div>
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
                )}
                onClick={async (e) => handleAttributeToggle(e, "isFavorite")}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleAttributeToggle(e, "isFavorite");
                }}
              >
                <StarIcon
                  className={cn(
                    "size-4",
                    topic.isFavorite
                      ? "text-yellow-600/60 fill-yellow-600/85 dark:text-yellow-500 dark:fill-yellow-500"
                      : "text-gray-500/75 dark:text-gray-400",
                  )}
                />
              </div>
            </div>
            <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedDate}
            </ItemDescription>
          </ItemContent>
        </div>
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 w-[90%] mt-0 h-5.5 overflow-hidden content-start">
            {topic.tags.map((tag, index) => (
              <span
                key={topic.id + "-tag-" + index}
                className="px-1.5 py-0.5 rounded-md bg-gray-400/37 dark:bg-gray-600/40 text-[11px] font-medium text-lc-muted-foreground-hover truncate max-w-30 min-w-0 shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
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
  const collection = useRxCollection("topics");
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
    if (!collection) return;

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
        const searchRegex = { $regex: escapedSearch, $options: "i" };
        selector.$or = [{ name: searchRegex }, { tags: searchRegex }];
        // TODO: Potentially add tags to the search.
        //? Maybe add description too, though preferably only indexed fields.
      } catch (error) {
        console.error("Failed to compile search regex:", error);
      }
    }

    const sub = collection
      .find({
        selector,
        sort: [{ isPinned: "desc" }, { updatedAt: "desc" }],
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
  }, [collection, search, onlyFavorites]);

  return (
    <>
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
              <TopicItem topic={topic} />
            </div>
          )}
        />
      )}
    </>
  );
}
