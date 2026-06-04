import { describe, it, expect } from "vitest";
import { buildEntrySearchBlob, buildTopicSearchBlob } from "../search-blob";

describe("buildEntrySearchBlob", () => {
  it("combines title, tags, description, siteName, and hostnameUrl", () => {
    const blob = buildEntrySearchBlob({
      title: "Hello World",
      tags: ["foo", "bar"],
      description: "A short description",
      siteName: "Example Site",
      hostnameUrl: "example.com",
    });
    expect(blob).toContain("hello world");
    expect(blob).toContain("foo");
    expect(blob).toContain("bar");
    expect(blob).toContain("a short description");
    expect(blob).toContain("example site");
    expect(blob).toContain("example.com");
  });

  it("lowercases all content", () => {
    const blob = buildEntrySearchBlob({ title: "TypeScript Guide", tags: ["TS"] });
    expect(blob).toBe("typescript guide ts");
  });

  it("truncates description to 150 chars", () => {
    const long = "a".repeat(200);
    const blob = buildEntrySearchBlob({ description: long });
    expect(blob.length).toBeLessThanOrEqual(150);
  });

  it("handles missing optional fields gracefully", () => {
    const blob = buildEntrySearchBlob({ title: "Only Title" });
    expect(blob).toBe("only title");
  });

  it("collapses multiple spaces", () => {
    const blob = buildEntrySearchBlob({ title: "A", tags: [], description: "" });
    expect(blob).not.toMatch(/\s{2,}/);
  });

  it("returns empty string when all fields are missing", () => {
    expect(buildEntrySearchBlob({})).toBe("");
  });
});

describe("buildTopicSearchBlob", () => {
  it("combines name, tags, and description", () => {
    const blob = buildTopicSearchBlob({
      name: "Research",
      tags: ["science", "tech"],
      description: "Science and technology topics",
    });
    expect(blob).toContain("research");
    expect(blob).toContain("science");
    expect(blob).toContain("tech");
    expect(blob).toContain("science and technology topics");
  });

  it("lowercases name", () => {
    const blob = buildTopicSearchBlob({ name: "My Topic" });
    expect(blob).toBe("my topic");
  });

  it("handles empty tags array", () => {
    const blob = buildTopicSearchBlob({ name: "Solo", tags: [] });
    expect(blob).toBe("solo");
  });
});
