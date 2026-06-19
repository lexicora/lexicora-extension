import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { EntryItem } from "@/components/entry-item";
import { EntryDocType } from "@/db/schemas/entry";
import { cn } from "@/lib/utils";
import { FilesIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useRxCollection } from "rxdb/plugins/react";
import type { MangoQuerySelector } from "rxdb";

// TODO: Maybe put the logic of setting the stuff for session storage in the return of component useEffect return statement for unmount.

interface EntryListProps {
  search: string;
  filter?: {
    onlyFavorites: boolean;
    onlyArchived: boolean;
  };
  // When set, only entries belonging to this topic are shown.
  topicId?: string;
  topUIScrollOffset?: number; // Optional prop to adjust scroll position when navigating back from detail view with a top UI (like the bottom nav)
  // sessionStorage key for scroll restoration. Override to namespace lists that
  // can coexist across routes (e.g. the per-topic embedded list).
  scrollStorageKey?: string;
  // When true, hides the "Create Entry" buttons in empty-state UI.
  disableCreate?: boolean;
  // Pre-computed scroll position to restore. Pass when the parent captures the
  // position during render before any effects can change the navigation type.
  restoredScrollTop?: number;
}

export function EntryList({
  search,
  filter,
  topicId,
  topUIScrollOffset,
  scrollStorageKey = "entryListScrollTop",
  disableCreate = false,
  restoredScrollTop: restoredScrollTopProp,
}: EntryListProps) {
  const [entries, setEntries] = useState<EntryDocType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const collection = useRxCollection("entries");
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const onlyFavorites = filter?.onlyFavorites ?? false;
  const onlyArchived = filter?.onlyArchived ?? false;

  // On POP, restore the scroll position (plain number, no JSON overhead).
  // When the parent pre-computes the value (restoredScrollTopProp), use it directly —
  // the parent captures it before any useEffect can change navigationType.
  const savedScrollTop = useMemo(() => {
    if (restoredScrollTopProp !== undefined) return restoredScrollTopProp;
    if (navigationType !== "POP") return 0;
    return parseInt(sessionStorage.getItem(scrollStorageKey) || "0", 10);
  }, [navigationType, scrollStorageKey, restoredScrollTopProp]);

  // If we arrived here via standard navigation (not back/POP), reset the Virtuoso state
  useEffect(() => {
    if (navigationType !== "POP") {
      sessionStorage.removeItem(scrollStorageKey);
    }
  }, [navigationType, scrollStorageKey]);

  // Reset Virtuoso state when search or filters actively change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.removeItem(scrollStorageKey);
  }, [search, onlyFavorites, onlyArchived, scrollStorageKey]);

  useEffect(() => {
    if (!collection) return;

    const selector: MangoQuerySelector<EntryDocType> = {};

    if (topicId) {
      selector.topicId = topicId;
    }

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

        // Query against the pre-lowercased searchBlob (title + tags + description snippet + siteName)
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
          setEntries(results as EntryDocType[]);
          setIsDataLoaded(true);
        },
        error: (err) => {
          console.error("Error executing entries query:", err);
          setEntries([]);
          setIsDataLoaded(true);
        },
      });

    return () => sub.unsubscribe();
  }, [collection, search, onlyFavorites, onlyArchived, topicId]);

  // TODO: For wider screens or the windowed app, maybe add a two column layout.
  return (
    <>
      <div className="flex items-center gap-2.5 w-full px-1.5 pb-0.75">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium tracking-widest">
          <FilesIcon className="size-3.5 inline -mt-0.5" /> {entries.length}
          {/* {entries.length === 1 ? " item" : " items"} */}
        </span>
        <Separator className="flex-1" />
      </div>
      {isDataLoaded && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
          {search.trim() ? (
            <>
              <p className="text-muted-foreground mb-3">
                No entries found matching{" "}
                <span className="text-lc-muted-foreground-hover inline-block max-w-32 truncate align-bottom">
                  "{search}"
                </span>
                . <br /> Try changing your search query.
              </p>
              {!disableCreate && (
                <>
                  <div className="flex justify-center items-center gap-3 w-1/6 max-w-24 mx-auto mb-1">
                    <Separator />
                    <span className="text-muted-foreground">or</span>
                    <Separator />
                  </div>
                  <Button
                    variant="link"
                    onClick={() =>
                      navigate(
                        `/library/entries/new?title=${encodeURIComponent(search)}${topicId ? `&topicId=${encodeURIComponent(topicId)}` : ""}`,
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
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-3">No entries found.</p>
              {!disableCreate && (
                <>
                  <Separator className="max-w-24 mx-auto mb-1" />
                  <Button
                    variant="link"
                    onClick={() =>
                      navigate(
                        `/library/entries/new${topicId ? `?topicId=${encodeURIComponent(topicId)}` : ""}`,
                        { viewTransition: true },
                      )
                    }
                  >
                    Create Entry
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {isDataLoaded && entries.length > 0 && (
        <Virtuoso
          useWindowScroll
          initialScrollTop={savedScrollTop}
          data={entries}
          overscan={220} // TODO: potentially increase/decrease (was initially 200)
          itemContent={(_, entry) => (
            <div className="px-0.75 py-1.25">
              <EntryItem
                entry={entry}
                topUIScrollOffset={topUIScrollOffset}
                scrollStorageKey={scrollStorageKey}
              />
            </div>
          )}
        />
      )}
    </>
  );
}
