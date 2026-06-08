/**
 * Shared utilities for building the `searchBlob` denormalized search field.
 *
 * The searchBlob concatenates key text fields into a single lowercase string,
 * allowing global search to query a single property instead of multiple fields.
 */
const DESCRIPTION_MAX_LENGTH = 150;

/** Truncates a string to the given max length. */
function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/** Flattens a tags array into a lowercase, space-separated string. */
function flattenTags(tags?: string[]): string {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return tags.map((t) => t.toLowerCase().trim()).join(' ');
}

/**
 * Formats an ISO date string into three searchable tokens: DD.MM.YY (matches
 * app display), full month name, and 4-digit year. `updatedAt` is indexed
 * because that's the date the UI displays and sorts by.
 *
 * Example: "2026-05-20T..." → "20.05.26 may 2026"
 */
function formatDateForSearch(isoDate?: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year2 = String(d.getFullYear()).slice(-2);
  const year4 = String(d.getFullYear());
  const monthName = d.toLocaleString('en', { month: 'long' }).toLowerCase();
  return `${day}.${month}.${year2} ${monthName} ${year4}`;
}

/** Builds a searchBlob for an entry document. */
export function buildEntrySearchBlob(doc: {
  title?: string;
  description?: string;
  tags?: string[];
  siteName?: string;
  hostnameUrl?: string;
  //? Potentially add path of the URL.
  updatedAt?: string;
}): string {
  const parts = [
    (doc.title || '').toLowerCase().trim(),
    flattenTags(doc.tags),
    truncate((doc.description || '').toLowerCase().trim(), DESCRIPTION_MAX_LENGTH),
    (doc.siteName || '').toLowerCase().trim(),
    (doc.hostnameUrl || '').toLowerCase().trim(),
    formatDateForSearch(doc.updatedAt),
  ];

  return parts.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
}

/** Builds a searchBlob for a topic document. */
export function buildTopicSearchBlob(doc: {
  name?: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
}): string {
  const parts = [
    (doc.name || '').toLowerCase().trim(),
    flattenTags(doc.tags),
    truncate((doc.description || '').toLowerCase().trim(), DESCRIPTION_MAX_LENGTH),
    formatDateForSearch(doc.updatedAt),
  ];

  return parts.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
}
