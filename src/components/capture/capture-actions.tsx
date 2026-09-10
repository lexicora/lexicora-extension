import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UNSUPPORTED_PAGE_TITLE =
  "You are currently on a unsupported page for capturing.";

interface CaptureActionsProps {
  isSupported: boolean;
  onCapturePage: () => void;
  onBookmarkPage: () => void;
  className?: string;
}

/**
 * The capture button pair used while AI is off: a secondary "Bookmark" beside
 * the primary "Capture page", laid out like the AI design's "Capture" /
 * "Capture with AI" pair so the two states read as the same control.
 *
 * Bookmark saves the page's metadata only — title, link, favicon, site name and
 * description — and never reads its content.
 *
 * Shared by the side-panel home footer and the compact popup, so the pair is
 * defined once. The AI layouts keep their own original footers and do not
 * include Bookmark yet; see `constants/features.ts`.
 */
export function CaptureActions({
  isSupported,
  onCapturePage,
  onBookmarkPage,
  className,
}: CaptureActionsProps) {
  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <Button
        variant="secondary"
        title={
          isSupported
            ? "Bookmark page — saves the title, link and description, without the content"
            : UNSUPPORTED_PAGE_TITLE
        }
        className={cn(
          "flex-1 min-w-0 hover:bg-[color-mix(in_oklab,var(--secondary),black_7%)] dark:hover:bg-[color-mix(in_oklab,var(--secondary)80%,var(--background))] overflow-hidden",
          "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-secondary!",
        )}
        disabled={!isSupported}
        onClick={onBookmarkPage}
      >
        Bookmark
      </Button>
      <Button
        title={isSupported ? "Capture page" : UNSUPPORTED_PAGE_TITLE}
        className="flex-1 min-w-0 hover:bg-[color-mix(in_oklab,var(--primary)80%,var(--background))] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
        disabled={!isSupported}
        onClick={onCapturePage}
      >
        Capture page
      </Button>
    </div>
  );
}
