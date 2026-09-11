import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";
import { formatDate } from "@/lib/utils/date-formatter";

/**
 * Pure builders for everything Lexicora exports: Markdown files, clipboard
 * Markdown and HTML, and file names. No DOM, database or editor access here —
 * callers convert blocks first and pass the result in — so all of it is
 * unit-testable.
 *
 * Two formats, on purpose:
 * - **Files** carry metadata as YAML front matter, which Obsidian and similar
 *   tools read as note properties and can query.
 * - **Clipboard** copies carry a readable header instead, because front matter
 *   pasted into the middle of an existing note just shows up as raw text.
 */

// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------

/** A YAML double-quoted scalar. Quoting everything sidesteps YAML's implicit typing (`no`, `1.0`, `null`, `: `). */
function yamlString(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n")
    .replace(/\t/g, "\\t");
  return `"${escaped}"`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Keeps brackets in a title from closing a Markdown link early. */
function escapeLinkText(value: string): string {
  return value.replace(/([\\[\]])/g, "\\$1");
}

/**
 * Only http(s) URLs become links. Entry URLs are user-editable, and a
 * `javascript:` URL would pass the form's URL validation — pasting it as a live
 * link into another app is not something an export should do.
 */
export function isSafeHref(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** A Markdown link destination, bracketed when it contains characters that would end it early. */
function markdownDestination(url: string): string {
  return /[\s()<>]/.test(url) ? `<${url.replace(/[<>]/g, encodeURIComponent)}>` : url;
}

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

type FrontMatterValue = string | string[] | boolean | null | undefined;

/**
 * Tags as Obsidian reads them. A tag cannot contain spaces there, so a
 * Lexicora tag like "web dev" would be silently broken — spaces become hyphens.
 * A leading `#` is dropped since the property adds it.
 */
export function toFrontMatterTag(tag: string): string {
  return tag.trim().replace(/^#+/, "").replace(/\s+/g, "-");
}

/** Local date-time without milliseconds or zone, the shape Obsidian recognises as a date-time property. */
export function toFrontMatterDate(iso: string): string | null {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/**
 * Serialises ordered key/value pairs as a front matter block. Empty values are
 * omitted rather than written blank, and booleans only when true, so a note
 * never carries properties that say nothing.
 */
export function buildFrontMatter(
  fields: Array<[key: string, value: FrontMatterValue]>,
  { rawKeys = [] }: { rawKeys?: string[] } = {},
): string {
  const lines: string[] = [];

  for (const [key, value] of fields) {
    if (value === null || value === undefined || value === false) continue;
    if (value === true) {
      lines.push(`${key}: true`);
    } else if (Array.isArray(value)) {
      const items = value.filter((v) => v.trim() !== "");
      if (items.length === 0) continue;
      lines.push(`${key}:`, ...items.map((v) => `  - ${yamlString(v)}`));
    } else if (value.trim() !== "") {
      // Dates stay unquoted, the way Obsidian writes its own date properties.
      // Whether a parser types them as dates is up to its schema: YAML 1.1
      // parsers do, YAML 1.2 core-schema parsers read a string.
      lines.push(`${key}: ${rawKeys.includes(key) ? value : yamlString(value)}`);
    }
  }

  return ["---", ...lines, "---"].join("\n");
}

// ---------------------------------------------------------------------------
// File names
// ---------------------------------------------------------------------------

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

/**
 * A title made safe as a file name on Windows, macOS and Linux, and inside an
 * Obsidian vault — where `#`, `^`, `[`, `]` and `|` break links to the note.
 */
export function toSafeFilename(name: string, fallback = "Untitled"): string {
  let cleaned = name
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "") // leading dots hide the file
    .slice(0, 100)
    .replace(/[. ]+$/, ""); // Windows drops trailing dots and spaces

  if (WINDOWS_RESERVED.test(cleaned)) cleaned = `${cleaned}_`;
  return cleaned || fallback;
}

/**
 * Reserves a unique `name.ext` within `used`, appending " (2)", " (3)"… on a
 * clash. Compared case-insensitively, because the default file systems on
 * Windows and macOS are.
 */
export function reserveFilename(
  name: string,
  extension: string,
  used: Set<string>,
): string {
  const base = toSafeFilename(name);
  let candidate = `${base}.${extension}`;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) {
    candidate = `${base} (${n}).${extension}`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/** A relative link to a sibling file, encoded so spaces and parentheses survive. */
function fileLink(filename: string): string {
  return encodeURIComponent(filename).replace(/\(/g, "%28").replace(/\)/g, "%29");
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export interface EntryExport {
  entry: EntryDocType;
  topicName: string | null;
  /** Entry content already converted from blocks; empty for a bookmark. */
  contentMarkdown: string;
}

/** An entry as a standalone `.md` note: front matter, title, then content. */
export function entryToMarkdownFile({
  entry,
  topicName,
  contentMarkdown,
}: EntryExport): string {
  const frontMatter = buildFrontMatter(
    [
      ["title", entry.title],
      ["source", entry.url],
      ["site", entry.siteName],
      ["topic", topicName],
      ["description", entry.description],
      ["tags", (entry.tags ?? []).map(toFrontMatterTag)],
      ["language", entry.languageCode],
      ["created", toFrontMatterDate(entry.createdAt)],
      ["updated", toFrontMatterDate(entry.updatedAt)],
      ["archived", entry.isArchived],
    ],
    { rawKeys: ["created", "updated"] },
  );

  const body = [`# ${entry.title}`];
  const content = contentMarkdown.trim();
  if (content) {
    body.push(content);
  } else if (entry.description?.trim()) {
    // A bookmark has no content, and its description is otherwise only in the
    // properties — repeat it so the note does not read as empty.
    body.push(entry.description.trim());
  }

  return `${frontMatter}\n\n${body.join("\n\n")}\n`;
}

/**
 * An entry for the clipboard as Markdown: a readable header, then content.
 * With `contentOnly`, just the content.
 */
export function entryToClipboardMarkdown(
  { entry, topicName, contentMarkdown }: EntryExport,
  { contentOnly = false }: { contentOnly?: boolean } = {},
): string {
  const content = contentMarkdown.trim();
  if (contentOnly) return content;

  const lines: string[] = ["**Entry**", "", `# ${entry.title}`, ""];
  if (topicName) lines.push(`**Topic:** ${topicName}`, "");
  if (entry.url) {
    const label = escapeLinkText(entry.siteName || entry.hostnameUrl || entry.url);
    lines.push(
      isSafeHref(entry.url)
        ? `**Source:** [${label}](${markdownDestination(entry.url)})`
        : `**Source:** ${entry.url}`,
      "",
    );
  } else if (entry.siteName) {
    lines.push(`**Source:** ${entry.siteName}`, "");
  }
  if (entry.description) lines.push(entry.description, "");
  if (entry.tags?.length) lines.push(`**Tags:** ${entry.tags.join(", ")}`, "");
  lines.push(
    `**Created:** ${formatDate(entry.createdAt)} | **Updated:** ${formatDate(entry.updatedAt)}`,
  );
  if (content) lines.push("", "---", "", content);

  return lines.join("\n");
}

/** The HTML twin of {@link entryToClipboardMarkdown}, for apps that paste formatting. */
export function entryToClipboardHtml(
  {
    entry,
    topicName,
    contentHtml,
  }: Omit<EntryExport, "contentMarkdown"> & { contentHtml: string },
  { contentOnly = false }: { contentOnly?: boolean } = {},
): string {
  if (contentOnly) return contentHtml;

  const parts: string[] = [`<h1>${escapeHtml(entry.title)}</h1>`];
  if (topicName) {
    parts.push(`<p><strong>Topic:</strong> ${escapeHtml(topicName)}</p>`);
  }
  if (entry.url) {
    const label = escapeHtml(entry.siteName || entry.hostnameUrl || entry.url);
    parts.push(
      isSafeHref(entry.url)
        ? `<p><strong>Source:</strong> <a href="${escapeHtml(entry.url)}">${label}</a></p>`
        : `<p><strong>Source:</strong> ${escapeHtml(entry.url)}</p>`,
    );
  } else if (entry.siteName) {
    parts.push(`<p><strong>Source:</strong> ${escapeHtml(entry.siteName)}</p>`);
  }
  if (entry.description) parts.push(`<p>${escapeHtml(entry.description)}</p>`);
  if (entry.tags?.length) {
    parts.push(`<p><strong>Tags:</strong> ${escapeHtml(entry.tags.join(", "))}</p>`);
  }
  parts.push(
    `<p><strong>Created:</strong> ${escapeHtml(formatDate(entry.createdAt))} | ` +
      `<strong>Updated:</strong> ${escapeHtml(formatDate(entry.updatedAt))}</p>`,
  );
  if (contentHtml.trim()) parts.push("<hr>", contentHtml);

  return parts.join("");
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

/**
 * A topic as the index note of its export folder: front matter, description,
 * and a link to each entry's note. `entryFiles` pairs each entry with the file
 * name it was written under, so the links resolve inside the archive.
 */
export function topicToMarkdownFile(
  topic: TopicDocType,
  entryFiles: Array<{ entry: EntryDocType; filename: string }>,
): string {
  const frontMatter = buildFrontMatter(
    [
      ["title", topic.name],
      ["description", topic.description],
      ["tags", (topic.tags ?? []).map(toFrontMatterTag)],
      ["created", toFrontMatterDate(topic.createdAt)],
      ["updated", toFrontMatterDate(topic.updatedAt)],
      ["archived", topic.isArchived],
    ],
    { rawKeys: ["created", "updated"] },
  );

  const body = [`# ${topic.name}`];
  if (topic.description?.trim()) body.push(topic.description.trim());
  if (entryFiles.length > 0) {
    body.push(
      "## Entries",
      entryFiles
        .map(
          ({ entry, filename }) =>
            `- [${escapeLinkText(entry.title)}](${fileLink(filename)})`,
        )
        .join("\n"),
    );
  }

  return `${frontMatter}\n\n${body.join("\n\n")}\n`;
}

/** A topic for the clipboard: readable header, then its entries linked to their sources. */
export function topicToClipboardMarkdown(
  topic: TopicDocType,
  entries: EntryDocType[],
): string {
  const lines: string[] = ["**Topic**", "", `# ${topic.name}`, ""];
  if (topic.description) lines.push(topic.description, "");
  if (topic.tags?.length) lines.push(`**Tags:** ${topic.tags.join(", ")}`, "");
  lines.push(
    `**Entries:** ${entries.length} | **Created:** ${formatDate(topic.createdAt)} | **Updated:** ${formatDate(topic.updatedAt)}`,
  );

  if (entries.length > 0) {
    lines.push("", "## Entries", "");
    for (const entry of entries) {
      const title = escapeLinkText(entry.title);
      lines.push(
        entry.url && isSafeHref(entry.url)
          ? `- [${title}](${markdownDestination(entry.url)})`
          : `- ${title}`,
      );
    }
  }

  return lines.join("\n");
}

/** The HTML twin of {@link topicToClipboardMarkdown}. */
export function topicToClipboardHtml(
  topic: TopicDocType,
  entries: EntryDocType[],
): string {
  const parts: string[] = [`<h1>${escapeHtml(topic.name)}</h1>`];
  if (topic.description) parts.push(`<p>${escapeHtml(topic.description)}</p>`);
  if (topic.tags?.length) {
    parts.push(`<p><strong>Tags:</strong> ${escapeHtml(topic.tags.join(", "))}</p>`);
  }
  parts.push(
    `<p><strong>Entries:</strong> ${entries.length} | ` +
      `<strong>Created:</strong> ${escapeHtml(formatDate(topic.createdAt))} | ` +
      `<strong>Updated:</strong> ${escapeHtml(formatDate(topic.updatedAt))}</p>`,
  );

  if (entries.length > 0) {
    const items = entries.map((entry) => {
      const title = escapeHtml(entry.title);
      return entry.url && isSafeHref(entry.url)
        ? `<li><a href="${escapeHtml(entry.url)}">${title}</a></li>`
        : `<li>${title}</li>`;
    });
    parts.push("<h2>Entries</h2>", `<ul>${items.join("")}</ul>`);
  }

  return parts.join("");
}
