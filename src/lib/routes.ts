/** Route shapes that more than one place needs to recognise. */

const ENTRY_EDIT_PATTERN = /^\/library\/entries\/[^/]+\/edit$/;

/**
 * Whether the side panel is on an entry's edit page.
 *
 * Captures behave differently there: they go into the entry being edited
 * instead of starting a new one, so nothing navigates away from it.
 */
export function isEntryEditPath(pathname: string): boolean {
  return ENTRY_EDIT_PATTERN.test(pathname);
}
