import { cn } from "cn";
import { useState, type ReactNode } from "react";

/**
 * Favicons this session already loaded or failed to load. The browser's own
 * image cache keeps the bytes, but a freshly mounted `<img>` still starts out
 * blank for a frame or two, so icons popped back in every time a list
 * remounted or scrolled back into view. Remembering the outcome lets a known
 * icon render at once (and a known-broken one never take up room again).
 */
const loadedFavicons = new Set<string>();
const failedFavicons = new Set<string>();

interface FaviconProps {
  url: string;
  className?: string;
  /** Shown when the icon fails to load. Without one the icon is left out. */
  fallback?: ReactNode;
}

function FaviconImage({ url, className, fallback }: FaviconProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(() =>
    loadedFavicons.has(url)
      ? "loaded"
      : failedFavicons.has(url)
        ? "failed"
        : "loading",
  );

  if (status === "failed") return <>{fallback ?? null}</>;

  return (
    <img
      ref={(img) => {
        // A cached image can finish before React attaches `onLoad`.
        if (img?.complete && img.naturalWidth > 0) {
          loadedFavicons.add(url);
          setStatus("loaded");
        }
      }}
      src={url}
      alt=""
      draggable={false}
      className={cn(
        "shrink-0 rounded-xs",
        status === "loading" && "opacity-0",
        className,
      )}
      onLoad={() => {
        loadedFavicons.add(url);
        setStatus("loaded");
      }}
      onError={() => {
        failedFavicons.add(url);
        setStatus("failed");
      }}
    />
  );
}

/** A site's favicon, loaded through the browser's cache and remembered. */
export function Favicon(props: FaviconProps) {
  // Keyed so a changed url starts over with its own remembered outcome.
  return <FaviconImage key={props.url} {...props} />;
}
