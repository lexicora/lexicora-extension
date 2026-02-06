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

export const capturePromptStorage = storage.defineItem<boolean>(
  "sync:settings-capture-prompt",
  { fallback: true },
);

/**
 * Multiplier of capture prompt delay. 5 is the default meaning with a base of one minute it equals 5 minutes as default.
 */
export const capturePromptDelayMultiplierStorage = storage.defineItem<number>(
  "sync:settings-capture-prompt-delay",
  { fallback: 5 },
);
