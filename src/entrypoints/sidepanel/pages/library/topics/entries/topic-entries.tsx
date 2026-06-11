import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { EntryList } from "@/components/entry-list";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import {
  ArchiveIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import {
  useNavigate,
  useNavigationType,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";

function TopicEntriesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicsCollection = useRxCollection("topics");

  // Capture scroll position NOW, during render, before any useEffect (e.g. setSearchParams
  // with { replace: true }) fires and changes navigationType from "POP" to "REPLACE".
  // By the time EntryList mounts (after the async filterReady gate), navigationType would
  // already be "REPLACE", causing EntryList's internal check to miss the saved position.
  const [restoredScrollTop] = useState<number | undefined>(() => {
    if (navigationType !== "POP") return undefined;
    return parseInt(sessionStorage.getItem(`entryList:${id ?? ""}`) || "0", 10);
  });

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const deferredSearch = useDeferredValue(search);
  const [showFavorites, setShowFavorites] = useState(
    searchParams.get("favorites") === "true",
  );
  const [showArchived, setShowArchived] = useState(
    searchParams.get("archived") === "true",
  );
  // true once we've read the topic's archived state and set the default filter.
  const [filterReady, setFilterReady] = useState(false);
  const [topicIsArchived, setTopicIsArchived] = useState(false);
  const filter = {
    onlyFavorites: showFavorites,
    onlyArchived: showArchived,
  } as const;

  useEffect(() => {
    if (!topicsCollection || !id) return;
    // Check mount-time URL — the archived param's *presence* (any value) means the user
    // explicitly chose a state, so the auto-default should not override it.
    const hasExplicitFilter =
      searchParams.get("favorites") === "true" ||
      searchParams.get("archived") !== null;
    topicsCollection
      .findOne({ selector: { id } })
      .exec()
      .then((doc) => {
        if (doc?.isArchived) {
          setTopicIsArchived(true);
          if (!hasExplicitFilter) setShowArchived(true);
        }
        setFilterReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsCollection, id]); // searchParams intentionally omitted — we only want the mount-time value

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        if (deferredSearch) {
          newParams.set("q", deferredSearch);
        } else {
          newParams.delete("q");
        }
        if (showFavorites) {
          newParams.set("favorites", "true");
        } else {
          newParams.delete("favorites");
        }
        // Always store the archived state (even false) so returning to the page after
        // explicitly turning off the filter doesn't re-trigger the archived auto-default.
        newParams.set("archived", showArchived ? "true" : "false");
        return newParams;
      },
      { replace: true },
    );
  }, [deferredSearch, showFavorites, showArchived, setSearchParams]);

  const handleToggleFilter = (
    type: "favorites" | "archived",
    pressed: boolean,
  ) => {
    if (type === "favorites") {
      setShowFavorites(pressed);
      if (pressed) setShowArchived(false);
    } else {
      setShowArchived(pressed);
      if (pressed) setShowFavorites(false);
    }
  };

  return (
    <PageContainer id="lc-topic-entries-page">
      <PageHeader
        title="Entries"
        classNameHeaderElement="mb-2.5"
        goBackButton
        goBackButtonTitle="Back to Topic"
      />
      <div className="flex items-center gap-1.75 px-1.25 pt-0.5 pb-1.5 dark:scheme-dark">
        <div className="flex-1">
          <Field orientation="horizontal">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                name="search"
                placeholder="Search entries..."
                className="h-8 px-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <InputGroupButton
                  size="icon-sm"
                  onClick={() => setSearch("")}
                  title="Clear search"
                  className="size-7.5 mr-0.5"
                >
                  <XIcon />
                </InputGroupButton>
              )}
            </InputGroup>
          </Field>
        </div>
        <div className="flex items-center gap-0">
          <Toggle
            title={showFavorites ? "Show all" : "Show only Favorites"}
            variant="outline"
            className="shrink-0 transition-colors min-w-9 size-9 rounded-r-none border-r-border/50"
            pressed={showFavorites}
            onPressedChange={(pressed) =>
              handleToggleFilter("favorites", pressed)
            }
          >
            <StarIcon className="group-data-[state=on]/toggle:text-yellow-600 group-data-[state=on]/toggle:fill-yellow-600 dark:group-data-[state=on]/toggle:text-yellow-500 dark:group-data-[state=on]/toggle:fill-yellow-500" />
          </Toggle>
          <Toggle
            title={showArchived ? "Show all" : "Show only Archived"}
            variant="outline"
            className="shrink-0 transition-colors min-w-9 size-9 rounded-l-none -ml-px not-data-[state=on]:border-l-border/90"
            pressed={showArchived}
            onPressedChange={(pressed) =>
              handleToggleFilter("archived", pressed)
            }
          >
            <ArchiveIcon className="group-data-[state=on]/toggle:text-green-600 dark:group-data-[state=on]/toggle:text-green-500" />
          </Toggle>
        </div>
      </div>

      {filterReady && (
        <main className="mb-1.25 mt-px">
          <EntryList
            topicId={id}
            search={deferredSearch}
            filter={filter}
            scrollStorageKey={`entryList:${id}`}
            topUIScrollOffset={184}
            disableCreate={topicIsArchived}
            restoredScrollTop={restoredScrollTop}
          />
        </main>
      )}

      {/* Floating create entry button — hidden for archived topics */}
      {!topicIsArchived && (
        <div className="fixed bottom-17.75 left-0 w-full px-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-20 pointer-events-none">
          <div className="shrink-0 flex items-center justify-end max-w-[calc(var(--lc-content-max-width)+0.25rem)] mx-auto inset-x-0">
            <Button
              size="icon"
              title="Create Entry"
              draggable={false}
              className="pointer-events-auto button-create"
              onClick={() =>
                navigate(
                  `/library/entries/new?topicId=${encodeURIComponent(id ?? "")}`,
                  { viewTransition: true },
                )
              }
            >
              <PlusIcon className="size-5" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default TopicEntriesPage;
