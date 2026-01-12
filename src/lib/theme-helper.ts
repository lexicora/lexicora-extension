export function getAppTheme(): "light" | "dark" | undefined {
  let theme = localStorage.getItem("lexicora-ui-theme") || "system";

  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (theme !== "light" && theme !== "dark") {
    return undefined;
  }

  return theme;
}

export function resolveAppTheme(theme: string): "light" | "dark" {
  if (theme === "system" || (theme !== "light" && theme !== "dark")) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme; // (not necessary) as "light" | "dark";
}
