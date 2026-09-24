// @vitest-environment jsdom
//* jsdom, like the parser's tests: its shadow DOM, slots and computed styles
//* are the ones these rely on, and the end-to-end case runs the parser.
import { describe, it, expect, beforeEach } from "vitest";

import { cloneComposedDocument } from "../compose-shadow-dom";
import { parseDocument } from "../document-parser";

/**
 * A plain clone of the page leaves web components empty; these check that
 * the composed one holds what they render, and only what belongs in a
 * capture.
 */

beforeEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

/** A host element with an open shadow root holding `shadow`. */
function host(tag: string, shadow: string, light = ""): HTMLElement {
  const element = document.createElement(tag);
  element.innerHTML = light;
  element.attachShadow({ mode: "open" }).innerHTML = shadow;
  document.body.append(element);
  return element;
}

function composedBody(): HTMLElement {
  return cloneComposedDocument(document).body;
}

describe("cloneComposedDocument", () => {
  it("fills a host with what its shadow root renders", () => {
    host("code-example", "<pre><code>let a;</code></pre>");

    expect(composedBody().querySelector("code-example pre")?.textContent).toBe(
      "let a;",
    );
  });

  it("puts light children where their slots are", () => {
    host(
      "fancy-card",
      '<h2><slot name="title"></slot></h2><div><slot></slot></div>',
      '<span slot="title">Title</span><p>Body</p>',
    );

    const card = composedBody().querySelector("fancy-card")!;

    expect(card.querySelector("h2")?.textContent).toBe("Title");
    expect(card.querySelector("div > p")?.textContent).toBe("Body");
    expect(card.querySelector("slot")).toBeNull();
  });

  it("uses a slot's fallback when nothing is assigned to it", () => {
    host("empty-card", "<slot><p>Fallback</p></slot>");

    expect(composedBody().querySelector("empty-card p")?.textContent).toBe(
      "Fallback",
    );
  });

  it("composes shadow roots inside shadow roots", () => {
    const outer = host("outer-host", "<inner-host></inner-host>");
    outer
      .shadowRoot!.querySelector("inner-host")!
      .attachShadow({ mode: "open" }).innerHTML = "<p>Deep</p>";

    expect(
      composedBody().querySelector("outer-host inner-host p")?.textContent,
    ).toBe("Deep");
  });

  it("leaves hidden and fixed hosts with their light DOM only", () => {
    host("hidden-host", "<p>Shadow</p>", "<p>Light</p>").style.display = "none";
    host("banner-host", "<p>Accept cookies</p>").style.position = "fixed";

    const body = composedBody();

    expect(body.querySelector("hidden-host")?.textContent).toBe("Light");
    expect(body.querySelector("banner-host")?.textContent).toBe("");
  });

  it("reads closed roots through the reader it is given", () => {
    const element = document.createElement("closed-host");
    const root = element.attachShadow({ mode: "closed" });
    root.innerHTML = "<p>Closed</p>";
    document.body.append(element);

    const clone = cloneComposedDocument(document, (el) =>
      el === element ? root : el.shadowRoot,
    );

    expect(clone.querySelector("closed-host p")?.textContent).toBe("Closed");
  });

  it("changes nothing about a page without shadow DOM, or the live page", () => {
    document.body.innerHTML = "<article><p>Plain</p></article>";
    host("code-example", "<pre>x</pre>", "light");
    const before = document.body.innerHTML;

    const clone = cloneComposedDocument(document);

    expect(document.body.innerHTML).toBe(before);
    expect(document.querySelector("code-example")!.shadowRoot!.innerHTML).toBe(
      "<pre>x</pre>",
    );
    expect(clone.querySelector("article")?.outerHTML).toBe(
      "<article><p>Plain</p></article>",
    );
  });

  it("brings a web component's code block through to the captured content", () => {
    // MDN: each example is a <mdn-code-example> rendering its <pre> in shadow
    // DOM, which a plain clone left empty.
    document.body.innerHTML =
      "<main><article><h1>function</h1>" +
      `<p>${"The function declaration creates a binding, with a name. ".repeat(4)}</p>` +
      '<mdn-code-example class="brush: js notranslate"></mdn-code-example>' +
      "</article></main>";
    document
      .querySelector("mdn-code-example")!
      .attachShadow({ mode: "open" }).innerHTML =
      '<div class="code-example"><pre class="brush: js notranslate"><code>' +
      '<span class="token keyword">function</span> name() {}</code></pre></div>';

    const plain = parseDocument(document.cloneNode(true) as Document);
    const composed = parseDocument(cloneComposedDocument(document));

    expect(plain.content).not.toContain("<pre");
    expect(composed.content).toContain(
      '<pre><code data-language="js">function name() {}</code></pre>',
    );
  });
});
