import { matchPath } from "react-router-dom";

/** Routes that more than one place needs to know. */

export const NEW_ENTRY_PATH = "/library/entries/new";

/**
 * The create and edit pages, where a form owns the screen.
 *
 * These are the pages that hide the bottom navigation: the page offers saving
 * or leaving, and going somewhere else is noise. The navigation shortcuts read
 * this too, so the keys match what is on screen — see PANEL_SHORTCUTS.
 */
const EDITING_PATHS = [
  NEW_ENTRY_PATH,
  "/library/entries/:id/edit",
  "/library/topics/new",
  "/library/topics/:id/edit",
];

const ENTRY_EDIT_PATH = "/library/entries/:id/edit";

/** Whether the panel is on a create or edit page. */
export function isEditingPath(pathname: string): boolean {
  return EDITING_PATHS.some((path) => matchPath({ path, end: true }, pathname));
}

/**
 * Whether the side panel is on an entry's edit page.
 *
 * Captures behave differently there: they go into the entry being edited
 * instead of starting a new one, so nothing navigates away from it.
 */
export function isEntryEditPath(pathname: string): boolean {
  return matchPath({ path: ENTRY_EDIT_PATH, end: true }, pathname) !== null;
}
