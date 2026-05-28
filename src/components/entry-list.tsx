import { Button, buttonVariants } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

import { getDb } from "@/db";
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { FilesIcon, MinusIcon, StarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

interface EntryItemProps {
  entry: EntryDocType;
  // potentially more fields, like author, tags, etc.
}

// TODO: Potentially show more properties for each Entry and make an entry item potentially taller.
function EntryItem({ entry }: EntryItemProps) {
  const navigate = useNavigate();
  const formattedDate = formatDate(entry.updatedAt);

  const handleFavoriteToggle = async (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const db = await getDb();
    if (db) {
      const doc = await db.collections.entries
        .findOne({ selector: { id: entry.id } })
        .exec();
      if (doc) {
        await doc.incrementalPatch({
          isFavorite: !entry.isFavorite,
        });
      }
    }
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    // Save scroll position as a plain number before navigating away
    const adjustedScrollTop = window.scrollY - 229; // Adjust for top bar height (and potential margin)
    sessionStorage.setItem("entryListScrollTop", adjustedScrollTop.toString());

    navigate(`/library/entries/${entry.id}`, { viewTransition: true });
  };

  return (
    <Item key={entry.id} variant="default" asChild>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          buttonVariants({ variant: "ghost" }), // add classes manually
          "cursor-pointer",
          "h-full /*min-h-26.25*/ flex-col items-start! pt-2.75! pb-2.75! px-3.25! rounded-2xl!",
          entry.tags.length === 0 && "pb-2.5!",
          "bg-slate-200/75 hover:bg-slate-300/70 dark:bg-muted/50 dark:hover:bg-muted/80",
        )}
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigate(e);
        }}
      >
        <div className="flex w-full justify-between items-start gap-4">
          <ItemContent
            className={cn(
              "flex-3 flex-col justify-between items-start gap-2",
              entry.tags.length === 0 && "gap-2.25",
            )}
          >
            <ItemTitle className="line-clamp-1 truncate max-w-[calc(100vw-178px)]">
              {entry.title}
            </ItemTitle>
            <ItemDescription className="line-clamp-2 truncate max-w-[min(calc(100vw-178px),550px)]">
              {entry.description || <MinusIcon className="inline size-2.5" />}
            </ItemDescription>
          </ItemContent>
          <ItemContent
            className={cn(
              "flex-1 flex-col justify-between items-end gap-3.25 mt-0.5",
              entry.tags.length === 0 && "gap-3.75 /*mt-0.5*/",
            )}
          >
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "size-6 min-w-6 flex justify-end p-1 -m-1 cursor-pointer rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-500 dark:focus-visible:ring-offset-gray-400 focus-visible:ring-gray-500/50",
              )}
              onClick={handleFavoriteToggle}
              onKeyDown={async (e) => {
                if (e.key === "Enter" || e.key === " ") handleFavoriteToggle(e);
              }}
            >
              <StarIcon
                className={cn(
                  "size-4",
                  entry.isFavorite
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
        {entry.tags && entry.tags.length > 0 && (
          <div
            // h-[22px] forces a single line height.
            // flex-wrap moves overflow tags to the 2nd line, which is hidden by overflow-hidden
            className="flex flex-wrap items-center gap-1.5 w-[90%] mt-0 h-5.5 overflow-hidden content-start"
          >
            {entry.tags.map((tag, index) => (
              <span
                key={tag + index}
                // shrink-0 prevents compressing; max-w-[150px] gives them plenty of room before truncating
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

interface EntryListProps {
  search: string;
  onlyFavorites: boolean;
}

export function EntryList({ search, onlyFavorites }: EntryListProps) {
  const [entries, setEntries] = useState<EntryDocType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  // On POP, restore the scroll position (plain number, no JSON overhead)
  const savedScrollTop = useMemo(() => {
    if (navigationType !== "POP") return 0;
    return parseInt(sessionStorage.getItem("entryListScrollTop") || "0", 10);
  }, [navigationType]);

  // If we arrived here via standard navigation (not back/POP), reset the Virtuoso state
  useEffect(() => {
    if (navigationType !== "POP") {
      sessionStorage.removeItem("entryListScrollTop");
    }
  }, [navigationType]);

  // Reset Virtuoso state when search or filters actively change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.removeItem("entryListScrollTop");
  }, [search, onlyFavorites]);

  useEffect(() => {
    let sub: any;

    const fetchEntries = async () => {
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
          selector.title = { $regex: escapedSearch, $options: "i" };
          //? Maybe add description too, though preferably only indexed fields.
        } catch (error) {
          console.error("Failed to compile search regex:", error);
        }
      }

      const query = db.collections.entries.find({
        selector,
        sort: [{ updatedAt: "desc" }], // TODO: Make sorting dynamic based on user selection (e.g. sort by createdAt, name, etc.). passed down from library page.
      });

      sub = query.$.subscribe({
        next: (results) => {
          // if (import.meta.env.DEV) {
          //   console.log(`[EntryList] ${results.length} entries loaded`);
          // }
          setEntries(results as EntryDocType[]);
          setIsDataLoaded(true);
        },
        error: (err) => {
          console.error("Error executing entries query:", err);
          setEntries([]);
          setIsDataLoaded(true);
        },
      });
    };

    fetchEntries();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [search, onlyFavorites]);

  // TODO: For wider screens or the windowed app, maybe add a two column layout.
  return (
    <div className="animate-in fade-in-40">
      <div className="flex items-center gap-2.5 w-full px-2 pb-0.5">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium /uppercase tracking-widest">
          <FilesIcon className="size-3.5 inline -mt-0.5" /> {entries.length}
          {/* {entries.length === 1 ? " item" : " items"} */}
        </span>
        <Separator className="flex-1" />
      </div>
      {isDataLoaded && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {search.trim() ? (
            <>
              <p className="text-muted-foreground mb-3">
                No entries found matching{" "}
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
                    `/library/entries/new?title=${encodeURIComponent(search)}`,
                    { viewTransition: true },
                  )
                }
              >
                Create Entry{" "}
                <span className="inline-block max-w-34 truncate align-bottom text-lc-muted-foreground-hover">
                  "{search}"
                </span>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-3">No entries found.</p>
              <Separator className="max-w-24 mx-auto mb-1" />
              <Button
                variant="link"
                onClick={() =>
                  navigate("/library/entries/new", { viewTransition: true })
                }
              >
                Create Entry
              </Button>
            </>
          )}
        </div>
      )}

      {isDataLoaded && entries.length > 0 && (
        <Virtuoso
          useWindowScroll
          initialScrollTop={savedScrollTop}
          data={entries}
          overscan={200}
          itemContent={(_, entry) => (
            <div className="px-1.25 py-1.5">
              <EntryItem entry={entry} />
            </div>
          )}
        />
      )}
    </div>
  );
}
