import { describe, it, expect } from "vitest";
import { isEditingPath, isEntryEditPath } from "../routes";

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

/**
 * The create and edit pages. The bottom navigation hides there and the
 * navigation shortcuts are off, both from this one helper — they have to agree,
 * or a key goes somewhere the on-screen UI says it cannot.
 */
describe("isEditingPath", () => {
  it.each([
    "/library/entries/new",
    "/library/entries/019a-7c3f/edit",
    "/library/topics/new",
    "/library/topics/019a-7c3f/edit",
  ])("matches %s", (path) => {
    expect(isEditingPath(path)).toBe(true);
  });

  it.each([
    "/library/entries/019a-7c3f",
    "/library/topics/019a-7c3f",
    "/library/topics/019a-7c3f/entries",
    "/library",
    "/",
    "/settings",
    "/library/entries/new/extra",
  ])("does not match %s", (path) => {
    expect(isEditingPath(path)).toBe(false);
  });
});
