import { describe, it, expect } from "vitest";
import { shouldCloseForToggle } from "../side-panel-toggle-listener";

/**
 * Covers when the open/close shortcut closes a panel. The background always
 * opens the panel and asks it to close, so the panel alone decides whether the
 * shortcut meant "open" or "close".
 */

const base = { requestedWindowId: 3, ownWindowId: 3, ageMs: 5000, saving: false };

describe("shouldCloseForToggle", () => {
  it("closes an already-open panel in the requested window", () => {
    expect(shouldCloseForToggle(base)).toBe(true);
  });

  it("stays open when the request is for another window", () => {
    expect(shouldCloseForToggle({ ...base, requestedWindowId: 4 })).toBe(false);
  });

  it("stays open when the request is the one that just opened it", () => {
    expect(shouldCloseForToggle({ ...base, ageMs: 200 })).toBe(false);
  });

  it("stays open mid-save", () => {
    expect(shouldCloseForToggle({ ...base, saving: true })).toBe(false);
  });
});
