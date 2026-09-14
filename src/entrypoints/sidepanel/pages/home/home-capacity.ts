/**
 * How many topic and entry rows the home page's flexible middle can hold.
 *
 * With the AI prompt gated off, that area is empty space rather than a
 * textarea, so the page fills it with suggestions instead of leaving a gap.
 * The counts come from the measured height of the area, not from the window
 * height: the side panel is resizable, and what fits depends on the layout
 * around it, which changes with the feature flags.
 */

/** Row height (`h-9.5`) plus the gap between rows (`gap-1.75`). */
const ROW_HEIGHT = 45;
/** Separator, "Recent entries" label and the margins around them. */
const ENTRIES_HEADER_HEIGHT = 52;
/** The "Create a topic" link, shown when the topics do not fill their share. */
const CREATE_LINK_HEIGHT = 26;
/** Below this, the entries header costs more space than the rows it introduces. */
const MIN_ENTRY_ROWS = 2;

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
