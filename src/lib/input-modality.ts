/**
 * Tracks whether the user is navigating the interface with the keyboard, so
 * focus rings appear for that and not for anything else.
 *
 * The browser's own `:focus-visible` treats any keypress as keyboard use. With
 * single-key shortcuts that goes wrong: click a tab, press `f` to filter, and
 * the tab you clicked grows a focus ring, because the browser cannot tell a
 * shortcut from navigation. Here only the keys that actually move or activate
 * focus count; pressing a pointer switches back.
 *
 * The result is `data-input-modality` on `<html>`, which the `focus-visible`
 * variant in `globals.css` requires.
 */

export const MODALITY_ATTRIBUTE = "data-input-modality";

const NAVIGATION_KEYS = new Set([
  "Tab",
  "Enter",
  " ",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

/**
 * Whether a keypress is keyboard navigation. Shift is allowed, for Shift+Tab;
 * any other modifier makes it a shortcut — ⌘← goes back, it does not move
 * focus.
 */
export function isNavigationKey(
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey">,
): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  return NAVIGATION_KEYS.has(event.key);
}

/** Starts tracking on this document. Returns a function that stops it. */
export function installInputModality(doc: Document = document): () => void {
  const root = doc.documentElement;

  const onKeyDown = (event: KeyboardEvent) => {
    if (isNavigationKey(event)) root.setAttribute(MODALITY_ATTRIBUTE, "keyboard");
  };
  const onPointerDown = () => {
    root.setAttribute(MODALITY_ATTRIBUTE, "pointer");
  };

  // Capture phase, so a handler that stops propagation cannot hide the input.
  doc.addEventListener("keydown", onKeyDown, true);
  doc.addEventListener("pointerdown", onPointerDown, true);

  return () => {
    doc.removeEventListener("keydown", onKeyDown, true);
    doc.removeEventListener("pointerdown", onPointerDown, true);
  };
}
