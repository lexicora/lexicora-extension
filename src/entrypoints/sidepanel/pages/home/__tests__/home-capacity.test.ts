import { describe, it, expect } from "vitest";
import {
  aiTopicRows,
  allocateHomeRows,
  homeRowSpace,
  splitEntryRows,
} from "../home-capacity";

/**
 * Covers how many suggestion rows the home page shows. A row is 45px; the
 * entries header costs 52px; the "Create a topic" link costs 26px when there
 * are fewer topics than would fit.
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

describe("aiTopicRows", () => {
  it("keeps the thresholds the AI layout was tuned around", () => {
    // The prompt's textarea grows with the viewport, so the topic count steps
    // rather than filling. Unchanged from before the AI surfaces were gated.
    expect(aiTopicRows(800)).toBe(3);
    expect(aiTopicRows(825)).toBe(4);
    expect(aiTopicRows(870)).toBe(5);
    expect(aiTopicRows(1200)).toBe(5);
  });
});

describe("homeRowSpace", () => {
  it("never goes below zero on a very short panel", () => {
    expect(homeRowSpace(100)).toBe(0);
  });

  it("grows with the panel", () => {
    expect(homeRowSpace(900)).toBeGreaterThan(homeRowSpace(700));
  });

  it("shows more than the AI layout's three topics and two entries", () => {
    // 704px is a normal side-panel height; the old fixed counts left roughly
    // four rows of the panel empty once the AI prompt was gated off.
    const { maxTopics, maxEntries } = allocateHomeRows({
      availablePx: homeRowSpace(704),
      topicsAvailable: 12,
      entriesAvailable: 12,
    });

    expect(maxTopics).toBeGreaterThan(3);
    expect(maxEntries).toBeGreaterThan(2);
  });
});

describe("two entry groups", () => {
  it("costs a second header, so one fewer row is available", () => {
    const one = allocateHomeRows({
      availablePx: 500,
      topicsAvailable: 12,
      entriesAvailable: 12,
      entryGroups: 1,
    });
    const two = allocateHomeRows({
      availablePx: 500,
      topicsAvailable: 12,
      entriesAvailable: 12,
      entryGroups: 2,
    });

    expect(two.maxTopics + two.maxEntries).toBeLessThan(
      one.maxTopics + one.maxEntries,
    );
  });
});

describe("splitEntryRows", () => {
  it("gives the current site's entries at most half the rows", () => {
    expect(
      splitEntryRows({ maxEntries: 6, siteAvailable: 10, recentAvailable: 10 }),
    ).toEqual({ siteRows: 3, recentRows: 3 });
  });

  it("rounds the half down, so recent entries keep the odd row", () => {
    expect(
      splitEntryRows({ maxEntries: 5, siteAvailable: 10, recentAvailable: 10 }),
    ).toEqual({ siteRows: 2, recentRows: 3 });
  });

  it("passes rows the site cannot fill to the recent entries", () => {
    expect(
      splitEntryRows({ maxEntries: 6, siteAvailable: 1, recentAvailable: 10 }),
    ).toEqual({ siteRows: 1, recentRows: 5 });
  });

  it("lets the site take every row when there are no recent entries left", () => {
    // Everything recent came from this site, so the cap would only leave a gap.
    expect(
      splitEntryRows({ maxEntries: 6, siteAvailable: 10, recentAvailable: 0 }),
    ).toEqual({ siteRows: 6, recentRows: 0 });
  });

  it("shows nothing from the site when nothing was captured there", () => {
    expect(
      splitEntryRows({ maxEntries: 6, siteAvailable: 0, recentAvailable: 10 }),
    ).toEqual({ siteRows: 0, recentRows: 6 });
  });
});
