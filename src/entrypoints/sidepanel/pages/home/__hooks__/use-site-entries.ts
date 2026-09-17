import { useEffect, useState } from "react";
import { useRxCollection } from "rxdb/plugins/react";

import type { BlockDocType } from "@/db/schemas/block";
import type { EntryDocType } from "@/db/schemas/entry";
import {
  convertDbBlocksToBlockNote,
  hasEditorContent,
} from "@/lib/utils/block-converter";
import {
  locationOf,
  splitSiteEntries,
  type SiteSuggestions,
} from "../site-suggestions";

const QUERY_LIMIT = 12;

/** Both spellings of a host, so a capture from "www.x.com" matches a visit to "x.com". */
function hostVariants(url: string | undefined): string[] {
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    const bare = hostname.replace(/^www\./, "");
    return bare === hostname ? [hostname, `www.${hostname}`] : [bare, hostname];
  } catch {
    return [];
  }
}

/**
 * Entries captured from the site in the active tab, split into the one for
 * this exact page and the rest.
 *
 * One query by hostname answers both questions, and re-runs when the tab
 * changes. `hostnameUrl` is not indexed yet, so this scans the collection —
 * see the storage and query pass in the roadmap.
 */
export interface SiteEntries extends SiteSuggestions {
  /** The host of the active tab, for a link to everything captured from it. */
  hostname: string | null;
  /**
   * Whether the already-captured entry holds content. A bookmark holds none,
   * and saying "captured" for one overstates what is stored.
   */
  capturedPageHasContent: boolean;
  /**
   * Every entry from this site, the captured page included and archived ones
   * excluded — the number the library shows for the same `site:` search.
   */
  siteTotal: number;
}

export function useSiteEntries(activeTab: Browser.tabs.Tab | null): SiteEntries {
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");
  const [siteEntries, setSiteEntries] = useState<EntryDocType[]>([]);
  const [capturedPageHasContent, setCapturedPageHasContent] = useState(false);
  const [siteTotal, setSiteTotal] = useState(0);

  const hosts = hostVariants(activeTab?.url);
  const hostKey = hosts.join("|");

  useEffect(() => {
    if (!entriesCollection || hosts.length === 0) {
      setSiteEntries([]);
      return;
    }
    const sub = entriesCollection
      .find({
        selector: { hostnameUrl: { $in: hostKey.split("|") }, isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: QUERY_LIMIT,
      })
      .$.subscribe({
        next: (docs) =>
          setSiteEntries(docs.map((d) => d.toJSON() as EntryDocType)),
        error: () => setSiteEntries([]),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection, hostKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Counted separately: the list above is capped, the total is not. An
  // indexed count, so it stays cheap however much comes from the site.
  useEffect(() => {
    if (!entriesCollection || hostKey === "") {
      setSiteTotal(0);
      return;
    }
    const sub = entriesCollection
      .count({
        selector: { hostnameUrl: { $in: hostKey.split("|") }, isArchived: false },
      })
      .$.subscribe({
        next: setSiteTotal,
        error: () => setSiteTotal(0),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection, hostKey]);

  const suggestions = splitSiteEntries(siteEntries, locationOf(activeTab?.url));
  const capturedId = suggestions.capturedPage?.id ?? null;

  // Two blocks are enough to tell content from an editor's empty paragraph.
  useEffect(() => {
    if (!blocksCollection || !capturedId) {
      setCapturedPageHasContent(false);
      return;
    }
    let active = true;
    blocksCollection
      .find({ selector: { entryId: capturedId }, limit: 2 })
      .exec()
      .then((docs) => {
        if (!active) return;
        const blocks = convertDbBlocksToBlockNote(
          docs.map((doc) => doc.toJSON() as BlockDocType),
        );
        setCapturedPageHasContent(hasEditorContent(blocks));
      })
      .catch(() => setCapturedPageHasContent(false));
    return () => {
      active = false;
    };
  }, [blocksCollection, capturedId]);

  return {
    ...suggestions,
    hostname: hosts[0] ?? null,
    capturedPageHasContent,
    siteTotal,
  };
}
