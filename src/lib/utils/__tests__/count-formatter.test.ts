import { describe, expect, it } from "vitest";
import { formatBytes, formatCount } from "../count-formatter";

describe("formatCount", () => {
  it.each([
    [0, "0"],
    [7, "7"],
    [999, "999"],
    [1000, "1k"],
    [1099, "1k+"],
    [1234, "1.2k+"],
    [1999, "1.9k+"],
    [5000, "5k"],
    [9999, "9.9k+"],
    [10_000, "10k"],
    [12_345, "12k+"],
    [999_999, "999k+"],
    [1_000_000, "1M"],
    [1_540_000, "1.5M+"],
  ])("%i → %s", (count, expected) => {
    expect(formatCount(count)).toBe(expected);
  });

  it("never rounds up", () => {
    // 1,999 is not "2k": the label would claim an item that is not there.
    for (const count of [1949, 1950, 1999, 19_999]) {
      const shown = Number.parseFloat(formatCount(count)) * 1000;
      expect(shown).toBeLessThanOrEqual(count);
    }
  });
});

describe("formatBytes", () => {
  it.each([
    [0, "0 kB"],
    [512, "0.5 kB"],
    [12_345, "12.3 kB"],
    [840_000, "840 kB"],
    [12_400_000, "12.4 MB"],
    [3_210_000_000, "3.2 GB"],
  ])("%i → %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});
