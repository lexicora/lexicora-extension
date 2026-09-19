import { describe, it, expect } from "vitest";

import { normalizeCallouts } from "../document-callouts";

/**
 * Covers the callout shapes of the sites the capture parser recognises, and
 * how each maps onto GitHub's five alert types. Each is trimmed from the
 * generator's real output, keeping the classes and nesting that matter.
 */

function normalize(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  normalizeCallouts(root);
  return root;
}

describe("normalizeCallouts", () => {
  it("rewrites a GitHub alert and drops its default title", () => {
    const root = normalize(
      '<div class="markdown-alert markdown-alert-important">' +
        '<p class="markdown-alert-title"><svg></svg>Important</p>' +
        "<p>Read this.</p></div>",
    );

    expect(root.innerHTML).toBe(
      '<blockquote data-alert-type="important"><p>Read this.</p></blockquote>',
    );
  });

  it.each([
    [
      "Docusaurus",
      "caution",
      '<div class="theme-admonition theme-admonition-danger alert alert--danger admonition_xJq3">' +
        '<div class="admonitionHeading_Gvgb"><span class="admonitionIcon_Rf37"><svg></svg></span>danger</div>' +
        '<div class="admonitionContent_BuS1"><p>Message</p></div></div>',
    ],
    [
      "Docusaurus v2",
      "note",
      '<div class="admonition admonition-info alert alert--info">' +
        '<div class="admonition-heading"><h5>info</h5></div>' +
        '<div class="admonition-content"><p>Message</p></div></div>',
    ],
    [
      "MkDocs",
      "warning",
      '<div class="admonition warning"><p class="admonition-title">Warning</p><p>Message</p></div>',
    ],
    [
      "Sphinx",
      "note",
      '<div class="admonition seealso"><p class="admonition-title">See also</p><p>Message</p></div>',
    ],
    [
      "Starlight",
      "warning",
      '<aside class="starlight-aside starlight-aside--caution">' +
        '<p class="starlight-aside__title">Caution</p>' +
        '<div class="starlight-aside__content"><p>Message</p></div></aside>',
    ],
    [
      "VitePress",
      "caution",
      '<div class="danger custom-block"><p class="custom-block-title">DANGER</p><p>Message</p></div>',
    ],
    [
      "VitePress GitHub alert",
      "caution",
      '<div class="caution custom-block github-alert"><p class="custom-block-title">CAUTION</p><p>Message</p></div>',
    ],
    [
      "Obsidian Publish",
      "caution",
      '<div data-callout="caution" class="callout"><div class="callout-title">' +
        '<div class="callout-icon"></div><div class="callout-title-inner">Caution</div></div>' +
        '<div class="callout-content"><p>Message</p></div></div>',
    ],
    [
      "MDN",
      "warning",
      '<div class="notecard warning"><p><strong>Warning:</strong> Message</p></div>',
    ],
  ])("reads a callout from %s as %s", (_site, type, html) => {
    const root = normalize(html);
    const quote = root.firstElementChild!;

    expect(root.children).toHaveLength(1);
    expect(quote.tagName).toBe("BLOCKQUOTE");
    expect(quote.getAttribute("data-alert-type")).toBe(type);
    // The default title is gone: the Alert block shows the type itself.
    expect(quote.textContent?.trim()).toBe("Message");
  });

  it("leads the message with a custom title, in bold", () => {
    const root = normalize(
      '<div class="admonition note"><p class="admonition-title">Phasellus posuere</p><p>Message</p></div>',
    );

    expect(root.innerHTML).toBe(
      '<blockquote data-alert-type="note"><p><strong>Phasellus posuere</strong></p><p>Message</p></blockquote>',
    );
  });

  it("keeps a title in another language, which may say more than the type", () => {
    const root = normalize(
      '<aside class="starlight-aside starlight-aside--tip"><p class="starlight-aside__title">Hinweis</p><p>Nachricht</p></aside>',
    );

    expect(root.querySelector("strong")?.textContent).toBe("Hinweis");
  });

  it("turns a custom Obsidian callout into a note", () => {
    const root = normalize(
      '<div data-callout="recipe" class="callout"><div class="callout-title">Recipe</div>' +
        '<div class="callout-content"><p>Message</p></div></div>',
    );

    const quote = root.firstElementChild!;
    expect(quote.getAttribute("data-alert-type")).toBe("note");
    expect(quote.textContent).toBe("Message");
  });

  it("keeps a leading bold phrase that is part of the message", () => {
    const root = normalize(
      '<div class="notecard note"><p><strong>Firefox 120</strong> added this.</p></div>',
    );

    expect(root.innerHTML).toBe(
      '<blockquote data-alert-type="note"><p><strong>Firefox 120</strong> added this.</p></blockquote>',
    );
  });

  it("leaves look-alikes without a known type alone", () => {
    const html =
      '<details class="details custom-block"><summary>Details</summary><p>Message</p></details>' +
      '<div class="notecard"><p>A plain card</p></div>' +
      '<div class="custom-block"><p>Some block</p></div>';

    expect(normalize(html).innerHTML).toBe(html);
  });
});
