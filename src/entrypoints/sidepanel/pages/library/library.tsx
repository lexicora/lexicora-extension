import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useState, useDeferredValue, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TopicList } from "@/components/topic-list";

import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// TODO: Potentially make searching faster, when entering a search query, because on every character, a navigation takes place.
// TODO: Also ensure, that when on a tab, the other tabs should not be rendered and in a way put to sleep, so they don't do unnecessary processing.

function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const deferredSearch = useDeferredValue(search);
  const [showFavorites, setShowFavorites] = useState(
    searchParams.get("favorites") === "true",
  );

  const activeTab = searchParams.get("tab") || "entries";

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
        return newParams;
      },
      { replace: true },
    );
  }, [deferredSearch, showFavorites, setSearchParams]);

  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // If it's already the same tab, don't do anything
    if (value === activeTab) return;
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", value);
        return newParams;
      },
      { replace: true },
    );
  };

  return (
    <PageContainer>
      {/*<header className="mb-4 mt-1">
          <h1 className="text-2xl font-semibold">Entries</h1>
        </header>*/}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <PageHeader title="Library" classNameHeaderElement="mb-2">
          <div className="mt-3 mx-2">
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
              className="mx-2 my-4 flex items-center justify-center"
            >
              {/* Maybe put toggle inline with search input or potentially move to the right side of the tab-list */}
              <Toggle
                title={showFavorites ? "Show all" : "Show only Favorites"}
                variant="outline"
                className="shrink-0 transition-colors min-w-7.5 size-7.5"
                pressed={showFavorites}
                onPressedChange={setShowFavorites}
              >
                <StarIcon className="group-data-[state=on]/toggle:text-yellow-500 group-data-[state=on]/toggle:fill-yellow-500" />
              </Toggle>
              {/*Group Tabs of pure entries and topics (grouping of entries) and sites (grouping of entries based on their sites url grouped and matched) */}
              <div className="flex-1 mr-7.5">
                <TabsList className="h-8! py-[0.16rem]">
                  <TabsTrigger value="entries">Entries</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="sites">Sites</TabsTrigger>
                </TabsList>
              </div>
              {/* TODO: Implement a filter menu here, to filter by different stuff and also implement toggle to sort by updated or created, 
              also potentially save the current filter to browser local storage */}
            </div>
            <Separator className="" />
          </div>
        </PageHeader>
        <TabsContent value="entries">
          <main>
            {/* Entries list would go here (potentially make a component for this tab)*/}
            <p>Entries</p>
          </main>
        </TabsContent>
        <TabsContent value="topics">
          <main className="mb-2.5">
            <TopicList search={deferredSearch} onlyFavorites={showFavorites} />
          </main>
        </TabsContent>
        <TabsContent value="sites">
          <main>
            {/* Sites list would go here (potentially make a component for this tab)*/}
            <p>Sites</p>
          </main>
        </TabsContent>
        <footer></footer>
      </Tabs>
      <div className="fixed bottom-17.75 left-0 w-full px-3 pr-[calc(var(--lc-scrollbar-offset)+7px)] z-20 pointer-events-none">
        <div className="shrink-0 flex items-center justify-end max-w-315 mx-auto inset-x-0">
          {/*MAYBE: Make smaller and also maybe a bit darker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                //variant="secondary"
                title="Create..."
                draggable={false}
                //className="btn-green-ring size-9.5 rounded-lg shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)]"
                className={cn(
                  "pointer-events-auto",
                  //"bg-secondary/80 hover:bg-secondary",
                  "text-lc-light-foreground bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800",
                  "ring-1 ring-inset ring-black/20 dark:ring-white/30 hover:ring-black/25 dark:hover:ring-white/25",
                  "size-9 rounded-[12px] shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)]",
                )}
              >
                <PlusIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="min-w-21 /*bg-popover/80 backdrop-blur-md*/"
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
