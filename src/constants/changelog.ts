/**
 * What changed in each release — Settings → About → What's changed.
 *
 * Newest first. The first entry is the version this build is: a test checks
 * it against the version in `package.json`, which the manifest takes, so a
 * version bump without notes fails. Write for the user, not the commit log:
 * what they can do now that they could not before, and what no longer goes
 * wrong.
 */

export type ChangeKind = "new" | "improved" | "fixed";

export interface Release {
  /** As in the manifest, without a leading "v". */
  version: string;
  /** `YYYY-MM-DD`, once released. Unreleased notes leave it out. */
  date?: string;
  /** One line, shown in the list. */
  summary: string;
  changes: Partial<Record<ChangeKind, readonly string[]>>;
}

/** The order the groups appear in on a release's page. */
export const CHANGE_KINDS: readonly ChangeKind[] = ["new", "improved", "fixed"];

export const RELEASES: readonly Release[] = [
  {
    version: "1.0.0",
    summary:
      "The first release: capture, sort and search what you read, entirely on your device.",
    changes: {
      new: [
        "Capture a page into an editor you can annotate, or bookmark it to keep only its title, link and description.",
        "Save from the side panel, the toolbar popup, the right-click menu or a keyboard shortcut — including just the text you have selected.",
        "Topics to group what belongs together, tags that cut across them, and pinning, favourites and archiving.",
        "Search across titles, tags, descriptions and sites, or narrow it to one site with site:example.com.",
        "A rich editor with headings, lists, tables, code blocks with syntax highlighting and callouts. Drag text and images in from the page you are reading.",
        "Export a note, a topic or the whole library as Markdown with front matter that Obsidian reads as properties.",
        "JSON backup and import, with a choice of what wins when something exists in both.",
        "Keyboard shortcuts in the browser and in the side panel.",
        "A capture prompt that offers to save a page you have spent time on, in Chromium browsers.",
        "A getting-started page on install, and again under Settings → Help.",
      ],
    },
  },
];

export function findRelease(version: string | undefined): Release | undefined {
  return RELEASES.find((release) => release.version === version);
}

/** A release date for display. Parsed as UTC, so it is never a day early. */
export function formatReleaseDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    dateStyle: "long",
    timeZone: "UTC",
  });
}
