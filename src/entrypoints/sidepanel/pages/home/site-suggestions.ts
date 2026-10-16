import type { EntryDocType } from "@/db/schemas/entry";

/**
 * Splits the entries captured from the current site into the one that *is* the
 * current page and the rest.
 *
 * Entries store the URL already split into `hostnameUrl`, `pathnameUrl` and
 * `searchUrl`, so one query by hostname answers both: which entries come from
 * this site, and whether this exact page is among them. The fragment is not
 * split out, so it is read from the entry's full `url`.
 */

/** Paths that differ only by a trailing slash are the same page. */
export function normalizePath(pathname: string | undefined): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export interface CurrentPageLocation {
  pathname: string;
  search: string;
  /** The fragment, with its "#", or "". */
  hash: string;
}

/**
 * The fragment of a URL, with its "#", or "" when it has none.
 *
 * Sliced from the string rather than parsed: it only runs for entries whose
 * path and query already match, and a fragment can be large (an app keeping
 * base64 data in it), which a full `new URL()` would parse for nothing.
 */
function hashOf(url: string | undefined): string {
  const start = url?.indexOf("#") ?? -1;
  if (!url || start === -1 || start === url.length - 1) return "";
  return url.slice(start);
}

/** The page a tab is on, or null when it has no usable URL. */
export function locationOf(url: string | undefined): CurrentPageLocation | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // The fragment counts: it can select different content (single-page apps,
    // hash-routed sites), so a page at another anchor is another capture.
    // Read the same way as an entry's, so the two compare like for like.
    return {
      pathname: parsed.pathname,
      search: parsed.search,
      hash: hashOf(parsed.href),
    };
  } catch {
    return null;
  }
}

export interface SiteSuggestions {
  /** The entry for this exact page, if one was already captured. */
  capturedPage: EntryDocType | null;
  /** Everything else from this site, newest first, minus the captured page. */
  fromThisSite: EntryDocType[];
}

export function splitSiteEntries(
  siteEntries: EntryDocType[],
  current: CurrentPageLocation | null,
): SiteSuggestions {
  if (!current) return { capturedPage: null, fromThisSite: siteEntries };

  const path = normalizePath(current.pathname);
  const index = siteEntries.findIndex(
    (entry) =>
      normalizePath(entry.pathnameUrl) === path &&
      (entry.searchUrl ?? "") === current.search &&
      hashOf(entry.url) === current.hash,
  );

  if (index === -1) return { capturedPage: null, fromThisSite: siteEntries };

  return {
    capturedPage: siteEntries[index] ?? null,
    fromThisSite: siteEntries.filter((_, i) => i !== index),
  };
}
