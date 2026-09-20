/**
 * How many suggestions the home page shows.
 *
 * Fixed counts, not a fit calculation: the page scrolls like every other one,
 * so nothing has to be trimmed to the panel's height. Sizing the list to the
 * viewport made the layout shift as the panel resized, which read as clunky
 * for no real gain.
 *
 * The AI layout is the exception. Its prompt textarea grows with the viewport
 * and takes whatever height is left, so there the topic count still steps with
 * the window — the original behavior, untouched.
 */

/** Topics listed under the favorites row. */
export const HOME_TOPIC_LIMIT = 6;
/** Entry rows, shared between "From this site" and "Recent entries". */
export const HOME_ENTRY_LIMIT = 6;

/** Topics shown alongside the AI prompt, which needs the rest of the height. */
export function aiTopicRows(viewportHeight: number): number {
  return viewportHeight >= 870 ? 5 : viewportHeight >= 825 ? 4 : 3;
}

/**
 * Divides the entry rows between the two groups. Entries from the current site
 * take at most half, so they never crowd out the recent ones — unless there
 * are no recent ones left to show, when the whole budget is theirs rather than
 * leaving the space empty.
 */
export function splitEntryRows({
  maxEntries,
  siteAvailable,
  recentAvailable,
}: {
  maxEntries: number;
  siteAvailable: number;
  recentAvailable: number;
}): { siteRows: number; recentRows: number } {
  const cap = recentAvailable > 0 ? Math.floor(maxEntries / 2) : maxEntries;
  const siteRows = Math.min(siteAvailable, cap);
  return {
    siteRows,
    recentRows: Math.min(recentAvailable, maxEntries - siteRows),
  };
}
