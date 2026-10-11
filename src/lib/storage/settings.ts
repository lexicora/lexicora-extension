import { storage } from "wxt/utils/storage";

//export type AppTheme = "system" | "light" | "dark";

export interface AppSettings {
  theme: Theme;
  enableNotifications: boolean;
}

export type Theme = "dark" | "light" | "system";

export const themeStorage = storage.defineItem<Theme>(
  "sync:settings-ui-theme", // 'local:' prefix tells WXT to use browser.storage.local
  { fallback: "system" },
);

export const captureSuggestionStorage = storage.defineItem<boolean>(
  "sync:settings-capture-suggestion",
  { fallback: true },
);

/**
 * Multiplier of capture prompt delay. 5 is the default meaning with a base of one minute it equals 5 minutes as default.
 */
export const captureSuggestionDelayMultiplierStorage =
  storage.defineItem<number>("sync:settings-capture-suggestion-delay", {
    fallback: 5,
  });

/**
 * Tracks if the Lexicora side panel is currently open.
 * Uses 'session:' storage because it is transient runtime state (stored in RAM),
 * incredibly fast, doesn't wake the background script to read, and resets when the browser closes.
 */
export const sidePanelStateStorage = storage.defineItem<boolean>(
  "session:app-state-sidepanel-open",
  { fallback: false },
);

/**
 * Whether the entry content editor renders in its wide layout (up to 1000px)
 * instead of the page's regular content column. Synced so the preference
 * follows the user across the side panel and the window.
 */
export const editorWideModeStorage = storage.defineItem<boolean>(
  "sync:settings-editor-wide-mode",
  { fallback: false },
);

/**
 * Settings → Export: write the JSON backup without indentation. On by default:
 * a backup is kept or moved far more often than read. Local, not synced: how
 * one machine exports says nothing about another, and the synced settings are
 * the ones the privacy policy lists.
 */
export const exportCompactJsonStorage = storage.defineItem<boolean>(
  "local:settings-export-compact-json",
  { fallback: true },
);

/**
 * Settings → Export: keep archived topics and entries in the Markdown archive.
 * On by default, so nothing is left out unasked.
 */
export const exportMarkdownIncludeArchivedStorage = storage.defineItem<boolean>(
  "local:settings-export-markdown-include-archived",
  { fallback: true },
);
