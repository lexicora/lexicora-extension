import { describe, it, expect, beforeEach } from "vitest";
import { getPageMetadata } from "../bookmark";

/**
 * Covers the bookmark capture: a page's metadata with none of its content.
 *
 * "None of its content" is asserted literally — the page body carries a
 * sentinel string, and the whole payload is searched for it.
 */

const BODY_SENTINEL = "BODY-TEXT-THAT-MUST-NOT-BE-CAPTURED";

beforeEach(() => {
  document.head.innerHTML = `
    <title>Bookmarked Page</title>
    <meta name="description" content="What the page says about itself.">
    <meta property="og:site_name" content="Example Site">
    <link rel="icon" href="https://example.com/icon.png">
  `;
  document.body.innerHTML = `
    <article>
      <h1>Heading</h1>
      <p>${BODY_SENTINEL} ${"More body text. ".repeat(30)}</p>
    </article>
  `;
  document.documentElement.lang = "de";
});

describe("getPageMetadata", () => {
  it("captures the page's metadata", () => {
    const data = getPageMetadata();

    expect(data.title).toBe("Bookmarked Page");
    expect(data.metadata.excerpt).toBe("What the page says about itself.");
    expect(data.metadata.siteName).toBe("Example Site");
    expect(data.metadata.faviconUrl).toBe("https://example.com/icon.png");
    expect(data.lang).toBe("de");
    expect(data.location.href).toBe(window.location.href);
  });

  it("carries no page content anywhere in the payload", () => {
    const data = getPageMetadata();

    expect(data.content).toBe("");
    expect(data.textContent).toBe("");
    expect(data.metadata.length).toBe(0);
    expect(JSON.stringify(data)).not.toContain(BODY_SENTINEL);
  });

  it("marks itself as metadata-only and replaces the form", () => {
    const { misc } = getPageMetadata();

    expect(misc.metadataOnly).toBe(true);
    expect(misc.overrideExisting).toBe(true);
  });

  it("passes the side panel's content check despite being empty", () => {
    // useCaptureData drops payloads whose content is null or undefined, so an
    // empty string is what lets a bookmark through.
    expect(getPageMetadata().content).not.toBeNull();
    expect(getPageMetadata().content).not.toBeUndefined();
  });
});
