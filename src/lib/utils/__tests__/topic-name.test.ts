import { describe, it, expect } from "vitest";
import {
  findTopicNameConflict,
  isSameTopicName,
  topicsMatchingName,
} from "../topic-name";

/**
 * Covers topic name uniqueness. The cases with regex syntax are the ones the
 * previous `$regex` check got wrong, in both directions.
 */

const topic = (id: string, name: string) => ({ id, name });

describe("isSameTopicName", () => {
  it("ignores case and surrounding whitespace", () => {
    expect(isSameTopicName("Research", " research ")).toBe(true);
    expect(isSameTopicName("Research", "Researcher")).toBe(false);
  });
});

describe("findTopicNameConflict", () => {
  it.each([
    ["Notes (old)", "Notes (old)"],
    ["Node.js", "Node.js"],
    ["C++", "C++"],
    ["[WIP]", "[WIP]"],
    ["a|b", "A|B"],
    ["^start$", "^START$"],
  ])("treats %s as taken by an existing %s", (typed, existing) => {
    expect(findTopicNameConflict(typed, [topic("t1", existing)])).toMatchObject({
      id: "t1",
    });
  });

  it.each([
    ["Notes (old)", "Notes old"],
    ["Node.js", "NodeXjs"],
    ["[WIP]", "W"],
    ["a|b", "a"],
  ])("does not treat %s as taken by %s", (typed, existing) => {
    expect(findTopicNameConflict(typed, [topic("t1", existing)])).toBeUndefined();
  });

  it("does not conflict with the topic being edited", () => {
    const topics = [topic("t1", "Research")];

    expect(findTopicNameConflict("research", topics, "t1")).toBeUndefined();
    expect(findTopicNameConflict("research", topics, "t2")).toMatchObject({
      id: "t1",
    });
  });
});

describe("topicsMatchingName", () => {
  const topics = [
    { id: "1", name: "React hooks" },
    { id: "2", name: "React Router" },
    { id: "3", name: "Databases" },
  ];

  it("finds every topic whose name contains the text", () => {
    expect(topicsMatchingName("react", topics).map((t) => t.id)).toEqual([
      "1",
      "2",
    ]);
    expect(topicsMatchingName("ba", topics).map((t) => t.id)).toEqual(["3"]);
  });

  it("ignores case and surrounding whitespace", () => {
    expect(topicsMatchingName("  ROUTER ", topics).map((t) => t.id)).toEqual([
      "2",
    ]);
  });

  it("matches across a space in the name", () => {
    expect(topicsMatchingName("act h", topics).map((t) => t.id)).toEqual(["1"]);
  });

  it("matches the text literally, not as a pattern", () => {
    const withSymbols = [{ id: "1", name: "C++ notes" }, { id: "2", name: "C" }];

    expect(topicsMatchingName("c++", withSymbols).map((t) => t.id)).toEqual([
      "1",
    ]);
    expect(topicsMatchingName(".", topics)).toEqual([]);
  });

  it("matches nothing for an empty query or an unknown name", () => {
    expect(topicsMatchingName("", topics)).toEqual([]);
    expect(topicsMatchingName("   ", topics)).toEqual([]);
    expect(topicsMatchingName("zzz", topics)).toEqual([]);
  });
});
