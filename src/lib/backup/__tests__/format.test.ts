import { describe, it, expect } from "vitest";

import type { BlockDocType } from "@/db/schemas/block";
import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";

import {
  BACKUP_FORMAT_VERSION,
  BackupFormatError,
  buildBackup,
  parseBackup,
} from "../format";

/**
 * Covers the backup file: what goes in it, what is refused, and what is
 * quietly dropped on the way back in.
 */

const NIL = "00000000-0000-0000-0000-000000000000";
const T1 = "019a0000-0000-7000-8000-000000000001";
const E1 = "019a0000-0000-7000-8000-000000000101";
const B1 = "019a0000-0000-7000-8000-000000000201";
const NOW = "2026-09-18T10:00:00.000Z";

function topic(overrides: Partial<TopicDocType> = {}): TopicDocType {
  return {
    id: T1,
    userId: NIL,
    name: "Topic",
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function entry(overrides: Partial<EntryDocType> = {}): EntryDocType {
  return {
    id: E1,
    userId: NIL,
    topicId: T1,
    title: "Entry",
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    archivedExplicitly: false,
    languageCode: "en",
    url: "https://example.com/a",
    hostnameUrl: "example.com",
    pathnameUrl: "/a",
    searchUrl: "",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function block(overrides: Partial<BlockDocType> = {}): BlockDocType {
  return {
    id: B1,
    userId: NIL,
    entryId: E1,
    order: 0,
    type: "paragraph",
    propsJson: {},
    contentJson: [{ type: "text", text: "hi", styles: {} }],
    ...overrides,
  };
}

describe("buildBackup", () => {
  it("writes the envelope and all three collections", () => {
    const file = buildBackup(
      { topics: [topic()], entries: [entry()], blocks: [block()] },
      new Date(NOW),
    );

    expect(file.app).toBe("lexicora");
    expect(file.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(file.schemaVersions).toEqual({ topics: 0, entries: 0, blocks: 0 });
    expect(file.exportedAt).toBe(NOW);
    expect(file.topics).toHaveLength(1);
    expect(file.entries).toHaveLength(1);
    expect(file.blocks).toHaveLength(1);
  });

  it("leaves the derived searchBlob out", () => {
    const file = buildBackup({
      topics: [topic({ searchBlob: "topic" })],
      entries: [entry({ searchBlob: "entry" })],
      blocks: [],
    });

    expect(file.topics[0]).not.toHaveProperty("searchBlob");
    expect(file.entries[0]).not.toHaveProperty("searchBlob");
  });

  it("round-trips through parseBackup", () => {
    const file = buildBackup({
      topics: [topic()],
      entries: [entry()],
      blocks: [block()],
    });

    const parsed = parseBackup(JSON.stringify(file));

    expect(parsed.topics).toEqual(file.topics);
    expect(parsed.entries).toEqual(file.entries);
    expect(parsed.blocks).toEqual(file.blocks);
  });
});

describe("parseBackup", () => {
  it("refuses text that is not JSON", () => {
    expect(() => parseBackup("{not json")).toThrow(BackupFormatError);
    expect(() => parseBackup("{not json")).toThrow(/not valid JSON/);
  });

  it("refuses JSON that is not a backup", () => {
    expect(() => parseBackup(JSON.stringify({ hello: "world" }))).toThrow(
      /not a Lexicora backup/,
    );
    expect(() => parseBackup(JSON.stringify([1, 2, 3]))).toThrow(
      /not a Lexicora backup/,
    );
  });

  it("refuses a file from a newer format", () => {
    const file = {
      formatVersion: BACKUP_FORMAT_VERSION + 1,
      topics: [],
      entries: [],
      blocks: [],
    };

    expect(() => parseBackup(JSON.stringify(file))).toThrow(/newer version/);
  });

  it("reads a file written before formatVersion existed", () => {
    // The first exports carried only the schema version.
    const legacy = {
      exportedAt: NOW,
      version: 0,
      topics: [topic()],
      entries: [entry()],
      blocks: [block()],
    };

    const parsed = parseBackup(JSON.stringify(legacy));

    expect(parsed.formatVersion).toBe(1);
    expect(parsed.topics).toHaveLength(1);
  });

  it("strips RxDB bookkeeping and the searchBlob from records", () => {
    const file = {
      formatVersion: 1,
      topics: [
        {
          ...topic(),
          searchBlob: "stale",
          _rev: "3-abc",
          _meta: { lwt: 1 },
          _deleted: false,
          _attachments: {},
        },
      ],
      entries: [],
      blocks: [],
    };

    const [parsed] = parseBackup(JSON.stringify(file)).topics;

    expect(parsed).not.toHaveProperty("searchBlob");
    expect(parsed).not.toHaveProperty("_rev");
    expect(parsed).not.toHaveProperty("_meta");
    expect(parsed).not.toHaveProperty("_deleted");
    expect(parsed).not.toHaveProperty("_attachments");
  });

  it("fills the app's defaults for flags a hand-edited file leaves out", () => {
    const file = {
      formatVersion: 1,
      topics: [
        { id: T1, name: "Bare", tags: [], createdAt: NOW, updatedAt: NOW },
      ],
      entries: [
        {
          id: E1,
          topicId: T1,
          title: "Bare",
          tags: [],
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      blocks: [{ id: B1, entryId: E1, order: 0, type: "divider" }],
    };

    const parsed = parseBackup(JSON.stringify(file));

    expect(parsed.topics[0]).toMatchObject({
      userId: NIL,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
    });
    expect(parsed.entries[0]).toMatchObject({
      userId: NIL,
      archivedExplicitly: false,
      url: "",
      hostnameUrl: "",
    });
    expect(parsed.blocks[0]).toMatchObject({ userId: NIL, propsJson: {} });
  });

  it("accepts every block type the editor can produce, alert included", () => {
    const file = {
      formatVersion: 1,
      topics: [],
      entries: [],
      blocks: [block({ type: "alert", propsJson: { type: "warning" } })],
    };

    expect(parseBackup(JSON.stringify(file)).blocks[0]?.type).toBe("alert");
  });

  it("names the record that is invalid", () => {
    const file = {
      formatVersion: 1,
      topics: [topic()],
      entries: [],
      blocks: [block({ type: "hologram" as BlockDocType["type"] })],
    };

    expect(() => parseBackup(JSON.stringify(file))).toThrow(/blocks\.0\.type/);
  });

  it("refuses an id that is not a UUID", () => {
    const file = {
      formatVersion: 1,
      topics: [topic({ id: "topic-1" })],
      entries: [],
      blocks: [],
    };

    expect(() => parseBackup(JSON.stringify(file))).toThrow(/topics\.0\.id/);
  });
});
