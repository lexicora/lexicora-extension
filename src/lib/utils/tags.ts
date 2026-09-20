import { z } from "zod";

/**
 * Tags as the forms take them: one comma-separated line.
 *
 * The limits mirror the `tags` field in the entry and topic schemas, which
 * allow ten tags of up to fifty characters. Nothing enforces a schema at
 * runtime, so this is where tags are kept within it — for what the user types
 * and for what an imported backup carries.
 */

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 50;
/** The whole input line, long enough for ten full-length tags and separators. */
export const MAX_TAGS_INPUT_LENGTH = 550;

/**
 * Splits a comma-separated line into tags: trimmed, without blanks, and
 * without repeats. Two tags that differ only in case are the same tag, and
 * the first spelling is the one kept, since that is the one the user last
 * chose to type.
 */
export function parseTagsInput(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of value.split(",")) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }

  return tags;
}

/** The line a tags field shows for stored tags. */
export function formatTagsInput(tags: string[] | undefined): string {
  return tags?.join(", ") ?? "";
}

/**
 * Tags from outside the forms — a backup file, a capture — brought within the
 * schema's limits. Anything that is not a usable string is dropped, rather
 * than failing the import: a tag is not worth losing an entry over.
 */
export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return parseTagsInput(
    value.filter((tag) => typeof tag === "string").join(","),
  )
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH))
    .slice(0, MAX_TAGS);
}

/**
 * The forms' tags field. Too many tags or an overlong one is an error the
 * user sees, rather than a silent truncation of what they typed.
 */
export const tagsInputSchema = z
  .string()
  .max(MAX_TAGS_INPUT_LENGTH, "Tags input is too long.")
  .superRefine((value, ctx) => {
    const tags = parseTagsInput(value);
    if (tags.length > MAX_TAGS) {
      ctx.addIssue({
        code: "custom",
        message: `Use at most ${MAX_TAGS} tags.`,
      });
    }
    if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
      ctx.addIssue({
        code: "custom",
        message: `Each tag can be at most ${MAX_TAG_LENGTH} characters.`,
      });
    }
  });
