import { describe, it, expect } from "vitest";
import { changedFields, hasChanges } from "../doc-changes";

/**
 * Covers the no-op save guard. Forms patch every field they manage, so without
 * this, opening an entry and saving it untouched wrote the document and reset
 * its updatedAt — moving it to the top of the library.
 */

const entry = {
  title: "How RxDB works",
  description: "A description.",
  tags: ["database", "offline"],
  isFavorite: false,
  siteName: "RxDB",
};

describe("changedFields", () => {
  it("finds nothing when the form matches the document", () => {
    expect(changedFields(entry, { ...entry })).toEqual({});
    expect(hasChanges(entry, { ...entry })).toBe(false);
  });

  it("returns only the fields that differ", () => {
    expect(changedFields(entry, { ...entry, title: "Renamed" })).toEqual({
      title: "Renamed",
    });
  });

  it("compares arrays by value, not by reference", () => {
    // The form rebuilds tags on every render, so the arrays never match by
    // reference even when the tags are identical.
    expect(hasChanges(entry, { tags: ["database", "offline"] })).toBe(false);
    expect(hasChanges(entry, { tags: ["database"] })).toBe(true);
    expect(hasChanges(entry, { tags: ["offline", "database"] })).toBe(true);
  });

  it("treats an emptied field as a change", () => {
    expect(changedFields(entry, { description: "" })).toEqual({
      description: "",
    });
  });

  it("notices a toggled boolean", () => {
    expect(hasChanges(entry, { isFavorite: true })).toBe(true);
    expect(hasChanges(entry, { isFavorite: false })).toBe(false);
  });

  it("ignores fields the patch does not mention", () => {
    expect(changedFields(entry, { title: "How RxDB works" })).toEqual({});
  });
});
