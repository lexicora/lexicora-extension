import { useEffect, useState } from "react";
import { useRxCollection } from "rxdb/plugins/react";

import type { EntryDocType } from "@/db/schemas/entry";
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
export function useSiteEntries(activeTab: Browser.tabs.Tab | null): SiteSuggestions {
  const entriesCollection = useRxCollection("entries");
  const [siteEntries, setSiteEntries] = useState<EntryDocType[]>([]);

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

  return splitSiteEntries(siteEntries, locationOf(activeTab?.url));
}
