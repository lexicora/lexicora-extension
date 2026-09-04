import { ChevronRightIcon, GlobeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { EntryDocType } from "@/db/schemas/entry";

interface RecentEntriesProps {
  entries: EntryDocType[];
}

/**
 * Recently updated entries on the side-panel home page.
 *
 * Fills the space the AI prompt occupies when `FEATURES.AI` is on — the two are
 * alternatives, never shown together. See the composition note in `home.tsx`.
 */
export function RecentEntries({ entries }: RecentEntriesProps) {
  const navigate = useNavigate();

  if (entries.length === 0) return null;

  return (
    <section className="mt-4 shrink-0">
      <Separator className="mx-auto max-w-[calc(100%-8px)] shrink-0" />
      <h2 className="text-xs font-medium text-muted-foreground text-left ml-2.5 mt-3 mb-1.75 select-none">
        Recent entries
      </h2>
      <div className="flex flex-col gap-1.75">
        {entries.map((entry) => (
          <Button
            key={entry.id}
            variant="secondary"
            className="group w-full flex items-center h-9.5 gap-2 px-3 bg-card hover:bg-card-hover not-dark:shadow-xs rounded-xl text-left transition-colors"
            onClick={() =>
              navigate(`/library/entries/${entry.id}`, {
                viewTransition: true,
              })
            }
          >
            {entry.faviconUrl ? (
              <img
                src={entry.faviconUrl}
                alt=""
                aria-hidden
                draggable="false"
                className="size-3.5 shrink-0 rounded-xs"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : (
              <GlobeIcon className="size-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm truncate flex-1">{entry.title}</span>
            <ChevronRightIcon className="transition-opacity size-3.5 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100" />
          </Button>
        ))}
      </div>
    </section>
  );
}
