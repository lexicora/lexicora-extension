import { describe, expect, it } from "vitest";
import { currentStoreListing, STORE_LISTINGS, withUtm } from "../site";

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const EDGE_UA = `${CHROME_UA} Edg/141.0.0.0`;
const UNPACKED_ID = "abcdefghijklmnopabcdefghijklmnop";

const base = { isFirefox: false, isEdgeBuild: false, userAgent: CHROME_UA };

describe("currentStoreListing", () => {
  it("goes by the store's own extension ID", () => {
    expect(
      currentStoreListing({ ...base, extensionId: STORE_LISTINGS.chrome.id }),
    ).toBe(STORE_LISTINGS.chrome);
    expect(
      currentStoreListing({ ...base, extensionId: STORE_LISTINGS.edge.id }),
    ).toBe(STORE_LISTINGS.edge);
  });

  it("sends a Chrome Web Store copy installed in Edge to the Chrome Web Store", () => {
    expect(
      currentStoreListing({
        ...base,
        userAgent: EDGE_UA,
        extensionId: STORE_LISTINGS.chrome.id,
      }),
    ).toBe(STORE_LISTINGS.chrome);
  });

  it("falls back to the build, then the browser, for an unpacked copy", () => {
    expect(currentStoreListing({ ...base, extensionId: UNPACKED_ID })).toBe(
      STORE_LISTINGS.chrome,
    );
    expect(
      currentStoreListing({ ...base, extensionId: UNPACKED_ID, isEdgeBuild: true }),
    ).toBe(STORE_LISTINGS.edge);
    expect(
      currentStoreListing({ ...base, extensionId: UNPACKED_ID, userAgent: EDGE_UA }),
    ).toBe(STORE_LISTINGS.edge);
  });

  it("sends Firefox to Firefox Add-ons", () => {
    expect(
      currentStoreListing({ ...base, isFirefox: true, extensionId: "lexicora@x" }),
    ).toBe(STORE_LISTINGS.firefox);
  });
});

describe("withUtm", () => {
  it("tags a link with where in the extension it was clicked", () => {
    const { url } = STORE_LISTINGS.chrome;
    const tagged = new URL(withUtm(url, "about"));

    expect(tagged.origin).toBe(new URL(url).origin);
    expect(tagged.search).toBe(
      "?utm_source=lexicora-extension&utm_medium=about",
    );
  });

  it("keeps a link's own path and parameters", () => {
    const tagged = new URL(withUtm("https://example.com/a/b?x=1", "popup"));

    expect(tagged.pathname).toBe("/a/b");
    expect(tagged.searchParams.get("x")).toBe("1");
    expect(tagged.searchParams.get("utm_medium")).toBe("popup");
  });

  it("replaces tags the link already has, rather than doubling them", () => {
    const tagged = new URL(
      withUtm("https://example.com/?utm_medium=old", "support"),
    );

    expect(tagged.searchParams.getAll("utm_medium")).toEqual(["support"]);
  });

  it("tags every store listing", () => {
    for (const { url } of Object.values(STORE_LISTINGS)) {
      expect(new URL(withUtm(url, "about")).searchParams.get("utm_source")).toBe(
        "lexicora-extension",
      );
    }
  });
});
