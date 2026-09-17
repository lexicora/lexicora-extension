import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MODALITY_ATTRIBUTE,
  installInputModality,
  isNavigationKey,
} from "../input-modality";

/**
 * Covers when focus rings may appear. The browser counts any keypress as
 * keyboard use, so a single-key shortcut lit up whatever had been clicked;
 * only keys that move or activate focus should.
 */

let uninstall: () => void;

const modality = () => document.documentElement.getAttribute(MODALITY_ATTRIBUTE);

function key(k: string, mods: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, ...mods }));
}

beforeEach(() => {
  document.documentElement.removeAttribute(MODALITY_ATTRIBUTE);
  uninstall = installInputModality();
});

afterEach(() => {
  uninstall();
});

describe("installInputModality", () => {
  it("starts with no modality, so nothing shows a ring before any input", () => {
    expect(modality()).toBeNull();
  });

  it.each(["Tab", "Enter", " ", "Escape", "ArrowDown", "Home", "PageDown"])(
    "switches to keyboard on %j",
    (k) => {
      key(k);
      expect(modality()).toBe("keyboard");
    },
  );

  it("leaves a shortcut key alone, so a clicked tab does not light up", () => {
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    key("f");
    key("1");
    key("/");

    expect(modality()).toBe("pointer");
  });

  it("switches back to pointer on a click or tap", () => {
    key("Tab");
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    expect(modality()).toBe("pointer");
  });

  it("stops tracking once uninstalled", () => {
    uninstall();
    key("Tab");

    expect(modality()).toBeNull();
    uninstall = () => {};
  });
});

describe("isNavigationKey", () => {
  it("counts Shift+Tab, which moves focus backwards", () => {
    expect(isNavigationKey({ key: "Tab", metaKey: false, ctrlKey: false, altKey: false })).toBe(true);
  });

  it("does not count arrows with a modifier, which are the back and forward shortcuts", () => {
    expect(isNavigationKey({ key: "ArrowLeft", metaKey: true, ctrlKey: false, altKey: false })).toBe(false);
    expect(isNavigationKey({ key: "ArrowLeft", metaKey: false, ctrlKey: false, altKey: true })).toBe(false);
  });

  it("does not count letters or digits", () => {
    expect(isNavigationKey({ key: "f", metaKey: false, ctrlKey: false, altKey: false })).toBe(false);
    expect(isNavigationKey({ key: "2", metaKey: false, ctrlKey: false, altKey: false })).toBe(false);
  });
});
