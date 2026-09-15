import { describe, it, expect } from "vitest";
import { isEntryEditPath } from "../routes";

/**
 * Covers the one route shape captures care about. On an entry's edit page a
 * capture goes into that entry, so nothing navigates away from it — get this
 * wrong and an edit in progress is abandoned for a new entry.
 */

describe("isEntryEditPath", () => {
  it("matches an entry's edit page", () => {
    expect(isEntryEditPath("/library/entries/019a-7c3f/edit")).toBe(true);
  });

  it.each([
    "/library/entries/019a-7c3f",
    "/library/entries/new",
    "/library/topics/019a-7c3f/edit",
    "/library",
    "/",
    "/library/entries/019a-7c3f/edit/extra",
  ])("does not match %s", (path) => {
    expect(isEntryEditPath(path)).toBe(false);
  });
});
