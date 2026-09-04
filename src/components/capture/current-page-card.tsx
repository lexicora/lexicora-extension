import { GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentPageCardProps {
  /** The tab that a capture would act on. */
  activeTab: Browser.tabs.Tab | null;
  /** False for browser and extension pages, which cannot be captured. */
  isSupported: boolean;
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
  className,
}: CurrentPageCardProps) {
  const title = activeTab?.title?.trim();
  const hostname = hostnameOf(activeTab?.url);

  return (
    <section
      className={cn(
        "flex items-center gap-2.5 rounded-xl bg-card not-dark:shadow-xs px-3 py-2.5 text-left",
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
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">
          {isSupported ? (title ?? "Untitled page") : "Can't capture this page"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {isSupported
            ? (hostname ?? "Unknown site")
            : "Browser and extension pages are not supported"}
        </p>
      </div>
    </section>
  );
}
