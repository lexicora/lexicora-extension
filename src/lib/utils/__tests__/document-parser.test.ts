// @vitest-environment jsdom
//* jsdom, not the project's happy-dom: DOMPurify reads tag names through
//* `Node.prototype.nodeName`, which happy-dom leaves blank, and happy-dom's
//* node iterator stops after the first unwrapped element. Under happy-dom the
//* sanitizer returns content half-sanitized, so content tests would lie.
import { describe, it, expect } from "vitest";
import { BlockNoteEditor } from "@blocknote/core";

import { appBlockNoteConfig } from "@/components/editor/config";
import {
  extractPageMetadata,
  getSelectionAsElement,
  parseDocument,
  parseSnippet,
} from "../document-parser";

/**
 * Covers `extractPageMetadata`, the metadata reader shared by the full,
 * selection and bookmark captures, and the content the full and selection
 * parsers hand to the editor.
 *
 * The property that matters most is that `excerpt` comes only from the page's
 * description meta tags — a bookmark capture relies on it to carry no content.
 */

function makeDoc(head: string, body = "", url = "https://example.com/articles/one") {
  const doc = document.implementation.createHTMLDocument("");
  doc.documentElement.innerHTML = `<head><base href="${url}">${head}</head><body>${body}</body>`;
  return doc;
}

function parseBody(body: string) {
  return parseDocument(makeDoc("", body));
}

// The app's schema extends BlockNote's default one, which the generic options
// type does not follow; the editor itself behaves the same either way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = BlockNoteEditor<any, any, any>;

/** What the side panel does with a capture: the editor reads its HTML. */
function toBlocks(html: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editor: AnyEditor = BlockNoteEditor.create(appBlockNoteConfig as any);
  return editor.tryParseHTMLToBlocks(html);
}

type InlineText = { text?: string; styles?: Record<string, unknown> };

function textOf(block: { content?: unknown }): string {
  return (block.content as InlineText[])
    .map((inline) => inline.text ?? "")
    .join("");
}

/** Prose long enough, and with enough commas, to score as article text. */
function paragraph(label: string): string {
  return `<p>${label}: ${"A sentence, with a clause, and another one. ".repeat(4)}</p>`;
}


describe("extractPageMetadata", () => {
  it("reads title, description, site name, author and published date", () => {
    const doc = makeDoc(`
      <title>An Article</title>
      <meta name="description" content="A short description.">
      <meta property="og:site_name" content="Example">
      <meta name="author" content="Ada Lovelace">
      <meta property="article:published_time" content="2026-01-02T03:04:05Z">
    `);

    expect(extractPageMetadata(doc)).toMatchObject({
      title: "An Article",
      excerpt: "A short description.",
      siteName: "Example",
      byline: "Ada Lovelace",
      publishedTime: "2026-01-02T03:04:05Z",
    });
  });

  it("falls back to og:description when there is no description tag", () => {
    const doc = makeDoc(
      `<meta property="og:description" content="From Open Graph.">`,
    );

    expect(extractPageMetadata(doc).excerpt).toBe("From Open Graph.");
  });

  it("never derives the description from the page's content", () => {
    const doc = makeDoc(
      `<title>No description</title>`,
      `<article><p>The first paragraph of the article body.</p></article>`,
    );

    expect(extractPageMetadata(doc).excerpt).toBeNull();
  });

  it("resolves a relative favicon against the page URL", () => {
    const doc = makeDoc(`<link rel="icon" href="/static/icon.png">`);

    expect(extractPageMetadata(doc).faviconUrl).toBe(
      "https://example.com/static/icon.png",
    );
  });

  it("falls back to /favicon.ico when the page declares none", () => {
    const doc = makeDoc(`<title>Plain</title>`);

    expect(extractPageMetadata(doc).faviconUrl).toBe(
      "https://example.com/favicon.ico",
    );
  });

  it("does not modify the document it reads", () => {
    const doc = makeDoc(
      `<title>Untouched</title>`,
      `<nav>Menu</nav><article><p>Body</p><img src="a.png"></article>`,
    );
    const before = doc.documentElement.outerHTML;

    extractPageMetadata(doc);

    // Safe to run on the live page, which is what lets a bookmark skip the clone.
    expect(doc.documentElement.outerHTML).toBe(before);
  });
});

describe("parseDocument", () => {
  it("reports the same metadata as extractPageMetadata", () => {
    // parseDocument prunes and rewrites the document after reading metadata,
    // so reading it first is what keeps the two in agreement.
    const head = `
      <title>Same</title>
      <meta name="description" content="Described.">
      <meta property="og:site_name" content="Site">
    `;
    const body = `<article><h1>Heading</h1><p>${"Body text. ".repeat(40)}</p></article>`;

    const expected = extractPageMetadata(makeDoc(head, body));
    const parsed = parseDocument(makeDoc(head, body));

    expect(parsed).toMatchObject(expected);
  });
});

