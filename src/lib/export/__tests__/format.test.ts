import { describe, it, expect } from "vitest";
import { load } from "js-yaml";

import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";
import {
  buildFrontMatter,
  entryToClipboardHtml,
  entryToClipboardMarkdown,
  entryToMarkdownFile,
  isSafeHref,
  reserveFilename,
  toFrontMatterTag,
  toSafeFilename,
  topicToClipboardMarkdown,
  topicToMarkdownFile,
} from "../format";

/**
 * Covers the export formats. Front matter is parsed back with a real YAML
 * parser: Obsidian ignores a note's properties entirely when they don't parse,
 * so "looks right" is not enough.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function makeEntry(overrides: Partial<EntryDocType> = {}): EntryDocType {
  return {
    id: "e1",
    userId: NIL_UUID,
    topicId: "t1",
    title: "How RxDB works",
    description: "A description.",
    tags: ["database", "offline first"],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    archivedExplicitly: false,
    languageCode: "en",
    url: "https://rxdb.info/how-it-works.html",
    hostnameUrl: "rxdb.info",
    pathnameUrl: "/how-it-works.html",
    searchUrl: "",
    siteName: "RxDB",
    faviconUrl: "",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-02T11:30:00.000Z",
    ...overrides,
  } as EntryDocType;
}

function makeTopic(overrides: Partial<TopicDocType> = {}): TopicDocType {
  return {
    id: "t1",
    userId: NIL_UUID,
    name: "Research",
    description: "Things I am reading.",
    tags: ["reading"],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-09-02T11:30:00.000Z",
    ...overrides,
  } as TopicDocType;
}

/** Splits a note into its parsed front matter and the body after it. */
function parseNote(note: string): { props: Record<string, unknown>; body: string } {
  const match = note.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (!match) throw new Error(`Not a front matter note:\n${note}`);
  return { props: load(match[1]!) as Record<string, unknown>, body: match[2]! };
}

describe("buildFrontMatter", () => {
  it("survives values YAML would otherwise misread", () => {
    const tricky = 'He said "no": yes\nsecond line \\ # not a comment';
    const fm = buildFrontMatter([
      ["title", tricky],
      ["plain", "no"],
      ["number", "1.0"],
    ]);

    const props = load(fm.replace(/^---\n|\n---$/g, "")) as Record<string, unknown>;

    expect(props.title).toBe(tricky);
    expect(props.plain).toBe("no"); // not the boolean false
    expect(props.number).toBe("1.0"); // not the number 1
  });

  it("omits empty values and false booleans", () => {
    const fm = buildFrontMatter([
      ["title", "Kept"],
      ["empty", ""],
      ["blank", "   "],
      ["none", null],
      ["tags", []],
      ["archived", false],
    ]);

    expect(fm).toBe('---\ntitle: "Kept"\n---');
  });
});

describe("toFrontMatterTag", () => {
  it("replaces spaces, which Obsidian tags cannot contain", () => {
    expect(toFrontMatterTag("offline first")).toBe("offline-first");
    expect(toFrontMatterTag("  #web  dev ")).toBe("web-dev");
  });
});

describe("toSafeFilename", () => {
  it("removes characters that break file systems or vault links", () => {
    expect(toSafeFilename('What is "RxDB"? A/B test: #1 [draft] | ^x')).toBe(
      "What is RxDB A B test 1 draft x",
    );
  });

  it("strips leading dots and trailing dots and spaces", () => {
    expect(toSafeFilename("..hidden. . ")).toBe("hidden");
  });

  it("avoids Windows reserved device names", () => {
    expect(toSafeFilename("con")).toBe("con_");
    expect(toSafeFilename("LPT1")).toBe("LPT1_");
  });

  it("falls back when nothing usable is left", () => {
    expect(toSafeFilename("???")).toBe("Untitled");
  });

  it("caps very long titles", () => {
    expect(toSafeFilename("a".repeat(300)).length).toBe(100);
  });
});

describe("reserveFilename", () => {
  it("numbers clashes, case-insensitively", () => {
    const used = new Set<string>();

    expect(reserveFilename("Notes", "md", used)).toBe("Notes.md");
    expect(reserveFilename("notes", "md", used)).toBe("notes (2).md");
    expect(reserveFilename("NOTES", "md", used)).toBe("NOTES (3).md");
  });
});

describe("isSafeHref", () => {
  it("allows only http and https", () => {
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<b>x</b>")).toBe(false);
    expect(isSafeHref("not a url")).toBe(false);
  });
});

