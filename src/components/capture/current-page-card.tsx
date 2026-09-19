import { GlobeIcon } from "lucide-react";
import { cn } from "cn";

interface CurrentPageCardProps {
  /** The tab that a capture would act on. */
  activeTab: Browser.tabs.Tab | null;
  /** False for browser and extension pages, which cannot be captured. */
  isSupported: boolean;
  /**
   * One line instead of two. Built for the side-panel home page, which showed
   * it permanently above the capture buttons; that was taken out again because
   * it did not sit well there. Unused for now — the popup uses the two-line
   * default — and kept for whenever the panel wants it back.
   */
  compact?: boolean;
  className?: string;
}

function hostnameOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Shows the page a capture action would save — favicon, title and hostname — so
 * the action is never a guess, and doubles as the unsupported-page message.
 *
 * Host-agnostic: takes the tab rather than calling `useTabSupport()` itself, so
 * the popup and side-panel can share one instance of the lookup.
 */
export function CurrentPageCard({
  activeTab,
  isSupported,
  compact = false,
  className,
}: CurrentPageCardProps) {
  const title = activeTab?.title?.trim();
  const hostname = hostnameOf(activeTab?.url);

  return (
    <section
      className={cn(
        "flex items-center gap-2.5 rounded-xl bg-card not-dark:shadow-xs text-left",
        compact ? "px-3 py-2 border" : "px-3 py-2.5",
        !isSupported && "opacity-70",
        className,
      )}
    >
      {isSupported && activeTab?.favIconUrl ? (
        <img
          src={activeTab.favIconUrl}
          alt=""
          aria-hidden
          draggable="false"
          className="size-4 shrink-0 rounded-xs"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      {compact ? (
        // The hostname trails the title rather than sitting under it, and is
        // the first thing to be cut when the title is long.
        <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
          <span className="text-sm truncate">
            {isSupported
              ? (title ?? "Untitled page")
              : "Can't capture this page"}
          </span>
          <span className="text-xs text-muted-foreground truncate shrink-0">
            {isSupported ? (hostname ?? "") : "not supported"}
          </span>
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="text-sm truncate">
            {isSupported
              ? (title ?? "Untitled page")
              : "Can't capture this page"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isSupported
              ? (hostname ?? "Unknown site")
              : "Browser & extension pages are not supported"}
          </p>
        </div>
      )}
    </section>
  );
}
