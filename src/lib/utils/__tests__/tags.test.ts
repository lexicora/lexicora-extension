import { describe, it, expect } from "vitest";

import {
  MAX_TAGS,
  MAX_TAG_LENGTH,
  formatTagsInput,
  normalizeTags,
  parseTagsInput,
  tagsInputSchema,
} from "../tags";

/**
 * Tags are typed as one comma-separated line and stored as an array, so this
 * is the only place that decides what a tag is. The schemas allow ten tags of
 * fifty characters and nothing enforces them at runtime.
 */

describe("parseTagsInput", () => {
  it("splits, trims and drops blanks", () => {
    expect(parseTagsInput("  react ,, rxdb ,  ")).toEqual(["react", "rxdb"]);
    expect(parseTagsInput("")).toEqual([]);
    expect(parseTagsInput("   ")).toEqual([]);
  });

  it("keeps one of each tag, first spelling wins", () => {
    expect(parseTagsInput("React, react, REACT")).toEqual(["React"]);
    expect(parseTagsInput("a, b, A")).toEqual(["a", "b"]);
  });

  it("leaves tags with spaces and punctuation intact", () => {
    expect(parseTagsInput("state management, c++, .net")).toEqual([
      "state management",
      "c++",
      ".net",
    ]);
  });
});

describe("formatTagsInput", () => {
  it("is what the form shows for stored tags", () => {
    expect(formatTagsInput(["react", "rxdb"])).toBe("react, rxdb");
    expect(formatTagsInput([])).toBe("");
    expect(formatTagsInput(undefined)).toBe("");
  });

  it("round-trips through the parser", () => {
    const tags = ["react", "state management"];
    expect(parseTagsInput(formatTagsInput(tags))).toEqual(tags);
  });
});

describe("normalizeTags", () => {
  it("brings imported tags within the schema's limits", () => {
    const many = Array.from({ length: 15 }, (_, i) => `tag${i}`);
    expect(normalizeTags(many)).toHaveLength(MAX_TAGS);
    expect(normalizeTags(["x".repeat(80)])[0]).toHaveLength(MAX_TAG_LENGTH);
  });

  it("drops what is not a usable tag", () => {
    expect(normalizeTags(["react", "", "  ", "react"])).toEqual(["react"]);
    expect(normalizeTags([1, null, "ok", { a: 1 }])).toEqual(["ok"]);
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags("react")).toEqual([]);
  });
});

describe("tagsInputSchema", () => {
  const error = (value: string) => {
    const result = tagsInputSchema.safeParse(value);
    return result.success ? null : result.error.issues[0]!.message;
  };

  it("accepts an ordinary line", () => {
    expect(error("react, rxdb, wxt")).toBeNull();
    expect(error("")).toBeNull();
  });

  it("does not count repeats towards the limit", () => {
    const eleven = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(error(eleven.join(", "))).toBe("Use at most 10 tags.");
    expect(error([...eleven.slice(0, 10), "TAG0"].join(", "))).toBeNull();
  });

  it("rejects a tag longer than the schema allows", () => {
    expect(error("x".repeat(MAX_TAG_LENGTH + 1))).toBe(
      "Each tag can be at most 50 characters.",
    );
    expect(error("x".repeat(MAX_TAG_LENGTH))).toBeNull();
  });
});
