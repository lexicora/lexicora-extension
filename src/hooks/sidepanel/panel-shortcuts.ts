import {
  bindingApplies,
  PANEL_SHORTCUTS,
  type KeyBinding,
  type PanelShortcutAction,
} from "@/constants/shortcuts";

/**
 * Matches a keydown in the side panel to a shortcut action. Pure — the
 * listener lives in `use-panel-shortcuts` — so the rules are testable.
 *
 * Shortcuts are skipped while the user is typing, and inside dialogs and
 * menus, which use keys themselves (a menu's type-ahead, for one) — except
 * those marked `whileTyping`, which is the point of ⌘/Ctrl+S.
 */

export const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

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

function matchesBinding(
  event: ShortcutKeyEvent,
  binding: KeyBinding,
  isMac: boolean,
): boolean {
  if (!bindingApplies(binding, isMac)) return false;

  // The platform's modifier must match exactly, and the other one must be up:
  // Ctrl+K on a Mac is not ⌘K, and ⌘ on Windows is the Windows key.
  const mod = isMac ? event.metaKey : event.ctrlKey;
  const otherMod = isMac ? event.ctrlKey : event.metaKey;
  if (otherMod || mod !== Boolean(binding.mod)) return false;
  if (event.altKey !== Boolean(binding.alt)) return false;

  // Shift is not checked: "?" and, on many layouts, "/" need it. Lower-casing
  // also keeps letters working with Caps Lock on.
  return event.key.toLowerCase() === binding.key;
}

export function resolvePanelShortcut(
  event: ShortcutKeyEvent,
  isMac: boolean = IS_MAC,
): PanelShortcutAction | null {
  // IME composition (e.g. typing Japanese) sends keydowns that are not commands.
  if (event.defaultPrevented || event.isComposing) return null;

  const typing = isKeyOwnedByTarget(event.target);
  const shortcut = PANEL_SHORTCUTS.find(
    (s) =>
      (!typing || s.whileTyping) &&
      s.bindings.some((b) => matchesBinding(event, b, isMac)),
  );
  return shortcut?.action ?? null;
}
