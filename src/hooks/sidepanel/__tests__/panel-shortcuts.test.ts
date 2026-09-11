import { describe, it, expect, beforeEach } from "vitest";
import { resolvePanelShortcut, type ShortcutKeyEvent } from "../panel-shortcuts";

/**
 * Covers which keydowns in the side panel become shortcuts, on each platform.
 * The negative cases matter as much as the positive ones: a shortcut firing
 * while the user types, or taking a combination that belongs to the browser or
 * the other platform, is worse than no shortcut.
 */

const MAC = true;
const OTHER = false;

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

describe("single keys", () => {
  it.each([
    ["/", "search"],
    ["h", "home"],
    ["n", "newEntry"],
    ["c", "capture"],
    ["b", "bookmark"],
    ["?", "showShortcuts"],
  ])("maps %s to %s on every platform", (key, action) => {
    expect(resolvePanelShortcut(press(key), MAC)).toBe(action);
    expect(resolvePanelShortcut(press(key), OTHER)).toBe(action);
  });

  it("matches letters with Caps Lock on", () => {
    expect(resolvePanelShortcut(press("N"), MAC)).toBe("newEntry");
  });

  it.each([
    ["an input", "<input>", "input"],
    ["a textarea", "<textarea></textarea>", "textarea"],
    ["the editor", '<div contenteditable="true"><p>x</p></div>', "p"],
    ["a dialog", '<div role="dialog"><button>OK</button></div>', "button"],
    ["a menu", '<div role="menu"><div role="menuitem">A</div></div>', '[role="menuitem"]'],
  ])("are ignored in %s", (_, html, selector) => {
    const target = element(html, selector);
    expect(resolvePanelShortcut(press("n", { target }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("/", { target }), MAC)).toBeNull();
  });
});

describe("⌘ on macOS, Ctrl elsewhere", () => {
  it("saves with ⌘S on macOS and Ctrl+S elsewhere", () => {
    expect(resolvePanelShortcut(press("s", { metaKey: true }), MAC)).toBe("save");
    expect(resolvePanelShortcut(press("s", { ctrlKey: true }), OTHER)).toBe("save");
  });

  it("does not take the other platform's modifier", () => {
    // Ctrl+S on a Mac is not ⌘S, and ⌘ on Windows is the Windows key.
    expect(resolvePanelShortcut(press("s", { ctrlKey: true }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("s", { metaKey: true }), OTHER)).toBeNull();
  });

  it("saves even while typing", () => {
    const input = element("<input>", "input");
    expect(
      resolvePanelShortcut(press("s", { metaKey: true, target: input }), MAC),
    ).toBe("save");
  });

  it("searches with ⌘K / Ctrl+K, for layouts where / needs Shift", () => {
    expect(resolvePanelShortcut(press("k", { metaKey: true }), MAC)).toBe("search");
    expect(resolvePanelShortcut(press("k", { ctrlKey: true }), OTHER)).toBe("search");
  });

  it("leaves ⌘K alone inside the editor, where it may mean a link", () => {
    const target = element('<div contenteditable="true"><p>x</p></div>', "p");
    expect(resolvePanelShortcut(press("k", { metaKey: true, target }), MAC)).toBeNull();
  });

  it("leaves the browser's own combinations alone", () => {
    // ⌘N / Ctrl+N is a new window; ⌘T a new tab.
    expect(resolvePanelShortcut(press("n", { metaKey: true }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("n", { ctrlKey: true }), OTHER)).toBeNull();
    expect(resolvePanelShortcut(press("t", { metaKey: true }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("s", { metaKey: true, altKey: true }), MAC)).toBeNull();
  });
});

describe("back and forward", () => {
  it("uses ⌘← / ⌘→ and ⌘[ / ⌘] on macOS", () => {
    expect(resolvePanelShortcut(press("ArrowLeft", { metaKey: true }), MAC)).toBe("back");
    expect(resolvePanelShortcut(press("ArrowRight", { metaKey: true }), MAC)).toBe("forward");
    expect(resolvePanelShortcut(press("[", { metaKey: true }), MAC)).toBe("back");
    expect(resolvePanelShortcut(press("]", { metaKey: true }), MAC)).toBe("forward");
  });

  it("uses Alt+← / Alt+→ on Windows and Linux", () => {
    expect(resolvePanelShortcut(press("ArrowLeft", { altKey: true }), OTHER)).toBe("back");
    expect(resolvePanelShortcut(press("ArrowRight", { altKey: true }), OTHER)).toBe("forward");
  });

  it("does not cross platforms", () => {
    // ⌥← on a Mac moves by word; Ctrl+← on Windows does too.
    expect(resolvePanelShortcut(press("ArrowLeft", { altKey: true }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("ArrowLeft", { ctrlKey: true }), OTHER)).toBeNull();
  });

  it("leaves arrow keys to text fields", () => {
    // ⌘← in a field moves to the start of the line.
    const input = element("<input>", "input");
    expect(
      resolvePanelShortcut(press("ArrowLeft", { metaKey: true, target: input }), MAC),
    ).toBeNull();
  });
});

describe("ignored events", () => {
  it("skips IME composition and already-handled events", () => {
    expect(resolvePanelShortcut(press("n", { isComposing: true }), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("n", { defaultPrevented: true }), MAC)).toBeNull();
  });

  it("skips keys that are not shortcuts", () => {
    expect(resolvePanelShortcut(press("x"), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("Enter"), MAC)).toBeNull();
    expect(resolvePanelShortcut(press("ArrowLeft"), MAC)).toBeNull();
  });
});
