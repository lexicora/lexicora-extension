/**
 * A single search filter, borrowed from web search: `site:react.dev` narrows
 * to entries captured from that host, and anything else in the box is still
 * matched as text — `site:react.dev hooks` does both.
 *
 * Deliberately one filter, not a syntax. It exists so "Show all from …" on the
 * home page can be exact rather than a text match that happens to contain the
 * hostname, and it uses the `hostnameUrl` index instead of scanning. Proper
 * filtering (a popover, several fields) would replace this outright.
 */

const SITE_TOKEN = /^site:(\S+)$/i;

export interface ParsedSearch {
  /** The host to match, without a `www.` prefix, or null. */
  site: string | null;
  /** What is left for the text search. */
  text: string;
}

export function parseSearchQuery(raw: string): ParsedSearch {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);

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

  return { site, text: rest.join(" ") };
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
