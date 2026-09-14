import type { EntryDocType } from "@/db/schemas/entry";

/**
 * Splits the entries captured from the current site into the one that *is* the
 * current page and the rest.
 *
 * Entries store the URL already split into `hostnameUrl`, `pathnameUrl` and
 * `searchUrl`, so one query by hostname answers both: which entries come from
 * this site, and whether this exact page is among them.
 */

/** Paths that differ only by a trailing slash are the same page. */
export function normalizePath(pathname: string | undefined): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export interface CurrentPageLocation {
  pathname: string;
  search: string;
}

/** The page a tab is on, or null when it has no usable URL. */
export function locationOf(url: string | undefined): CurrentPageLocation | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // The fragment is ignored: an anchor within a page is the same page.
    return { pathname: parsed.pathname, search: parsed.search };
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
      (entry.searchUrl ?? "") === current.search,
  );

  if (index === -1) return { capturedPage: null, fromThisSite: siteEntries };

  return {
    capturedPage: siteEntries[index] ?? null,
    fromThisSite: siteEntries.filter((_, i) => i !== index),
  };
}
