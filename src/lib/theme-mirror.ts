import type { Theme } from "@/lib/storage/settings";

/**
 * The key `public/theme-init.js` reads. Keep the two in step: the script is
 * plain JavaScript in `public/` and cannot import this.
 */
export const THEME_MIRROR_KEY = "lc-theme";

/**
 * Copies the theme to localStorage, where each page's head script can read it
 * synchronously and paint the first frame in the right colours. Extension
 * storage stays the source of truth; this is only ever a copy of it.
 */
export function mirrorTheme(theme: Theme): void {
  try {
    if (localStorage.getItem(THEME_MIRROR_KEY) !== theme) {
      localStorage.setItem(THEME_MIRROR_KEY, theme);
    }
  } catch {
    // Storage blocked: pages fall back to the system preference.
  }
}