describe("parseDocument alerts", () => {
  it("turns a GitHub alert into an Alert block", async () => {
    const { content } = parseBody(
      '<article class="markdown-body"><p>Intro.</p>' +
        '<div class="markdown-alert markdown-alert-warning" dir="auto">' +
        '<p class="markdown-alert-title" dir="auto"><svg class="octicon"><path d=""></path></svg>Warning</p>' +
        '<p dir="auto">Line one<br>Line two</p></div></article>',
    );

    const blocks = await toBlocks(content);

    expect(blocks.map((block) => block.type)).toEqual(["paragraph", "alert"]);
    expect(blocks[1]!.props.type).toBe("warning");
    expect(textOf(blocks[1]!)).toBe("Line one\nLine two");
  });

  it("keeps a callout the pruning would drop as an aside", async () => {
    // Starlight renders callouts as <aside>, which is page furniture elsewhere.
    const { content } = parseBody(
      "<article><p>Intro.</p>" +
        '<aside aria-label="Caution" class="starlight-aside starlight-aside--caution">' +
        '<p class="starlight-aside__title" aria-hidden="true"><svg></svg>Caution</p>' +
        '<div class="starlight-aside__content"><p>Back up first.</p></div>' +
        "</aside></article>",
    );

    const blocks = await toBlocks(content);

    expect(blocks[1]!.type).toBe("alert");
    // Starlight's caution is the yellow one: GitHub calls that a warning.
    expect(blocks[1]!.props.type).toBe("warning");
    expect(textOf(blocks[1]!)).toBe("Back up first.");
  });

  it("leads the message with a custom title, in bold", async () => {
    const { content } = parseBody(
      '<article><div class="admonition tip">' +
        '<p class="admonition-title">Shortcut</p><p>Press Tab.</p>' +
        "</div></article>",
    );

    const [alert] = await toBlocks(content);

    expect(alert!.props.type).toBe("tip");
    expect(textOf(alert!)).toBe("Shortcut\nPress Tab.");
    expect((alert!.content as InlineText[])[0]!.styles).toEqual({
      bold: true,
    });
  });
});

describe("parseDocument code blocks", () => {
  it("reads the language GitHub puts on the block's wrapper", async () => {
    const { content } = parseBody(
      '<article><div class="highlight highlight-source-python"><pre>' +
        '<span class="pl-k">def</span> f():\n    pass\n</pre></div></article>',
    );

    const [block] = await toBlocks(content);

    expect(block!.type).toBe("codeBlock");
    expect(block!.props.language).toBe("python");
    expect(textOf(block!)).toBe("def f():\n    pass");
  });

  it("keeps the lines of a highlighter that wraps each line in a block", async () => {
    // Expressive Code (Astro Starlight) leaves no newline between its lines.
    const { content } = parseBody(
      '<article><pre data-language="js"><code>' +
        '<div class="ec-line"><div class="code">const a = 1;</div></div>' +
        '<div class="ec-line"><div class="code">const b = 2;</div></div>' +
        "</code></pre></article>",
    );

    const [block] = await toBlocks(content);

    expect(block!.props.language).toBe("js");
    expect(textOf(block!)).toBe("const a = 1;\nconst b = 2;");
  });

  it("drops the copy button and keeps line breaks written as <br>", async () => {
    // Docusaurus: one span per line, each ending in a <br>.
    const { content } = parseBody(
      '<article><div class="language-ts"><pre class="prism-code language-ts"><code>' +
        '<span class="token-line"><span>let a;</span><br></span>' +
        '<span class="token-line"><span>let b;</span><br></span>' +
        '</code></pre><button aria-label="Copy code">Copy</button></div></article>',
    );

    const blocks = await toBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.props.language).toBe("ts");
    expect(textOf(blocks[0]!)).toBe("let a;\nlet b;");
  });
});

describe("parseDocument text", () => {
  it("drops control labels and screen-reader text", () => {
    const { content } = parseBody(
      "<article><p>Share this<button>Copy link</button> now" +
        '<span class="sr-only"> (opens in a new tab)</span>.</p>' +
        "<select><option>English</option></select></article>",
    );

    expect(content).toBe("<p>Share this now.</p>");
  });

  it("keeps an accordion's question, a button inside a heading", () => {
    const { content } = parseBody(
      '<article><h3><button aria-expanded="false">Can I export?</button></h3>' +
        "<p>Yes, from Settings.</p></article>",
    );

    expect(content).toBe("<h3>Can I export?</h3><p>Yes, from Settings.</p>");
  });

  it("keeps strikethrough and underline", () => {
    const { content } = parseBody(
      "<article><p><s>Old</s> and <u>key</u></p></article>",
    );

    expect(content).toBe("<p><s>Old</s> and <u>key</u></p>");
  });

  it("keeps only the attributes the editor reads", () => {
    const { content } = parseBody(
      '<article><p class="lead" data-reactid="7" style="color: red">Hi</p></article>',
    );

    expect(content).toBe("<p>Hi</p>");
  });
});

