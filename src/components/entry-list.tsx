import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

import { getDb } from "@/db";
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-formatter";
import { StarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

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
    <Item key={entry.id} variant="outline" asChild>
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
            onNavigate(entry.id);
          } else {
            navigate(`/library/entries/${entry.id}`, { viewTransition: true });
          }
        }}
      >
        <ItemContent className="flex-3 flex-col justify-between items-start /*gap-1.75*/ gap-[0.48rem]">
          <ItemTitle className="line-clamp-1 truncate max-w-[50vw]">
            {entry.title}
            {/* -{" "}
            <span className="text-muted-foreground">{entry.topicName}</span> */}
          </ItemTitle>
          <ItemDescription className="truncate max-w-[50vw]">
            {entry.description || "-"}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex-1 flex-col justify-between items-end gap-3">
          <div className="flex justify-end">
            <StarIcon
              className={cn(
                "size-4",
                entry.isFavorite
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

interface EntryListProps {
  search: string;
  onlyFavorites: boolean;
}

export function EntryList({ search, onlyFavorites }: EntryListProps) {
  const [entries, setEntries] = useState<EntryDocType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isFirstRender = useRef(true);

  // Load Virtuoso's last state to prevent layout thrashing on mount
  const restoredState = useMemo(() => {
    if (navigationType !== "POP") return undefined;
    const str = sessionStorage.getItem("entryListVirtuosoState");
    try {
      return str ? JSON.parse(str) : undefined;
    } catch {
      return undefined;
    }
  }, [navigationType]);

  // If we arrived here via standard navigation (not back/POP), reset the Virtuoso state
  useEffect(() => {
    if (navigationType !== "POP") {
      sessionStorage.removeItem("entryListVirtuosoState");
    }
  }, [navigationType]);

  // Reset Virtuoso state when search or filters actively change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.removeItem("entryListVirtuosoState");
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
                    `/library/entries/new?name=${encodeURIComponent(search)}`,
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
          ref={virtuosoRef}
          useWindowScroll
          restoreStateFrom={restoredState}
          data={entries}
          itemContent={(_, entry) => (
            <div className="px-1.5 py-1.5">
              <EntryItem
                entry={entry}
                onNavigate={(id) => {
                  // Capture exact dimensions and scroll boundaries before destroying the list
                  virtuosoRef.current?.getState((state) => {
                    sessionStorage.setItem(
                      "entryListVirtuosoState",
                      JSON.stringify(state),
                    );
                  });
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
