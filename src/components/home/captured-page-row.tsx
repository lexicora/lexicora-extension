import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { EntryDocType } from "@/db/schemas/entry";

interface CapturedPageRowProps {
  entry: EntryDocType;
}

/**
 * Says that the page in the active tab is already in the library, and opens
 * that entry.
 *
 * Sits at the top of "From this site", which is where it belongs — it is one
 * of that site's entries — but set apart from the list below it, because it is
 * a statement about the current page rather than a suggestion. It is also the
 * answer to capturing the same page twice by accident.
 */
export function CapturedPageRow({ entry }: CapturedPageRowProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="secondary"
      title={`Already captured: ${entry.title}`}
      className="group w-full flex items-center h-9.5 gap-2 px-3 bg-card hover:bg-card-hover not-dark:shadow-xs rounded-xl text-left transition-colors"
      onClick={() =>
        navigate(`/library/entries/${entry.id}`, { viewTransition: true })
      }
    >
      <CheckIcon className="size-3.5 shrink-0 text-green-600 dark:text-green-500" />
      <span className="text-xs text-muted-foreground shrink-0">
        Already captured
      </span>
      <span className="text-sm truncate flex-1 text-right">{entry.title}</span>
      <ChevronRightIcon className="transition-opacity size-3.5 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100" />
    </Button>
  );
}
