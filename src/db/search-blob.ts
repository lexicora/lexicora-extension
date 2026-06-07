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

/** Builds a searchBlob for an entry document. */
export function buildEntrySearchBlob(doc: {
  title?: string;
  description?: string;
  tags?: string[];
  siteName?: string;
  hostnameUrl?: string;
  //? Potentially add path of the URL.
  //? Potentially add the dates to the search blob.
}): string {
  const parts = [
    (doc.title || '').toLowerCase().trim(),
    flattenTags(doc.tags),
    truncate((doc.description || '').toLowerCase().trim(), DESCRIPTION_MAX_LENGTH),
    (doc.siteName || '').toLowerCase().trim(),
    (doc.hostnameUrl || '').toLowerCase().trim(),
  ];

  return parts.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
}

/** Builds a searchBlob for a topic document. */
export function buildTopicSearchBlob(doc: {
  name?: string;
  description?: string;
  tags?: string[];
  //? Potentially add the dates to the search blob.
}): string {
  const parts = [
    (doc.name || '').toLowerCase().trim(),
    flattenTags(doc.tags),
    truncate((doc.description || '').toLowerCase().trim(), DESCRIPTION_MAX_LENGTH),
  ];

  return parts.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
}
