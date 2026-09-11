/**
 * Topic names are unique, compared case-insensitively and ignoring surrounding
 * whitespace: "Research" and " research " name the same topic.
 *
 * A plain string comparison on purpose. The topic form used to build a regex
 * from the typed name, so regex syntax in it changed the meaning: "Notes (old)"
 * matched "Notes old" but not itself, "Node.js" matched "NodeXjs", and "C++"
 * threw. Shared by the topic form and the entry form's topic picker so both
 * apply the same rule.
 */
export function isSameTopicName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * The topic, other than `excludeId`, that already uses `name` — or undefined.
 * Pass the id of the topic being edited as `excludeId` so it does not conflict
 * with itself.
 */
export function findTopicNameConflict<T extends { id: string; name: string }>(
  name: string,
  topics: readonly T[],
  excludeId?: string,
): T | undefined {
  return topics.find(
    (topic) => topic.id !== excludeId && isSameTopicName(topic.name, name),
  );
}
