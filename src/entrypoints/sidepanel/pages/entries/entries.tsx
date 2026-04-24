import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { PlusIcon, SearchIcon, StarIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";

function EntriesPage() {
  return (
    <div className="lc-page-container">
      <div className="lc-page-container-inner">
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
            <Button
              size="icon"
              title="New Entry"
              draggable={false}
              className="btn-green-ring size-10 rounded-lg shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)]"
              asChild
            >
              <Link to="/entries/new" viewTransition={true}>
                <PlusIcon className="size-5" />
              </Link>
            </Button>
            {/*<Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  //title="New Entry"
                  className="size-10 rounded-lg green-button shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)] ring-1 ring-inset ring-black/25 dark:ring-white/30 hover:ring-black/30 dark:hover:ring-white/25"
                  asChild
                  draggable={false}
                >
                  <Link to="/entries/new" viewTransition={true}>
                    <PlusIcon className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>New Entry</p>
              </TooltipContent>
            </Tooltip>*/}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntriesPage;
