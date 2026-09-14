/**
 * How many topic and entry rows the home page shows.
 *
 * Driven by the viewport height, like the original threshold logic: the panel
 * is resizable, so the count follows its height. What changed is the budget.
 * The thresholds were tuned around the AI prompt, whose textarea takes the
 * height that is otherwise free — with `FEATURES.AI` off that space was left
 * empty, so the rows are now worked out from what the textarea is not using.
 */

/** Row height (`h-9.5`) plus the gap between rows (`gap-1.75`). */
const ROW_HEIGHT = 45;
/** Separator, "Recent entries" label and the margins around them. */
const ENTRIES_HEADER_HEIGHT = 52;
/** The "Create a topic" link, shown when the topics do not fill their share. */
const CREATE_LINK_HEIGHT = 26;
/** Below this, the entries header costs more space than the rows it introduces. */
const MIN_ENTRY_ROWS = 2;

/**
 * Everything above and below the rows: the logo header, the favourites row,
 * the fixed bottom bar (104px — the current-page card above the capture
 * buttons) and the bottom navigation (59px). Approximate, and the one number
 * to tune if the page ends up scrolling or leaving a gap.
 */
const FIXED_CHROME_HEIGHT = 252;

/** The height left for suggestion rows in a panel of this height. */
export function homeRowSpace(viewportHeight: number): number {
  return Math.max(0, viewportHeight - FIXED_CHROME_HEIGHT);
}

/** Topics shown alongside the AI prompt, which needs the rest of the height. */
export function aiTopicRows(viewportHeight: number): number {
  return viewportHeight >= 870 ? 5 : viewportHeight >= 825 ? 4 : 3;
}

export interface HomeRowAllocation {
  maxTopics: number;
  maxEntries: number;
}

export function allocateHomeRows({
  availablePx,
  topicsAvailable,
  entriesAvailable,
}: {
  availablePx: number;
  topicsAvailable: number;
  entriesAvailable: number;
}): HomeRowAllocation {
  // The link appears when there are fewer topics than would fit, which is
  // exactly when there is slack to hold it.
  const rowsBeforeLink = Math.floor(availablePx / ROW_HEIGHT);
  const usablePx =
    topicsAvailable < rowsBeforeLink ? availablePx - CREATE_LINK_HEIGHT : availablePx;

  const rows = Math.max(0, Math.floor(usablePx / ROW_HEIGHT));

  if (entriesAvailable === 0) {
    return { maxTopics: Math.min(topicsAvailable, rows), maxEntries: 0 };
  }

  const rowsWithEntries = Math.max(
    0,
    Math.floor((usablePx - ENTRIES_HEADER_HEIGHT) / ROW_HEIGHT),
  );

  // Topics lead — they are the primary way into the library — but only take
  // half the rows, so entries are never squeezed out on a short panel. Rows a
  // short topic list does not use fall through to the entries below.
  const topicShare = Math.ceil(rowsWithEntries / 2);
  const maxTopics = Math.min(topicsAvailable, topicShare);
  const maxEntries = Math.min(entriesAvailable, rowsWithEntries - maxTopics);

  // A lone row is not worth its header — unless that is all the entries there
  // are. The rows go back to the topics instead.
  if (maxEntries < Math.min(MIN_ENTRY_ROWS, entriesAvailable)) {
    return { maxTopics: Math.min(topicsAvailable, rows), maxEntries: 0 };
  }

  return { maxTopics, maxEntries };
}
