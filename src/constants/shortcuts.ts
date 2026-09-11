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
    description: "Open the Lexicora side panel",
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
  | "search"
  | "newEntry"
  | "capture"
  | "bookmark"
  | "showShortcuts"
  | "save";

export interface PanelShortcut {
  action: PanelShortcutAction;
  /**
   * The character the key produces (`KeyboardEvent.key`), not the physical key,
   * so "/" works wherever the layout puts it — Shift+7 on German keyboards.
   */
  key: string;
  /** Needs ⌘ on macOS or Ctrl elsewhere, and works while typing. */
  mod?: boolean;
  description: string;
}

export const PANEL_SHORTCUTS: PanelShortcut[] = [
  { action: "search", key: "/", description: "Search the library" },
  { action: "newEntry", key: "n", description: "New entry" },
  {
    action: "capture",
    key: "c",
    description: "Capture the selection, or the page if nothing is selected",
  },
  { action: "bookmark", key: "b", description: "Bookmark the current page" },
  { action: "showShortcuts", key: "?", description: "Show keyboard shortcuts" },
  {
    action: "save",
    key: "s",
    mod: true,
    description: "Save, on entry and topic create and edit pages",
  },
];
