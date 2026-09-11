import { describe, it, expect, beforeEach } from "vitest";
import { resolvePanelShortcut, type ShortcutKeyEvent } from "../panel-shortcuts";

/**
 * Covers which keydowns in the side panel become shortcuts. The negative cases
 * matter as much as the positive ones: a shortcut firing while the user types,
 * or hijacking a browser combination, is worse than no shortcut.
 */

function press(
  key: string,
  { target = document.body, ...mods }: Partial<ShortcutKeyEvent> = {},
): ShortcutKeyEvent {
  return {
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    isComposing: false,
    defaultPrevented: false,
    target,
    ...mods,
  };
}

function element(html: string, selector: string): Element {
  document.body.innerHTML = html;
  return document.querySelector(selector)!;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("resolvePanelShortcut", () => {
  it.each([
    ["/", "search"],
    ["n", "newEntry"],
    ["c", "capture"],
    ["b", "bookmark"],
    ["?", "showShortcuts"],
  ])("maps %s to %s", (key, action) => {
    expect(resolvePanelShortcut(press(key))).toBe(action);
  });

  it("matches letters with Caps Lock on", () => {
    expect(resolvePanelShortcut(press("N"))).toBe("newEntry");
  });

  it("maps ⌘S and Ctrl+S to save", () => {
    expect(resolvePanelShortcut(press("s", { metaKey: true }))).toBe("save");
    expect(resolvePanelShortcut(press("s", { ctrlKey: true }))).toBe("save");
  });

  it("saves even while typing", () => {
    const input = element("<input>", "input");
    expect(resolvePanelShortcut(press("s", { metaKey: true, target: input }))).toBe("save");
  });

  it.each([
    ["an input", "<input>", "input"],
    ["a textarea", "<textarea></textarea>", "textarea"],
    ["the editor", '<div contenteditable="true"><p>x</p></div>', "p"],
    ["a dialog", '<div role="dialog"><button>OK</button></div>', "button"],
    ["a menu", '<div role="menu"><div role="menuitem">A</div></div>', '[role="menuitem"]'],
  ])("ignores single keys typed in %s", (_, html, selector) => {
    const target = element(html, selector);
    expect(resolvePanelShortcut(press("n", { target }))).toBeNull();
    expect(resolvePanelShortcut(press("/", { target }))).toBeNull();
  });

  it("leaves browser combinations alone", () => {
    // ⌘N / Ctrl+N is the browser's new window; not ours to take.
    expect(resolvePanelShortcut(press("n", { metaKey: true }))).toBeNull();
    expect(resolvePanelShortcut(press("n", { ctrlKey: true }))).toBeNull();
    expect(resolvePanelShortcut(press("n", { altKey: true }))).toBeNull();
    expect(resolvePanelShortcut(press("s", { metaKey: true, altKey: true }))).toBeNull();
  });

  it("ignores IME composition and already-handled events", () => {
    expect(resolvePanelShortcut(press("n", { isComposing: true }))).toBeNull();
    expect(resolvePanelShortcut(press("n", { defaultPrevented: true }))).toBeNull();
  });

  it("ignores keys that are not shortcuts", () => {
    expect(resolvePanelShortcut(press("x"))).toBeNull();
    expect(resolvePanelShortcut(press("Enter"))).toBeNull();
  });
});
