import { describe, it, expect } from "vitest";
import { allocateHomeRows } from "../home-capacity";

/**
 * Covers how the home page divides its free space between topic and entry
 * rows. A row is 45px; the entries header costs 52px; the "Create a topic"
 * link costs 26px when there are fewer topics than would fit.
 */

const alloc = (
  availablePx: number,
  topicsAvailable: number,
  entriesAvailable: number,
) => allocateHomeRows({ availablePx, topicsAvailable, entriesAvailable });

describe("allocateHomeRows", () => {
  it("shows nothing when there is no space", () => {
    expect(alloc(0, 5, 5)).toEqual({ maxTopics: 0, maxEntries: 0 });
  });

  it("fills a tall panel with far more than the old fixed three", () => {
    // 700px of free space: 14 rows, minus the entries header.
    const { maxTopics, maxEntries } = alloc(700, 12, 12);

    expect(maxTopics).toBeGreaterThan(3);
    expect(maxTopics + maxEntries).toBeGreaterThanOrEqual(12);
  });

  it("splits the rows so entries are never squeezed out", () => {
    const { maxTopics, maxEntries } = alloc(700, 12, 12);

    expect(maxEntries).toBeGreaterThanOrEqual(maxTopics - 1);
  });

  it("gives a short topic list's unused rows to the entries", () => {
    const many = alloc(700, 12, 12);
    const few = alloc(700, 2, 12);

    expect(few.maxTopics).toBe(2);
    expect(few.maxEntries).toBeGreaterThan(many.maxEntries);
    expect(few.maxTopics + few.maxEntries).toBe(many.maxTopics + many.maxEntries);
  });

  it("never asks for more rows than there are topics or entries", () => {
    expect(alloc(700, 1, 1)).toEqual({ maxTopics: 1, maxEntries: 1 });
  });

  it("drops the entries section rather than show a lone row under its header", () => {
    // Room for three rows, but the header would leave only one entry.
    const { maxTopics, maxEntries } = alloc(150, 5, 5);

    expect(maxEntries).toBe(0);
    expect(maxTopics).toBe(3);
  });

  it("uses the entries' rows when there are no entries", () => {
    expect(alloc(450, 12, 0)).toEqual({ maxTopics: 10, maxEntries: 0 });
  });

  it("reserves room for the create link only when topics fall short", () => {
    // 12 topics fill the rows, so no link and no reservation.
    expect(alloc(450, 12, 0).maxTopics).toBe(10);
    // With two topics the link shows, and it costs less than a row here.
    expect(alloc(450, 2, 0).maxTopics).toBe(2);
  });

  it("keeps the total within the measured space", () => {
    for (const px of [120, 250, 400, 560, 700, 900]) {
      const { maxTopics, maxEntries } = alloc(px, 20, 20);
      const used =
        (maxTopics + maxEntries) * 45 + (maxEntries > 0 ? 52 : 0);
      expect(used).toBeLessThanOrEqual(px);
    }
  });
});
