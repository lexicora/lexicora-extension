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
import { Link, useNavigate } from "react-router-dom";

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

function EntriesPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      {/*<header className="mb-4 mt-1">
          <h1 className="text-2xl font-semibold">Entries</h1>
        </header>*/}
      <Tabs defaultValue="entries">
        <PageHeader title="Entries">
          <div className="mt-3 mx-2">
            <div id="search" className="dark:scheme-dark">
              <Field orientation="horizontal">
                <Input
                  id="search-input"
                  type="search"
                  placeholder="Search..."
                  className="h-8 px-2"
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
                title="Favorites"
                variant="outline"
                className="shrink-0 transition-colors min-w-7.5 size-7.5"
              >
                <StarIcon className="group-data-[state=on]/toggle:fill-foreground" />
              </Toggle>
              {/*Group Tabs of pure entries and topics (grouping of entries) and sites (grouping of entries based on their sites url grouped and matched) */}
              <div className="flex-1 mr-7.5">
                <TabsList className="h-8!">
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
            {/* Entries list would go here */}
            <p>Entries</p>
          </main>
        </TabsContent>
        <TabsContent value="topics">
          <main>
            {/* Topics list would go here */}
            <p>Topics</p>
          </main>
        </TabsContent>
        <TabsContent value="sites">
          <main>
            {/* Sites list would go here */}
            <p>Sites</p>
          </main>
        </TabsContent>
        <footer></footer>
      </Tabs>
      <div className="fixed bottom-17.75 left-0 w-full px-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-20">
        <div className="shrink-0 flex items-center justify-end max-w-315 mx-auto inset-x-0">
          {/*MAYBE: Make smaller and also maybe a bit darker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                title="Create..."
                draggable={false}
                className="btn-green-ring size-10 rounded-lg shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)]"
              >
                <PlusIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="min-w-21">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="select-none py-1">
                  New...
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate("/topics/new", { viewTransition: true })
                  }
                >
                  <FolderIcon className="mr-0 size-4" />
                  <span>Topic</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate("/entries/new", { viewTransition: true })
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

export default EntriesPage;
