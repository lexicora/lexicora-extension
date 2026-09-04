import { BookmarkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * First-run state for the side-panel home page, shown while both collections
 * are empty. Points at capturing rather than at creating a topic, because
 * capture is the shorter path to a useful library.
 */
export function LibraryEmptyState() {
  const navigate = useNavigate();

  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-6">
      <div className="flex items-center justify-center size-11 rounded-full bg-card not-dark:shadow-xs mb-3">
        <BookmarkIcon className="size-5 text-muted-foreground" />
      </div>
      <h2 className="text-base font-medium mb-1">Nothing saved yet</h2>
      <p className="text-sm text-pretty text-muted-foreground max-w-64">
        Capture the page you are on, and it will show up here ready to search.
      </p>
      <Button
        variant="link"
        size="sm"
        onClick={() => navigate("/library/topics/new", { viewTransition: true })}
        className="mt-2"
      >
        Or create a topic first
      </Button>
    </section>
  );
}
