import { describe, it, expect } from "vitest";
import {
  BROWSER_COMMANDS,
  COMMAND_ID,
  PANEL_SHORTCUTS,
  bindingApplies,
  formatBinding,
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
  it.each([true, false])("has no binding claimed twice (isMac: %s)", (isMac) => {
    const seen = PANEL_SHORTCUTS.flatMap((s) =>
      s.bindings
        .filter((b) => bindingApplies(b, isMac))
        .map(
          (b) =>
            `${b.mod ? "mod+" : ""}${b.alt ? "alt+" : ""}${b.shift ? "shift+" : ""}${b.key}`,
        ),
    );
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("gives every action a binding on both platforms", () => {
    for (const shortcut of PANEL_SHORTCUTS) {
      expect(shortcut.bindings.some((b) => bindingApplies(b, true))).toBe(true);
      expect(shortcut.bindings.some((b) => bindingApplies(b, false))).toBe(true);
    }
  });

  it("stores keys lower-case, as the resolver compares them", () => {
    for (const { bindings } of PANEL_SHORTCUTS) {
      for (const { key } of bindings) expect(key).toBe(key.toLowerCase());
    }
  });

  it("lets only save fire while typing", () => {
    const whileTyping = PANEL_SHORTCUTS.filter((s) => s.whileTyping);
    expect(whileTyping.map((s) => s.action)).toEqual(["save"]);
  });
});

describe("formatBinding", () => {
  it.each([
    [{ key: "k", mod: true }, "⌘K", "Ctrl+K"],
    [{ key: "arrowleft", alt: true }, "⌥←", "Alt+←"],
    [{ key: "n", shift: true }, "⇧N", "Shift+N"],
    [{ key: "/" }, "/", "/"],
    [{ key: "n" }, "N", "N"],
  ])("%o → %s on macOS, %s elsewhere", (binding, mac, other) => {
    expect(formatBinding(binding, true)).toBe(mac);
    expect(formatBinding(binding, false)).toBe(other);
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
