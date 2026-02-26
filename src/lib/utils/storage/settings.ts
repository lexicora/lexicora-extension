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
