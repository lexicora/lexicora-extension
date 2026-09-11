import { describe, it, expect } from "vitest";
import { strFromU8, unzipSync } from "fflate";

import type { EntryDocType } from "@/db/schemas/entry";
import type { TopicDocType } from "@/db/schemas/topic";
import type { BlockNoteBlock } from "@/lib/utils/block-converter";
import { buildTopicArchive } from "../index";

/**
 * Covers the topic zip end to end: real block conversion (no mocked editor),
 * real zip bytes read back with fflate.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function makeTopic(name = "Research"): TopicDocType {
  return {
    id: "t1",
    userId: NIL_UUID,
    name,
    description: "",
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-09-02T11:30:00.000Z",
  } as TopicDocType;
}

function makeEntry(id: string, title: string, updatedAt = "2026-09-01T10:00:00.000Z"): EntryDocType {
  return {
    id,
    userId: NIL_UUID,
    topicId: "t1",
    title,
    description: "",
    tags: [],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    archivedExplicitly: false,
    languageCode: "en",
    url: "",
    hostnameUrl: "",
    pathnameUrl: "",
    searchUrl: "",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt,
  } as EntryDocType;
}

const blocks: BlockNoteBlock[] = [
  { type: "heading", props: { level: 2 }, content: "Section", children: [] },
  {
    type: "paragraph",
    content: [{ type: "text", text: "Bold", styles: { bold: true } }],
    children: [],
  },
];

/** The archive's files by path. Directory entries ("Research/") are dropped. */
function readArchive(bytes: Uint8Array): Record<string, string> {
  return Object.fromEntries(
    Object.entries(unzipSync(bytes))
      .filter(([path]) => !path.endsWith("/"))
      .map(([path, data]) => [path, strFromU8(data)]),
  );
}

describe("buildTopicArchive", () => {
  it("puts a topic note and one note per entry in a folder named after the topic", () => {
    const files = readArchive(
      buildTopicArchive(
        makeTopic(),
        [makeEntry("e1", "First"), makeEntry("e2", "Second")],
        new Map(),
      ),
    );

    expect(Object.keys(files).sort()).toEqual([
      "Research/First.md",
      "Research/Research.md",
      "Research/Second.md",
    ]);
  });

  it("converts each entry's blocks to Markdown", () => {
    const files = readArchive(
      buildTopicArchive(
        makeTopic(),
        [makeEntry("e1", "First")],
        new Map([["e1", blocks]]),
      ),
    );

    expect(files["Research/First.md"]).toContain("## Section");
    expect(files["Research/First.md"]).toContain("**Bold**");
  });

  it("gives the topic note its own name when an entry shares it", () => {
    const files = readArchive(
      buildTopicArchive(makeTopic(), [makeEntry("e1", "Research")], new Map()),
    );

    expect(Object.keys(files).sort()).toEqual([
      "Research/Research (2).md",
      "Research/Research.md",
    ]);
  });

  it("links the topic note to the files the entries were actually written to", () => {
    const files = readArchive(
      buildTopicArchive(
        makeTopic(),
        [makeEntry("e1", "Same"), makeEntry("e2", "Same")],
        new Map(),
      ),
    );
    const index = files["Research/Research.md"]!;

    // Both links resolve to a file that exists in the archive.
    const targets = [...index.matchAll(/\]\(([^)]+)\)/g)].map((m) =>
      decodeURIComponent(m[1]!),
    );
    expect(targets).toEqual(["Same.md", "Same (2).md"]);
    for (const target of targets) {
      expect(files[`Research/${target}`]).toBeDefined();
    }
  });

  it("sanitizes the folder name", () => {
    const files = readArchive(
      buildTopicArchive(makeTopic("A/B: notes?"), [], new Map()),
    );

    expect(Object.keys(files)).toEqual(["A B notes/A B notes.md"]);
  });

  it("stamps each file with its record's updatedAt", () => {
    const updatedAt = "2026-07-15T08:30:00.000Z";
    const archive = buildTopicArchive(
      makeTopic(),
      [makeEntry("e1", "First", updatedAt)],
      new Map(),
    );

    // ZIP stores a DOS local time with 2-second resolution; read it from the
    // central directory entry for the file.
    const view = new DataView(archive.buffer);
    let offset = archive.length - 22; // end-of-central-directory record
    const centralDirOffset = view.getUint32(offset + 16, true);
    offset = centralDirOffset;
    let found: Date | null = null;
    while (view.getUint32(offset, true) === 0x02014b50) {
      const time = view.getUint16(offset + 12, true);
      const date = view.getUint16(offset + 14, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const name = strFromU8(archive.subarray(offset + 46, offset + 46 + nameLength));
      if (name === "Research/First.md") {
        found = new Date(
          (date >> 9) + 1980,
          ((date >> 5) & 0xf) - 1,
          date & 0x1f,
          time >> 11,
          (time >> 5) & 0x3f,
          (time & 0x1f) * 2,
        );
      }
      offset += 46 + nameLength + extraLength + commentLength;
    }

    expect(found?.getTime()).toBe(new Date(updatedAt).getTime());
  });
});
