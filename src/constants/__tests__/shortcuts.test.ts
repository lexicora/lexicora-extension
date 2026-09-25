import { describe, it, expect } from "vitest";
import {
  BROWSER_COMMANDS,
  COMMAND_ID,
  LIBRARY_SHORTCUTS,
  PANEL_SHORTCUTS,
  bindingApplies,
  formatBinding,
  manifestCommands,
  BOTTOM_NAV_ACTIONS,
  suggestedKeyFor,
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

  it("gives Firefox its own capture key on Windows and Linux only", () => {
    // Alt+Shift+S opens Firefox's History menu; Alt+Shift+W is blocked in
    // Chrome. The manifest gets plain keys, never the `firefox` field.
    const chrome = manifestCommands("chrome")[COMMAND_ID.CAPTURE];
    const firefox = manifestCommands("firefox")[COMMAND_ID.CAPTURE];
    expect(chrome.suggested_key).toEqual({
      default: "Alt+Shift+S",
      mac: "MacCtrl+Shift+S",
    });
    expect(firefox.suggested_key).toEqual({
      default: "Alt+Shift+W",
      mac: "MacCtrl+Shift+S",
    });
    expect(manifestCommands("firefox")[COMMAND_ID.BOOKMARK].suggested_key).toEqual(
      manifestCommands("chrome")[COMMAND_ID.BOOKMARK].suggested_key,
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

describe("library shortcuts", () => {
  const bindingKey = (b: { key: string; mod?: boolean; alt?: boolean; shift?: boolean }) =>
    `${b.mod ? "mod+" : ""}${b.alt ? "alt+" : ""}${b.shift ? "shift+" : ""}${b.key}`;

  it.each([true, false])(
    "never share a key with the panel-wide shortcuts (isMac: %s)",
    (isMac) => {
      // Both are listened for on the same keypress, so a shared key would fire
      // a library action and a panel action at once.
      const panelKeys = new Set(
        PANEL_SHORTCUTS.flatMap((s) =>
          s.bindings.filter((b) => bindingApplies(b, isMac)).map(bindingKey),
        ),
      );
      const clashes = LIBRARY_SHORTCUTS.flatMap((s) =>
        s.bindings
          .filter((b) => bindingApplies(b, isMac))
          .map(bindingKey)
          .filter((key) => panelKeys.has(key)),
      );

      expect(clashes).toEqual([]);
    },
  );

  it("store keys lower-case, as the resolver compares them", () => {
    for (const { bindings } of LIBRARY_SHORTCUTS) {
      for (const { key } of bindings) expect(key).toBe(key.toLowerCase());
    }
  });

  it("give the tabs to the Library only, since the topic page has none", () => {
    const tabs = LIBRARY_SHORTCUTS.filter((s) =>
      ["showEntries", "showTopics"].includes(s.action),
    );
    for (const shortcut of tabs) expect(shortcut.pages).toEqual(["library"]);
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

describe("BOTTOM_NAV_ACTIONS", () => {
  it("is exactly what the bottom navigation offers", () => {
    // These are switched off on the create and edit pages, where that bar is
    // hidden. Back and forward are not in it: the header's back button is.
    expect([...BOTTOM_NAV_ACTIONS].sort()).toEqual([
      "home",
      "library",
      "settings",
    ]);
  });
});

describe("suggestedKeyFor", () => {
  it("says what to type into the browser's own settings", () => {
    // The settings page shows this for a command the browser left unset, so
    // it has to read the way that page writes keys: MacCtrl is Ctrl there.
    expect(suggestedKeyFor(COMMAND_ID.CAPTURE, false, false)).toBe("Alt+Shift+S");
    expect(suggestedKeyFor(COMMAND_ID.CAPTURE, true, false)).toBe("Ctrl+Shift+S");
    expect(suggestedKeyFor(COMMAND_ID.BOOKMARK, false, false)).toBe("Alt+Shift+D");
    expect(suggestedKeyFor(COMMAND_ID.BOOKMARK, true, false)).toBe("Ctrl+Shift+D");
  });

  it("says Firefox's own key where it differs", () => {
    expect(suggestedKeyFor(COMMAND_ID.CAPTURE, false, true)).toBe("Alt+Shift+W");
    // macOS is the same in both browsers, and so is everything else.
    expect(suggestedKeyFor(COMMAND_ID.CAPTURE, true, true)).toBe("Ctrl+Shift+S");
    expect(suggestedKeyFor(COMMAND_ID.BOOKMARK, false, true)).toBe("Alt+Shift+D");
  });

  it("has nothing to say about a command that is not ours", () => {
    expect(suggestedKeyFor("_execute_action", false, false)).toBeNull();
    expect(suggestedKeyFor(undefined, false, false)).toBeNull();
  });
});
