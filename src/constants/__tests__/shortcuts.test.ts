import { describe, it, expect } from "vitest";
import {
  BROWSER_COMMANDS,
  COMMAND_ID,
  PANEL_SHORTCUTS,
  manifestCommands,
} from "../shortcuts";
import { isCapturableUrl } from "../support-capture-sites";

/**
 * Covers the shortcut definitions against the browsers' rules. A manifest
 * with an invalid key fails to install, so these are checked here rather than
 * discovered at load time.
 */

const suggestedKeys = Object.values(BROWSER_COMMANDS).flatMap(({ suggestedKey }) => [
  suggestedKey.default,
  suggestedKey.mac,
]);

describe("browser-wide commands", () => {
  it("stays within Chrome's limit of four suggested shortcuts", () => {
    expect(Object.keys(manifestCommands("chrome")).length).toBeLessThanOrEqual(4);
  });

  it("uses Chromium's side panel command and Firefox's built-in sidebar command", () => {
    expect(Object.keys(manifestCommands("chrome"))).toContain(COMMAND_ID.OPEN_SIDE_PANEL);
    expect(Object.keys(manifestCommands("firefox"))).toContain(
      COMMAND_ID.FIREFOX_OPEN_SIDEBAR,
    );
    expect(Object.keys(manifestCommands("firefox"))).not.toContain(
      COMMAND_ID.OPEN_SIDE_PANEL,
    );
  });

  it("gives every key a required modifier and never Ctrl+Alt", () => {
    for (const key of suggestedKeys) {
      expect(key).toMatch(/\b(Ctrl|Alt|MacCtrl|Command)\+/);
      expect(key).not.toMatch(/Ctrl\+Alt|Alt\+Ctrl/);
    }
  });

  it("avoids Option on macOS, which types characters on many layouts", () => {
    for (const { suggestedKey } of Object.values(BROWSER_COMMANDS)) {
      expect(suggestedKey.mac).not.toMatch(/\b(Alt|Option)\+/);
    }
  });

  it("gives each command a distinct key", () => {
    const defaults = Object.values(BROWSER_COMMANDS).map((c) => c.suggestedKey.default);
    expect(new Set(defaults).size).toBe(defaults.length);
  });
});

describe("panel shortcuts", () => {
  it("has no duplicate keys", () => {
    const keys = PANEL_SHORTCUTS.map((s) => `${s.mod ? "mod+" : ""}${s.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("stores keys lower-case, as the resolver compares them", () => {
    for (const { key } of PANEL_SHORTCUTS) expect(key).toBe(key.toLowerCase());
  });
});

describe("isCapturableUrl", () => {
  it.each([
    ["https://example.com/article", true],
    ["http://example.com", true],
    ["file:///Users/me/notes.html", true],
    ["chrome://extensions/", false],
    ["about:blank", false],
    ["https://example.com/paper.pdf", false],
    ["https://chromewebstore.google.com/detail/x", false],
    [undefined, false],
  ])("%s → %s", (url, expected) => {
    expect(isCapturableUrl(url)).toBe(expected);
  });
});
