import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach } from "vitest";

import { mirrorTheme, THEME_MIRROR_KEY } from "../theme-mirror";
// The script each page loads in its head, run here as the browser runs it.
import themeInit from "../../../public/theme-init.js?raw";

/**
 * The provider writes a copy of the theme; the head script reads it before
 * the first frame. They share nothing but a key, so these check both ends.
 */

// From disk: the test runner stubs stylesheets, even as raw text.
const globalsCss = readFileSync(
  resolve(process.cwd(), "src/assets/styles/globals.css"),
  "utf8",
);

function runThemeInit() {
  // oxlint-disable-next-line no-implied-eval
  new Function(themeInit)();
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.head.innerHTML = "";
});

describe("mirrorTheme", () => {
  it("copies the theme under the key the head script reads", () => {
    mirrorTheme("dark");
    expect(localStorage.getItem(THEME_MIRROR_KEY)).toBe("dark");
    expect(themeInit).toContain(`"${THEME_MIRROR_KEY}"`);
  });
});

describe("theme-init.js", () => {
  it("applies a stored theme over the system preference", () => {
    mirrorTheme("dark");
    runThemeInit();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    document.documentElement.className = "";
    mirrorTheme("light");
    runThemeInit();
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("follows the system when nothing is stored, or the theme is system", () => {
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    runThemeInit();
    expect(document.documentElement.classList.contains(system)).toBe(true);

    document.documentElement.className = "";
    mirrorTheme("system");
    runThemeInit();
    expect(document.documentElement.classList.contains(system)).toBe(true);
  });

  it("paints each class in the stylesheet's own background", () => {
    // :root holds the light palette, .dark the dark one.
    const [light, dark] = [
      ...globalsCss.matchAll(/--background:\s*([^;]+);/g),
    ].map((match) => match[1]!.trim());

    runThemeInit();
    const css = document.head.querySelector("style")?.textContent ?? "";
    expect(css).toContain(`html.light{background-color:${light}}`);
    expect(css).toContain(`html.dark{background-color:${dark}}`);
  });
});
