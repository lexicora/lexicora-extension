import { describe, it, expect } from "vitest";

import { findRelease, formatReleaseDate, RELEASES } from "../changelog";
// The version WXT puts in the manifest.
import { version as manifestVersion } from "../../../package.json";

/**
 * The changelog is written by hand, so these catch what is easy to get wrong:
 * a version bump without notes, a duplicate, and entries out of order.
 */

const parts = (version: string) => version.split(".").map(Number);

function compareVersions(a: string, b: string): number {
  const [pa, pb] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

describe("RELEASES", () => {
  it("starts with the version this build is", () => {
    expect(manifestVersion).toBeDefined();
    expect(RELEASES[0]?.version).toBe(manifestVersion);
  });

  it("lists each version once, newest first", () => {
    for (let i = 1; i < RELEASES.length; i++) {
      expect(
        compareVersions(RELEASES[i - 1]!.version, RELEASES[i]!.version),
      ).toBeGreaterThan(0);
    }
  });

  it("has something to say for every release", () => {
    for (const release of RELEASES) {
      expect(release.summary).not.toBe("");
      const changes = Object.values(release.changes).flat();
      expect(changes.length).toBeGreaterThan(0);
    }
  });

  it("writes dates as YYYY-MM-DD", () => {
    for (const { date } of RELEASES) {
      if (date) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("findRelease", () => {
  it("finds a release by version, and nothing for an unknown one", () => {
    expect(findRelease(RELEASES[0]!.version)).toBe(RELEASES[0]);
    expect(findRelease("0.0.0-unknown")).toBeUndefined();
    expect(findRelease(undefined)).toBeUndefined();
  });
});

describe("formatReleaseDate", () => {
  it("keeps the day as written, whatever the time zone", () => {
    // Read as local midnight, 1 January would be 31 December 2025 west of
    // UTC. Only the year and that day are checked, since the format is the
    // locale's: "1 Jan 2026", "Jan 1, 2026" or "01.01.2026".
    const formatted = formatReleaseDate("2026-01-01");
    expect(formatted).toMatch(/2026/);
    expect(formatted).not.toMatch(/2025|31/);
  });
});