describe("entryToMarkdownFile", () => {
  it("writes metadata as parseable front matter", () => {
    const note = entryToMarkdownFile({
      entry: makeEntry(),
      topicName: "Research",
      contentMarkdown: "## Content",
    });
    const { props } = parseNote(note);

    expect(props).toMatchObject({
      title: "How RxDB works",
      source: "https://rxdb.info/how-it-works.html",
      site: "RxDB",
      topic: "Research",
      description: "A description.",
      tags: ["database", "offline-first"],
      language: "en",
    });
    // Unquoted local date-time, the shape Obsidian writes for date properties.
    expect(note).toMatch(/^created: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/m);
    expect(note).toMatch(/^updated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/m);
    expect(props.archived).toBeUndefined();
  });

  it("puts the title and content in the body", () => {
    const { body } = parseNote(
      entryToMarkdownFile({
        entry: makeEntry(),
        topicName: null,
        contentMarkdown: "## Content\n\nText.\n",
      }),
    );

    expect(body).toBe("# How RxDB works\n\n## Content\n\nText.\n");
  });

  it("repeats the description in the body when there is no content", () => {
    // A bookmark would otherwise be a note with nothing but a heading.
    const { body } = parseNote(
      entryToMarkdownFile({
        entry: makeEntry(),
        topicName: null,
        contentMarkdown: "",
      }),
    );

    expect(body).toBe("# How RxDB works\n\nA description.\n");
  });

  it("marks archived entries", () => {
    const { props } = parseNote(
      entryToMarkdownFile({
        entry: makeEntry({ isArchived: true }),
        topicName: null,
        contentMarkdown: "",
      }),
    );

    expect(props.archived).toBe(true);
  });
});

describe("entryToClipboardMarkdown", () => {
  it("uses a readable header, not front matter", () => {
    const md = entryToClipboardMarkdown({
      entry: makeEntry(),
      topicName: "Research",
      contentMarkdown: "Body",
    });

    expect(md.startsWith("---")).toBe(false);
    expect(md).toContain("# How RxDB works");
    expect(md).toContain("**Source:** [RxDB](https://rxdb.info/how-it-works.html)");
    expect(md).toContain("**Topic:** Research");
    expect(md.endsWith("---\n\nBody")).toBe(true);
  });

  it("copies only the content when asked", () => {
    const md = entryToClipboardMarkdown(
      { entry: makeEntry(), topicName: "Research", contentMarkdown: "\nBody\n" },
      { contentOnly: true },
    );

    expect(md).toBe("Body");
  });

  it("does not turn an unsafe URL into a link", () => {
    const md = entryToClipboardMarkdown({
      entry: makeEntry({ url: "javascript:alert(1)" }),
      topicName: null,
      contentMarkdown: "",
    });

    expect(md).toContain("**Source:** javascript:alert(1)");
    expect(md).not.toContain("](javascript:");
  });
});

describe("entryToClipboardHtml", () => {
  it("escapes user text", () => {
    const html = entryToClipboardHtml({
      entry: makeEntry({
        title: "<script>alert(1)</script>",
        description: 'a & b "c"',
      }),
      topicName: null,
      contentHtml: "",
    });

    expect(html).toContain("<h1>&lt;script&gt;alert(1)&lt;/script&gt;</h1>");
    expect(html).toContain("<p>a &amp; b &quot;c&quot;</p>");
    expect(html).not.toContain("<script>");
  });

  it("links only safe URLs", () => {
    const safe = entryToClipboardHtml({
      entry: makeEntry(),
      topicName: null,
      contentHtml: "",
    });
    const unsafe = entryToClipboardHtml({
      entry: makeEntry({ url: "javascript:alert(1)" }),
      topicName: null,
      contentHtml: "",
    });

    expect(safe).toContain('<a href="https://rxdb.info/how-it-works.html">RxDB</a>');
    expect(unsafe).not.toContain("<a ");
  });

  it("appends the content after a rule", () => {
    const html = entryToClipboardHtml({
      entry: makeEntry(),
      topicName: null,
      contentHtml: "<p>Body</p>",
    });

    expect(html.endsWith("<hr><p>Body</p>")).toBe(true);
  });
});

describe("topicToMarkdownFile", () => {
  it("links each entry by its file name, encoded", () => {
    const note = topicToMarkdownFile(makeTopic(), [
      { entry: makeEntry({ title: "Dexie (vs) idb" }), filename: "Dexie (vs) idb.md" },
    ]);

    expect(note).toContain("- [Dexie (vs) idb](Dexie%20%28vs%29%20idb.md)");
  });

  it("writes parseable front matter and omits the entry list when empty", () => {
    const { props, body } = parseNote(topicToMarkdownFile(makeTopic(), []));

    expect(props).toMatchObject({
      title: "Research",
      description: "Things I am reading.",
      tags: ["reading"],
    });
    expect(body).toBe("# Research\n\nThings I am reading.\n");
  });
});

describe("topicToClipboardMarkdown", () => {
  it("lists entries linked to their sources", () => {
    const md = topicToClipboardMarkdown(makeTopic(), [
      makeEntry(),
      makeEntry({ id: "e2", title: "No link [yet]", url: "" }),
    ]);

    expect(md).toContain("**Entries:** 2");
    expect(md).toContain("- [How RxDB works](https://rxdb.info/how-it-works.html)");
    expect(md).toContain("- No link \\[yet\\]");
  });
});
