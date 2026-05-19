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
} from "lucide-react";
import { useState } from "react";
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

function LibraryPage() {
  const [search, setSearch] = useState(""); //* Not working currently.
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "entries";

  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // If it's already the same tab, don't do anything
    if (value === activeTab) return;
    setSearchParams({ tab: value }, { replace: true });
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
                <Input
                  id="search-input"
                  type="search"
                  placeholder="Search..."
                  className="h-8 px-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button size="icon" /*title="Search"*/ className="size-8">
                  <SearchIcon />
                </Button>
              </Field>
            </div>
            <div
              id="tab-switcher-favorites-toggle"
              className="mx-2 my-4 flex items-center justify-center"
            >
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
                <TabsList className="h-8! pt-[0.16rem]">
                  <TabsTrigger value="entries">Entries</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="sites">Sites</TabsTrigger>
                </TabsList>
              </div>
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
            <TopicList search={search} onlyFavorites={showFavorites} />
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
