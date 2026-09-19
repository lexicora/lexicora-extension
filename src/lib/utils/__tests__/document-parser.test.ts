// @vitest-environment jsdom
//* jsdom, not the project's happy-dom: DOMPurify reads tag names through
//* `Node.prototype.nodeName`, which happy-dom leaves blank, and happy-dom's
//* node iterator stops after the first unwrapped element. Under happy-dom the
//* sanitizer returns content half-sanitized, so content tests would lie.
import { describe, it, expect } from "vitest";
import { BlockNoteEditor } from "@blocknote/core";

import { appBlockNoteConfig } from "@/components/editor/config";
import {
  cleanSnippetHTML,
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

describe("parseDocument images in text", () => {
  it("moves pictures out of a paragraph, which the editor cannot hold", async () => {
    // A GitHub README: a bold label, then linked screenshots, in one <p>.
    const { content } = parseBody(
      '<article><p dir="auto"><strong>Home</strong>\n' +
        '<a target="_blank" href="/demo/blob/main/home.png"><img alt="Home" src="/demo/raw/main/home.png" style="max-width: 100%;"></a>\n' +
        '<a target="_blank" href="/demo/blob/main/filter.png"><img alt="Filter" src="/demo/raw/main/filter.png" style="max-width: 100%;"></a></p></article>',
    );

    const blocks = await toBlocks(content);

    expect(blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "image",
      "image",
    ]);
    expect(textOf(blocks[0]!).trim()).toBe("Home");
    expect(blocks[2]!.props.url).toBe("https://example.com/demo/raw/main/filter.png");
  });

  it("keeps the text on both sides of a picture, in order", async () => {
    const { content } = parseBody(
      '<article><p>Before <img src="/photo.jpg" alt="Photo"> after.</p></article>',
    );

    const blocks = await toBlocks(content);

    expect(blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "image",
      "paragraph",
    ]);
    expect(textOf(blocks[0]!)).toBe("Before ");
    expect(textOf(blocks[2]!)).toBe(" after.");
  });

  it("keeps emoji and formulas in the line as text, and drops tiny icons", () => {
    const { content } = parseBody(
      '<article><p>Great <img class="emoji" alt="🎉" src="/party.png"> work: ' +
        '<img alt="x^2" src="/math.svg" style="vertical-align: -0.3ex; width: 2.3ex; height: 2.6ex"> holds' +
        '<img src="/icon.png" width="16" height="16" alt="external link">.</p></article>',
    );

    expect(content).toBe("<p>Great 🎉 work: x^2 holds.</p>");
  });
});

describe("parseDocument link lists", () => {
  it("drops a list of link cards, wherever the links point", () => {
    // react.dev's demo: video cards linking out to YouTube. Where a link
    // points says nothing about whether the list is content.
    const card = (title: string, author: string) =>
      `<li><a href="https://www.youtube.com/watch?v=${title.length}">` +
      `<h3>${title}</h3><p>${author}</p></a></li>`;
    const { content } = parseBody(
      "<article><p>The article.</p><ul>" +
        card("React: The Documentary", "The origin story of React") +
        card("Rethinking Best Practices", "Pete Hunt (2013)") +
        card("Introducing React Native", "Tom Occhino (2015)") +
        "</ul></article>",
    );

    expect(content).toBe("<p>The article.</p>");
  });

  it("keeps code that shares its block with a list of links", () => {
    // react.dev: a code sample beside a live demo of its linked video cards.
    const card = (title: string) =>
      `<li><a href="https://www.youtube.com/watch?v=${title.length}">` +
      `<h3>${title}</h3><p>A talk about React</p></a></li>`;
    const { content } = parseBody(
      "<article><p>The article.</p><div>" +
        '<div><pre class="language-js"><code>const talks = await db.Talks.findAll();</code></pre></div>' +
        `<div><ul>${card("React 18 Keynote")}${card("React without memo")}${card("React Docs Keynote")}</ul></div>` +
        "</div></article>",
    );

    expect(content).toBe(
      '<p>The article.</p><pre><code data-language="js">const talks = await db.Talks.findAll();</code></pre>',
    );
  });

  it("drops a list of links within the site", () => {
    const { content } = parseBody(
      "<article><p>The article.</p><ul>" +
        '<li><a href="/posts/first-related-post">The first related post</a></li>' +
        '<li><a href="/posts/second-related-post">The second related post</a></li>' +
        '<li><a href="/posts/third-related-post">The third related post</a></li>' +
        "</ul></article>",
    );

    expect(content).toBe("<p>The article.</p>");
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

  it("keeps the text controls show, since the user selected it", () => {
    const snippet = makeSnippet(
      "<p>Press <button>Save</button> to keep " +
        '<select><option>all</option><option selected>some</option></select> ' +
        'rows named <input type="text" value="draft"><input type="checkbox">.</p>',
    );

    expect(parseSnippet(snippet, makeDoc("")).content).toBe(
      "<p>Press Save to keep some rows named draft.</p>",
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

describe("cleanSnippetHTML", () => {
  it("cleans a dragged fragment like a selection", () => {
    // As Chrome serializes a drag: a charset tag, inline styles, absolute URLs.
    const { content } = cleanSnippetHTML(
      "<meta charset='utf-8'><p style=\"margin: 0\">Read " +
        '<a href="https://example.com/docs">the docs</a>' +
        '<span class="sr-only"> (opens in a new tab)</span></p>' +
        '<pre class="language-js"><code><span class="k">const</span> a = 1;</code></pre>',
    );

    expect(content).toBe(
      '<p>Read <a href="https://example.com/docs">the docs</a></p>' +
        '<pre><code data-language="js">const a = 1;</code></pre>',
    );
  });

  it("resolves relative URLs against the page when given one", () => {
    const { content } = cleanSnippetHTML(
      '<img src="cat.png">',
      "https://example.com/articles/one",
    );

    expect(content).toBe('<img src="https://example.com/articles/cat.png">');
  });

  it("drops a relative image it cannot resolve without a page", () => {
    expect(cleanSnippetHTML('<p>Hi</p><img src="cat.png">').content).toBe(
      "<p>Hi</p>",
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