describe("parseDocument images and links", () => {
  it("picks a sharp srcset image without splitting URLs at their commas", () => {
    const { content } = parseBody(
      '<article><img src="data:image/gif;base64,R0lGOD" srcset="' +
        "https://res.cloudinary.com/demo/w_400,c_fill/cat.jpg 400w, " +
        "https://res.cloudinary.com/demo/w_1200,c_fill/cat.jpg 1200w, " +
        'https://res.cloudinary.com/demo/w_2400,c_fill/cat.jpg 2400w"></article>',
    );

    expect(content).toBe(
      '<img src="https://res.cloudinary.com/demo/w_1200,c_fill/cat.jpg">',
    );
  });

  it("reads density srcsets, including a candidate with no descriptor", () => {
    const { content } = parseBody(
      '<article><img srcset="/img/a.jpg, /img/b.jpg 2x, /img/c.jpg 3x"></article>',
    );

    expect(content).toBe('<img src="https://example.com/img/b.jpg">');
  });

  it("resolves lazy-loaded images and links against the page", () => {
    const { content } = parseBody(
      '<article><p>See <a href="../two">the next one</a>.</p>' +
        '<img src="/placeholder.gif" data-src="images/cat.png"></article>',
    );

    expect(content).toBe(
      '<p>See <a href="https://example.com/two">the next one</a>.</p>' +
        '<img src="https://example.com/articles/images/cat.png">',
    );
  });

  it("moves a <noscript> image onto its lazy placeholder", () => {
    const { content } = parseBody(
      '<article><img src="data:image/gif;base64,R0lGOD">' +
        '<noscript><img src="/real.jpg"></noscript></article>',
    );

    expect(content).toBe('<img src="https://example.com/real.jpg">');
  });
});

describe("parseDocument without a semantic container", () => {
  it("takes the element holding the prose, not the layout around it", () => {
    const { textContent } = parseBody(
      '<div id="page"><div id="wrap">' +
        '<div id="teaser"><p>A teaser line long enough to count as text.</p></div>' +
        `<div id="story">${paragraph("One")}${paragraph("Two")}${paragraph("Three")}</div>` +
        "</div></div>",
    );

    expect(textContent).toContain("One:");
    expect(textContent).toContain("Three:");
    expect(textContent).not.toContain("teaser");
  });

  it("keeps every section of an article split into sections", () => {
    const { textContent } = parseBody(
      '<div id="wrap"><div id="story">' +
        `<section>${paragraph("One")}${paragraph("Two")}${paragraph("Three")}</section>` +
        `<section>${paragraph("Four")}${paragraph("Five")}</section>` +
        "</div></div>",
    );

    expect(textContent).toContain("One:");
    expect(textContent).toContain("Five:");
  });
});

describe("parseSnippet", () => {
  function makeSnippet(html: string) {
    // As `getSelectionAsElement` hands it over: in a document of its own.
    const snippet = document.implementation
      .createHTMLDocument("")
      .createElement("div");
    snippet.innerHTML = html;
    return snippet;
  }

  it("resolves URLs against the page and drops screen-reader text", () => {
    const { content } = parseSnippet(
      makeSnippet(
        '<p>Read <a href="/docs">the docs</a>' +
          '<span class="sr-only"> (opens in a new tab)</span></p><img src="cat.png">',
      ),
      makeDoc(""),
    );

    expect(content).toBe(
      '<p>Read <a href="https://example.com/docs">the docs</a></p>' +
        '<img src="https://example.com/articles/cat.png">',
    );
  });

  it("turns a selected callout into an alert", async () => {
    const { content } = parseSnippet(
      makeSnippet(
        '<div class="notecard note"><p><strong>Note:</strong> Mind the cache.</p></div>',
      ),
      makeDoc(""),
    );

    const [alert] = await toBlocks(content);

    expect(alert!.type).toBe("alert");
    expect(alert!.props.type).toBe("note");
    expect(textOf(alert!)).toBe("Mind the cache.");
  });

  it("reports the page's metadata", () => {
    const doc = makeDoc("<title>The page</title>");

    expect(parseSnippet(makeSnippet("<p>Bit</p>"), doc).title).toBe(
      "The page",
    );
  });
});

describe("getSelectionAsElement", () => {
  function select(html: string) {
    document.body.innerHTML = `<p id="target">${html}</p>`;
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("target")!);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection;
  }

  it("copies the selection out of the page", () => {
    select('Hello <img src="cat.png">');

    const element = getSelectionAsElement();

    expect(element?.innerHTML).toBe('Hello <img src="cat.png">');
    // Images in an element of the page itself load when their src is rewritten.
    expect(element?.ownerDocument).not.toBe(document);
  });

  it("returns null when nothing is selected", () => {
    select("Hello").collapseToStart();

    expect(getSelectionAsElement()).toBeNull();
  });
});
