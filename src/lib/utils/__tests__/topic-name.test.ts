import { describe, it, expect } from "vitest";
import { findTopicNameConflict, isSameTopicName } from "../topic-name";

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
