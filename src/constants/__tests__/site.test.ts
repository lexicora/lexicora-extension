import { describe, expect, it } from "vitest";
import { currentStoreListing, STORE_LISTINGS } from "../site";

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
