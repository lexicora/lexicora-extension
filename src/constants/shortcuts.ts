/**
 * Keyboard shortcuts — the single list the manifest, the side-panel key
 * handler and the Settings → Keyboard shortcuts page all read from.
 *
 * Kept free of browser APIs: `wxt.config.ts` imports it at build time.
 *
 * Two kinds, handled completely differently:
 *
 * - **Browser-wide** commands are declared in the manifest and work whenever
 *   the browser has focus, whatever page is open. Chrome allows at most four
 *   suggested keys per extension; users rebind them in the browser's own
 *   shortcut settings. Defaults use Control+Shift on macOS rather than Option,
 *   which types characters on many layouts (Option+L is "@" on a German Mac),
 *   and Alt+Shift elsewhere, since Chrome already claims many Ctrl+Shift keys.
 *
 * - **In-panel** shortcuts are plain key handlers in the side panel. They only
 *   ever fire while the panel has focus — the page never sees them — and never
 *   use keys the browser claims, such as back and forward.
 */

/** Command names as they appear in the manifest and `commands.onCommand`. */
export const COMMAND_ID = {
  /** Chromium. Firefox uses its built-in `_execute_sidebar_action` instead. */
  OPEN_SIDE_PANEL: "open-side-panel",
  FIREFOX_OPEN_SIDEBAR: "_execute_sidebar_action",
  /** Captures the selection when there is one, otherwise the whole page. */
  CAPTURE: "capture-page",
  BOOKMARK: "bookmark-page",
} as const;

interface BrowserCommand {
  description: string;
  suggestedKey: { default: string; mac: string };
}

export const BROWSER_COMMANDS: Record<
  "openSidePanel" | "capture" | "bookmark",
  BrowserCommand
> = {
  openSidePanel: {
    description: "Open or close the Lexicora side panel",
    suggestedKey: { default: "Alt+Shift+L", mac: "MacCtrl+Shift+L" },
  },
  capture: {
    description: "Capture the selection, or the whole page if nothing is selected",
    suggestedKey: { default: "Alt+Shift+C", mac: "MacCtrl+Shift+C" },
  },
  bookmark: {
    description: "Bookmark the page (metadata only)",
    suggestedKey: { default: "Alt+Shift+B", mac: "MacCtrl+Shift+B" },
  },
};

/** Descriptions by command name, for commands.getAll() results that lack one. */
export const COMMAND_DESCRIPTIONS: Record<string, string> = {
  [COMMAND_ID.OPEN_SIDE_PANEL]: BROWSER_COMMANDS.openSidePanel.description,
  [COMMAND_ID.FIREFOX_OPEN_SIDEBAR]: "Open or close the Lexicora sidebar",
  [COMMAND_ID.CAPTURE]: BROWSER_COMMANDS.capture.description,
  [COMMAND_ID.BOOKMARK]: BROWSER_COMMANDS.bookmark.description,
  // Built in to every extension with a toolbar button; unbound by default.
  _execute_action: "Open the Lexicora popup",
  _execute_browser_action: "Open the Lexicora popup",
};

/** The manifest `commands` object for a given browser. */
export function manifestCommands(browser: string) {
  const toManifest = ({ description, suggestedKey }: BrowserCommand) => ({
    description,
    suggested_key: suggestedKey,
  });

  return {
    ...(browser === "firefox"
      ? {
          [COMMAND_ID.FIREFOX_OPEN_SIDEBAR]: toManifest(
            BROWSER_COMMANDS.openSidePanel,
          ),
        }
      : {
          [COMMAND_ID.OPEN_SIDE_PANEL]: toManifest(BROWSER_COMMANDS.openSidePanel),
        }),
    [COMMAND_ID.CAPTURE]: toManifest(BROWSER_COMMANDS.capture),
    [COMMAND_ID.BOOKMARK]: toManifest(BROWSER_COMMANDS.bookmark),
  };
}

export type PanelShortcutAction =
  | "home"
  | "library"
  | "settings"
  | "back"
  | "forward"
  | "scrollToTop"
  | "search"
  | "newEntry"
  | "newTopic"
  | "edit"
  | "capture"
  | "bookmark"
  | "showShortcuts"
  | "save";

/**
 * One key combination. `mod` is ⌘ on macOS and Ctrl on Windows and Linux —
 * never either on either — so each platform gets its own convention.
 */
export interface KeyBinding {
  /**
   * `KeyboardEvent.key`, lower-cased: the character produced, not the physical
   * key, so "/" works wherever the layout puts it (Shift+7 on Swiss and German
   * keyboards). Named keys are lower-cased too, e.g. "arrowleft".
   */
  key: string;
  mod?: boolean;
  alt?: boolean;
  /**
   * Only meaningful for letters, where Shift is what separates "n" from "N".
   * For symbols it is ignored: whether a character needs Shift depends on the
   * layout, so requiring it would break "/" and "?" outside US keyboards.
   */
  shift?: boolean;
  /** Limit the binding to macOS ("mac") or to Windows and Linux ("other"). */
  platform?: "mac" | "other";
}

