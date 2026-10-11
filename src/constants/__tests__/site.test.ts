import { describe, expect, it } from "vitest";
import { currentStoreListing, STORE_LISTINGS } from "../site";

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const EDGE_UA = `${CHROME_UA} Edg/141.0.0.0`;
const FIREFOX_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0";

describe("currentStoreListing", () => {
  it("sends each browser to its own store", () => {
    expect(currentStoreListing(false, CHROME_UA)).toBe(STORE_LISTINGS.chrome);
    // Edge runs the Chrome build, so only its user agent tells them apart.
    expect(currentStoreListing(false, EDGE_UA)).toBe(STORE_LISTINGS.edge);
    expect(currentStoreListing(true, FIREFOX_UA)).toBe(STORE_LISTINGS.firefox);
  });
});
