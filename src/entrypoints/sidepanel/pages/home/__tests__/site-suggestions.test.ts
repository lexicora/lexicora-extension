import { describe, it, expect } from "vitest";
import type { EntryDocType } from "@/db/schemas/entry";
import {
  locationOf,
  normalizePath,
  splitSiteEntries,
} from "../site-suggestions";

/**
 * Covers which captured entry counts as "this exact page". Too strict and the
 * duplicate guard misses a page you already saved; too loose and it points at
 * a different page on the same site.
 */

function entry(
  id: string,
  pathnameUrl: string,
  searchUrl = "",
): EntryDocType {
  return { id, pathnameUrl, searchUrl, title: id } as EntryDocType;
}

const at = (pathname: string, search = "") => ({ pathname, search });

describe("normalizePath", () => {
  it("treats a trailing slash as the same page", () => {
    expect(normalizePath("/docs/")).toBe(normalizePath("/docs"));
  });

  it("keeps the root path", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
  });
});

describe("locationOf", () => {
  it("ignores the fragment, which is a place within a page", () => {
    expect(locationOf("https://rxdb.info/docs#install")).toEqual(at("/docs"));
  });

  it("keeps the query, which usually selects the content", () => {
    expect(locationOf("https://example.com/watch?v=123")).toEqual(
      at("/watch", "?v=123"),
    );
  });

  it("returns nothing for a tab without a usable URL", () => {
    expect(locationOf(undefined)).toBeNull();
    expect(locationOf("not a url")).toBeNull();
  });
});

describe("splitSiteEntries", () => {
  const entries = [
    entry("replication", "/docs/replication"),
    entry("current", "/docs/key-compression"),
    entry("quickstart", "/docs/quickstart"),
  ];

  it("finds the entry for this exact page and leaves it out of the rest", () => {
    const { capturedPage, fromThisSite } = splitSiteEntries(
      entries,
      at("/docs/key-compression"),
    );

    expect(capturedPage?.id).toBe("current");
    expect(fromThisSite.map((e) => e.id)).toEqual(["replication", "quickstart"]);
  });

  it("matches across a trailing slash", () => {
    expect(
      splitSiteEntries(entries, at("/docs/key-compression/")).capturedPage?.id,
    ).toBe("current");
  });

  it("does not match a different page on the same site", () => {
    const { capturedPage, fromThisSite } = splitSiteEntries(
      entries,
      at("/docs/other"),
    );

    expect(capturedPage).toBeNull();
    expect(fromThisSite).toHaveLength(3);
  });

  it("separates pages that differ only by their query", () => {
    const videos = [entry("first", "/watch", "?v=111")];

    expect(splitSiteEntries(videos, at("/watch", "?v=222")).capturedPage).toBeNull();
    expect(
      splitSiteEntries(videos, at("/watch", "?v=111")).capturedPage?.id,
    ).toBe("first");
  });

  it("keeps every entry when the tab has no usable URL", () => {
    const { capturedPage, fromThisSite } = splitSiteEntries(entries, null);

    expect(capturedPage).toBeNull();
    expect(fromThisSite).toHaveLength(3);
  });
});