export interface PanelShortcut {
  action: PanelShortcutAction;
  /** Alternatives; any one triggers the action. All that apply are shown in Settings. */
  bindings: KeyBinding[];
  description: string;
  /** Grouping for the settings page. */
  group: "navigate" | "act";
  /** Also fires while typing in a field or the editor. Only ⌘/Ctrl+S needs this. */
  whileTyping?: boolean;
}

/**
 * Single keys for most actions, as GitHub, Gmail and YouTube do: nearly every
 * ⌘/Ctrl+letter is already the browser's (new window, new tab, bookmarks,
 * address bar), and some of those cannot be taken by a page at all. The few
 * ⌘/Ctrl combinations here are ones sites commonly claim safely.
 *
 * Back and forward take only the arrow pair — ⌘← / ⌘→ on macOS, Alt+← / Alt+→
 * elsewhere — which is identical on every keyboard layout. The other pair
 * macOS labels for back and forward (⌘[ / ⌘] on US keyboards, ⌘Ö / ⌘Ä on Swiss
 * and German ones) is deliberately left unbound, so that while the panel has
 * focus those keys still reach the browser and move the web page's history.
 * One pair drives the panel, the other the page.
 *
 * The panel needs its own pair at all because its router keeps history in
 * memory, where the browser cannot see it — the same reason the mouse back and
 * forward buttons are handled in `use-mouse-navigation`.
 */
export const PANEL_SHORTCUTS: PanelShortcut[] = [
  {
    action: "home",
    bindings: [{ key: "h" }],
    description: "Go to Home",
    group: "navigate",
  },
  {
    action: "library",
    bindings: [{ key: "l" }],
    description: "Go to Library",
    group: "navigate",
  },
  {
    action: "settings",
    bindings: [{ key: "s" }],
    description: "Go to Settings",
    group: "navigate",
  },
  {
    action: "back",
    bindings: [
      { key: "arrowleft", mod: true, platform: "mac" },
      { key: "arrowleft", alt: true, platform: "other" },
    ],
    description: "Go back",
    group: "navigate",
  },
  {
    action: "forward",
    bindings: [
      { key: "arrowright", mod: true, platform: "mac" },
      { key: "arrowright", alt: true, platform: "other" },
    ],
    description: "Go forward",
    group: "navigate",
  },
  {
    action: "scrollToTop",
    // Home is left unbound: the browser already jumps to the top with it, and
    // instantly, where this scrolls smoothly like clicking the page title.
    bindings: [{ key: "t" }],
    description: "Scroll to the top",
    group: "navigate",
  },
  {
    action: "search",
    // ⌘/Ctrl+K as well, for layouts where "/" needs Shift.
    bindings: [{ key: "/" }, { key: "k", mod: true }],
    description: "Search the library",
    group: "act",
  },
  {
    action: "newEntry",
    bindings: [{ key: "n" }],
    description: "New entry",
    group: "act",
  },
  {
    action: "newTopic",
    bindings: [{ key: "n", shift: true }],
    description: "New topic",
    group: "act",
  },
  {
    action: "edit",
    bindings: [{ key: "e" }, { key: "e", mod: true }],
    description: "Edit the open entry or topic",
    group: "act",
  },
  {
    action: "capture",
    bindings: [{ key: "c" }],
    description: "Capture the selection, or the page if nothing is selected",
    group: "act",
  },
  {
    action: "bookmark",
    bindings: [{ key: "b" }],
    description: "Bookmark the current page",
    group: "act",
  },
  {
    action: "save",
    bindings: [{ key: "s", mod: true }],
    description: "Save, on entry and topic create and edit pages",
    group: "act",
    whileTyping: true,
  },
  {
    action: "showShortcuts",
    bindings: [{ key: "?" }],
    description: "Show keyboard shortcuts",
    group: "act",
  },
];

/** Whether a binding applies on the current platform. */
export function bindingApplies(binding: KeyBinding, isMac: boolean): boolean {
  if (binding.platform === "mac") return isMac;
  if (binding.platform === "other") return !isMac;
  return true;
}

const KEY_LABELS: Record<string, string> = {
  arrowleft: "←",
  arrowright: "→",
};

/** A binding as shown to the user: "⌘K" on macOS, "Ctrl+K" elsewhere. */
export function formatBinding(binding: KeyBinding, isMac: boolean): string {
  const key =
    KEY_LABELS[binding.key] ??
    (binding.key.length === 1 ? binding.key.toUpperCase() : binding.key);
  const mods = [
    binding.mod && (isMac ? "⌘" : "Ctrl"),
    binding.alt && (isMac ? "⌥" : "Alt"),
    binding.shift && (isMac ? "⇧" : "Shift"),
  ].filter(Boolean);
  if (mods.length === 0) return key;
  return isMac ? `${mods.join("")}${key}` : `${mods.join("+")}+${key}`;
}
