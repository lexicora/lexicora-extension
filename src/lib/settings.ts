import { storage } from "wxt/utils/storage";

export type AppTheme = "system" | "light" | "dark";

export interface AppSettings {
  theme: AppTheme;
  enableNotifications: boolean;
}

export type Theme = "dark" | "light" | "system";

export const themeStorage = storage.defineItem<Theme>(
  "sync:settings-ui-theme", // 'local:' prefix tells WXT to use browser.storage.local
  { fallback: "system" },
);
