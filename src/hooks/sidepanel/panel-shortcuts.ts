import { PANEL_SHORTCUTS, type PanelShortcutAction } from "@/constants/shortcuts";

/**
 * Matches a keydown in the side panel to a shortcut action. Pure — the
 * listener lives in `use-panel-shortcuts` — so the rules are testable.
 *
 * Plain-key shortcuts are skipped while the user is typing, and inside dialogs
 * and menus, which use letter keys themselves (a menu's type-ahead, for one).
 * ⌘/Ctrl shortcuts work everywhere, including while typing, which is the
 * point of ⌘/Ctrl+S.
 */

export type ShortcutKeyEvent = Pick<
  KeyboardEvent,
  | "key"
  | "metaKey"
  | "ctrlKey"
  | "altKey"
  | "isComposing"
  | "defaultPrevented"
  | "target"
>;

const TYPING_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const OVERLAY_SELECTOR =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

/** Whether a key pressed at `target` belongs to whatever the user is typing into or navigating. */
export function isKeyOwnedByTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return target.closest(`${TYPING_SELECTOR}, ${OVERLAY_SELECTOR}`) !== null;
}

export function resolvePanelShortcut(
  event: ShortcutKeyEvent,
): PanelShortcutAction | null {
  // IME composition (e.g. typing Japanese) sends keydowns that are not commands.
  if (event.defaultPrevented || event.isComposing) return null;

  if (event.metaKey || event.ctrlKey) {
    if (event.altKey) return null;
    const key = event.key.toLowerCase();
    return PANEL_SHORTCUTS.find((s) => s.mod && s.key === key)?.action ?? null;
  }

  // Any other modifier combination is left to the browser and the OS.
  if (event.altKey) return null;
  if (isKeyOwnedByTarget(event.target)) return null;

  // Shift is allowed: "?" and, on many layouts, "/" need it. Letters match in
  // either case, so the shortcuts keep working with Caps Lock on.
  const key = event.key.toLowerCase();
  return PANEL_SHORTCUTS.find((s) => !s.mod && s.key === key)?.action ?? null;
}
