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
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { StarIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

interface EntryItemProps {
  entry: EntryDocType;
  onNavigate?: (id: string) => void;
  // potentially more fields, like author, tags, etc.
}

// TODO: Potentially show more properties for each Entry and make an entry item potentially taller.
function EntryItem({ entry, onNavigate }: EntryItemProps) {
  const navigate = useNavigate();

  const formattedDate = formatDate(entry.updatedAt);

  return (
    <Item key={entry.id} variant="default" asChild>
      <Button
        variant="ghost"
        className={cn(
          "h-full pt-3 pb-2.5 px-3.25 rounded-2xl",
          // "bg-gray-100/50 hover:bg-gray-200/60 dark:bg-gray-900/50 dark:hover:bg-gray-800/60",
          "bg-slate-200/75 hover:bg-slate-300/70 dark:bg-muted/50 dark:hover:bg-muted/80",
          // TODO: Maybe change colors, to zero border, but then the background more prominent.
        )}
        onClick={(e) => {
          e.preventDefault();
          if (onNavigate) {
            onNavigate(entry.id);
          } else {
            navigate(`/library/entries/${entry.id}`, { viewTransition: true });
          }
        }}
      >
        <ItemContent className="flex-3 flex-col justify-between items-start /*gap-1.75*/ /*gap-[0.48rem]*/ gap-2.25">
          <ItemTitle className="line-clamp-1 truncate max-w-[50vw]">
            {entry.title}
            {/* -{" "}
            <span className="text-muted-foreground">{entry.topicName}</span> */}
          </ItemTitle>
          <ItemDescription className="truncate max-w-[50vw]">
            {entry.description || "-"}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex-1 flex-col justify-between items-end gap-3.5">
          <Toggle
            className="size-6 min-w-6 /*group*/ flex justify-end p-1 -m-1 rounded-md transition-colors hover:bg-slate-400/30 dark:hover:bg-slate-700"
            onClick={async (e) => {
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
                    //updatedAt: new Date().toISOString(),
                  });
                }
              }
            }}
          >
            <StarIcon
              className={cn(
                "size-4 /*transition-transform*/ /*group-hover:scale-110*/ /*active:scale-95*/",
                entry.isFavorite
                  ? "text-yellow-600/75 fill-yellow-600/75 dark:text-yellow-500 dark:fill-yellow-500"
                  : "text-gray-500/75 dark:text-gray-400 /*group-hover:text-yellow-500/70*/",
              )}
            />
          </Toggle>
          <ItemDescription className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </ItemDescription>
        </ItemContent>
      </Button>
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
    <div className={cn("animate-in fade-in-60")}>
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
              <EntryItem
                entry={entry}
                onNavigate={(id) => {
                  // Save scroll position as a plain number before navigating away
                  const adjustedScrollTop = window.scrollY - 236;
                  sessionStorage.setItem(
                    "entryListScrollTop",
                    adjustedScrollTop.toString(),
                  );
                  navigate(`/library/entries/${id}`, { viewTransition: true });
                }}
              />
            </div>
          )}
        />
      )}
    </div>
  );
}
