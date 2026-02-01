import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { PlusIcon } from "lucide-react";

function EntriesPage() {
  return (
    <div className="lc-page-container select-none">
      <header className="mb-4 mt-1">
        <h1 className="text-2xl font-semibold">Entries</h1>
      </header>
      <main>{/* Entries list would go here */}</main>
      <footer></footer>
      <div className="fixed bottom-17.75 w-full max-w-317 px-2.5 pr-[calc(var(--lc-scrollbar-offset)+2px)] mx-auto inset-x-0 z-50">
        <div className="shrink-0 flex items-center justify-end">
          <Button
            size="icon"
            title="New Entry"
            className="size-10 rounded-lg green-button shadow-[0px_0px_6px_3px_rgba(0,0,0,0.1)] ring-1 ring-inset ring-black/25 dark:ring-white/25 hover:ring-black/30 dark:hover:ring-white/20"
            asChild
          >
            <Link to="/entries/new" viewTransition={true}>
              <PlusIcon className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EntriesPage;
