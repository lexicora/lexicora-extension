import { describe, it, expect } from "vitest";
import { aiTopicRows, splitEntryRows } from "../home-capacity";

/**
 * Covers how many suggestions the home page shows: fixed counts now that the
 * page scrolls, except under the AI prompt, which still steps with the
 * viewport because its textarea takes the remaining height.
 */

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
