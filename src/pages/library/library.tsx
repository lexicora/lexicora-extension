import { EntryList } from "@/components/entry-list";
import { TopicList } from "@/components/topic-list";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  ArchiveIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAppHost } from "@/providers/app-host";

// TODO: Potentially make searching faster, when entering a search query, because on every character, a navigation takes place.
// TODO: Also ensure, that when on a tab, the other tabs should not be rendered and in a way put to sleep, so they don't do unnecessary processing.

// NOTE: Pages are side-panel-first, so `isWindowed` defaults to false. The windowed
// entrypoint opts in via App.tsx. TODO: migrate host detection to a provider later.
function LibraryPage({ hideTabBar = false }: { hideTabBar?: boolean }) {
  const { isWindowed } = useAppHost();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const deferredSearch = useDeferredValue(search);
  const [showFavorites, setShowFavorites] = useState(
    searchParams.get("favorites") === "true",
  );
  const [showArchived, setShowArchived] = useState(
    searchParams.get("archived") === "true",
  );
  const filter = {
    onlyFavorites: showFavorites,
    onlyArchived: showArchived,
  } as const;

  const handleToggleFilter = (
    type: "favorites" | "archived",
    pressed: boolean,
  ) => {
    if (type === "favorites") {
      setShowFavorites(pressed);
      if (pressed) {
        setShowArchived(false);
      }
    } else {
      setShowArchived(pressed);
      if (pressed) {
        setShowFavorites(false);
      }
    }
  };

  // TODO: Potentially reset search params, except for topic or entry tab, when navigating to create a new topic or entry.

  const activeTab = searchParams.get("tab") || "entries";
  const targetTabRef = useRef(activeTab);

  useEffect(() => {
    targetTabRef.current = activeTab;
  }, [activeTab]);

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

        if (showArchived) {
          newParams.set("archived", "true");
        } else {
          newParams.delete("archived");
        }
        return newParams;
      },
      { replace: true },
    );
  }, [deferredSearch, showFavorites, showArchived, setSearchParams]);

  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // If it's already the same tab, don't do anything
    if (value === targetTabRef.current) return;

    targetTabRef.current = value;

    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", value);
        return newParams;
      },
      { replace: true, viewTransition: true },
    );
  };

  return (
    <PageContainer className="pb-1.75!" isWindowed={isWindowed}>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <PageHeader title="Library" classNameHeaderElement="mb-0">
          <div className="mt-4 mx-1">
            <div id="search" className="dark:scheme-dark">
              <Field orientation="horizontal">
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="search-input"
                    //type="search"
                    placeholder="Search..."
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
            <div
              id="tab-switcher-favorites-toggle"
              className="mx-2 mt-4 mb-0 flex items-center justify-center"
            >
              {/* Maybe put toggle inline with search input or potentially move to the right side of the tab-list */}
              <Toggle
                title={showFavorites ? "Show all" : "Show only Favorites"}
                variant="outline"
                className="shrink-0 transition-colors min-w-7.5 size-7.5"
                pressed={showFavorites}
                onPressedChange={(pressed) =>
                  handleToggleFilter("favorites", pressed)
                }
              >
                <StarIcon className="group-data-[state=on]/toggle:text-yellow-600 group-data-[state=on]/toggle:fill-yellow-600 dark:group-data-[state=on]/toggle:text-yellow-500 dark:group-data-[state=on]/toggle:fill-yellow-500" />
              </Toggle>
              {/*Group Tabs of pure entries and topics (grouping of entries) and sites (grouping of entries based on their sites url grouped and matched) */}
              {!hideTabBar && (
                <div className="flex-1 /*mr-7.5*/">
                  <TabsList className="h-8! py-[0.16rem]">
                    <TabsTrigger value="entries">Entries</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                    {/* <TabsTrigger value="sites">Sites</TabsTrigger> */}
                  </TabsList>
                </div>
              )}
              <Toggle
                title={showArchived ? "Show all" : "Show only Archived"}
                variant="outline"
                className="shrink-0 transition-colors min-w-7.5 size-7.5"
                pressed={showArchived}
                onPressedChange={(pressed) =>
                  handleToggleFilter("archived", pressed)
                }
              >
                <ArchiveIcon className="group-data-[state=on]/toggle:text-green-600 dark:group-data-[state=on]/toggle:text-green-500" />
              </Toggle>
              {/* TODO: Implement a filter menu here, to filter by different stuff and also implement toggle to sort by updated or created, 
              also potentially save the current filter to browser local storage */}
              {/* Potentially use later for if more options come up and advanced filters become relevant.
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm" className="size-7.5">
                    <ListFilterIcon className="" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="select-none py-1">
                      Filter
                    </DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                    //checked={showStatusBar ?? false}
                    //onCheckedChange={setShowStatusBar}
                    >
                      Status Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      //checked={showActivityBar}
                      //onCheckedChange={setShowActivityBar}
                      disabled
                    >
                      Activity Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                    //checked={showPanel}
                    //onCheckedChange={setShowPanel}
                    >
                      Panel
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
            {/* <Separator className="" /> */}
          </div>
        </PageHeader>
        <TabsContent value="entries">
          <main className="mb-0">
            <EntryList
              search={deferredSearch}
              filter={filter}
              topUIScrollOffset={234}
            />
          </main>
        </TabsContent>
        <TabsContent value="topics">
          <main className="mb-0">
            <TopicList
              search={deferredSearch}
              filter={filter}
              topUIScrollOffset={234}
            />
          </main>
        </TabsContent>
        {/* <TabsContent value="sites">
          <main>
            <p>Sites</p>
          </main>
        </TabsContent> */}
        <footer></footer>
      </Tabs>
      <div className="fixed bottom-17.75 left-[var(--lc-host-inset-left,0px)] right-0 transition-[left] duration-200 ease-linear px-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] /*WAS:pr-[calc(var(--lc-scrollbar-offset)+7px)]*/ z-20 pointer-events-none">
        <div className="shrink-0 flex items-center justify-end max-w-[calc(var(--lc-content-max-width)+0.25rem)] mx-auto inset-x-0">
          {/*MAYBE: Make smaller and also maybe a bit darker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                title="Create..."
                draggable={false}
                className="pointer-events-auto button-create"
              >
                <PlusIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="min-w-28 /*min-w-21*/ /*bg-popover/80 backdrop-blur-md*/"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="select-none py-1">
                  New...
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate("/library/topics/new", { viewTransition: true })
                  }
                >
                  <FolderIcon className="mr-0 size-4" />
                  <span>Topic</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate("/library/entries/new", { viewTransition: true })
                  }
                >
                  <FileTextIcon className="mr-0 size-4" />
                  <span>Entry</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </PageContainer>
  );
}

export default LibraryPage;
