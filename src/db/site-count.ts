import type { RxCollection } from "rxdb";
import { combineLatest, map, of, type Observable } from "rxjs";

/**
 * How many live entries were captured from a site.
 *
 * One count per spelling of the host rather than one `$in` count: on Dexie,
 * RxDB only allows a count it can answer from an index alone, and `$in` is not
 * that — it throws `QU14`. Each equality count is served by the
 * `['hostnameUrl', 'isArchived']` index, and the results are summed.
 */
function siteCountQueries(entries: RxCollection, hostnames: string[]) {
  return hostnames.map((hostnameUrl) =>
    entries.count({ selector: { hostnameUrl, isArchived: false } }),
  );
}

/** The total, kept current as entries are added, archived or deleted. */
export function siteCount$(
  entries: RxCollection,
  hostnames: string[],
): Observable<number> {
  if (hostnames.length === 0) return of(0);
  return combineLatest(
    siteCountQueries(entries, hostnames).map((query) => query.$),
  ).pipe(map((counts) => counts.reduce((sum, n) => sum + n, 0)));
}

/** The total, once. */
export async function countSiteEntries(
  entries: RxCollection,
  hostnames: string[],
): Promise<number> {
  const counts = await Promise.all(
    siteCountQueries(entries, hostnames).map((query) => query.exec()),
  );
  return counts.reduce((sum, n) => sum + n, 0);
}
