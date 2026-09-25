import { describe, expect, it } from "vitest";

import { findTipCategory, TIP_CATEGORIES } from "../tips";

describe("TIP_CATEGORIES", () => {
  it("gives every category its own path and at least one tip", () => {
    const ids = TIP_CATEGORIES.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of TIP_CATEGORIES) {
      expect(category.id).toMatch(/^[a-z-]+$/);
      expect(category.tips.length).toBeGreaterThan(0);
    }
  });

  it("lists each tip once, in one category", () => {
    // Titles key the rows, and a tip in two categories would be one too many.
    const titles = TIP_CATEGORIES.flatMap((category) =>
      category.tips.map((tip) => tip.title),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("findTipCategory", () => {
  it("finds a category by the last part of its path", () => {
    expect(findTipCategory("editor")?.title).toBe("Editor");
  });

  it("returns null for a path this build does not know", () => {
    expect(findTipCategory("general")).toBeNull();
    expect(findTipCategory(undefined)).toBeNull();
  });
});
