/**
 * @deprecated Use method in theme-provider.tsx
 * @param theme
 * @returns the resolved theme
 */
export function resolveAppTheme(theme: string): "light" | "dark" {
  if (theme === "system" || (theme !== "light" && theme !== "dark")) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme; // (not necessary) as "light" | "dark";
}
