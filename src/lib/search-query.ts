/**
 * Two search filters, borrowed from web search. `site:react.dev` narrows to
 * entries captured from that host, and `topic:react` (or `topic:"my project"`
 * for a name with spaces) to the entries in the topics whose name contains
 * that, so a few letters find every topic they appear in. Anything else in the
 * box is still matched as text — `site:react.dev hooks` does both.
 *
 * Deliberately two filters, not a syntax. `site:` exists so "Show all from …"
 * on the home page can be exact rather than a text match that happens to
 * contain the hostname, and uses the `hostnameUrl` index instead of scanning.
 * `topic:` is the same idea for topics, through the `topicId` index.
 */

const SITE_TOKEN = /^site:(\S+)$/i;
// A quoted name may hold spaces; otherwise it runs to the next space. A quote
// not yet closed runs to the end, so the list narrows while the name is typed.
const TOPIC_TOKEN = /(^|\s)topic:(?:"([^"]*)(?:"|$)|(\S+))/i;

export interface ParsedSearch {
  /** The host to match, without a `www.` prefix, or null. */
  site: string | null;
  /** Part of the name of the topics to match, or null. */
  topic: string | null;
  /** What is left for the text search. */
  text: string;
}

export function parseSearchQuery(raw: string): ParsedSearch {
  // Only the first topic counts; a second is left in as text, as with a site.
  let topic: string | null = null;
  let remaining = raw;
  const topicMatch = raw.match(TOPIC_TOKEN);
  if (topicMatch) {
    const name = (topicMatch[2] ?? topicMatch[3] ?? "").trim();
    if (name) {
      topic = name;
      remaining = raw.replace(TOPIC_TOKEN, "$1");
    }
  }

  const tokens = remaining.trim().split(/\s+/).filter(Boolean);

  let site: string | null = null;
  const rest: string[] = [];

  for (const token of tokens) {
    const match = token.match(SITE_TOKEN);
    // Only the first one counts; a second is treated as text rather than
    // silently narrowing to something the user cannot see.
    if (match && !site) {
      site = match[1]!.toLowerCase().replace(/^www\./, "");
    } else {
      rest.push(token);
    }
  }

  return { site, topic, text: rest.join(" ") };
}

/** Both spellings of a host, so a capture from www.x.com matches `site:x.com`. */
export function siteHostnames(site: string): string[] {
  return [site, `www.${site}`];
}

/** The query string that searches for one site, as the home page links to it. */
export function siteSearchQuery(hostname: string): string {
  return `site:${hostname.replace(/^www\./, "")}`;
}

/**
 * The `$regex` to match search text against a lowercased `searchBlob`: the
 * text as a literal, so `c++` or `(draft)` match themselves. Escaping every
 * special character means the pattern always compiles.
 * @returns null when there is no text to search for.
 */
export function searchTextPattern(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase();
}
