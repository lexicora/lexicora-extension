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
    version: "1.2.0",
    date: "2026-10-16",
    summary:
      "Search the library by topic, steadier site icons, and a handful of fixes.",
    changes: {
      new: [
        "Search the library by topic: topic:react lists the entries of every topic with react in its name. Put a name with spaces in quotes, as in topic:\"my project\", and combine it with site: or words.",
        "Settings has a Website row that opens the Lexicora website.",
      ],
      improved: [
        "Site icons no longer pop in again each time you scroll through a list or come back to it.",
        "Coming back to the home page from a create or edit page shows the bottom bar at once instead of sliding it up.",
        "Enter in a text field of the entry and topic forms no longer saves. Save with ⌘/Ctrl+S or the Save button.",
        "Tips & Tricks explains which pages capture well and why to keep topics specific.",
      ],
      fixed: [
        "A page at a different # section of the same address now counts as a different page on the home page, instead of showing as already captured.",
        "Tables in read-only entries no longer leave an empty strip on their right.",
      ],
    },
  },
  {
    version: "1.1.0",
    date: "2026-10-14",
    summary:
      "Find text in the side panel, a map of an entry's headings, and polish throughout.",
    changes: {
      new: [
        "Find text on the side panel's page, the editor included, with ⌘/Ctrl+F. Enter and Shift+Enter step through the matches.",
        "A heading map lists an entry's headings and jumps to the one you choose. It appears once an entry has two headings; open it with O, or from the page header on an entry's page.",
        "After an update, the side panel says so once and links to what changed.",
        "Two shortcuts on an entry: W widens or narrows the editor, M opens or closes the additional fields and metadata.",
        "Settings → Storage shows roughly how much space Lexicora uses.",
        "Settings → About links to the store you installed Lexicora from, to leave a review.",
        "The Markdown export can leave out archived entries and topics.",
      ],
      improved: [
        "Settings → Export gives each format its own card, with its option right below. JSON backups are compact by default.",
        "Large counts in lists are shortened, as in 1.2k+.",
        "A topic's page always shows how many entries it has, and an archived topic counts its archived entries.",
        "Softer shadows on the side panel's top and bottom bars, and the create and edit pages fade out at the bottom edge.",
        "The topic form's save button stays in view at the bottom of the panel.",
        "The tags and site row of library items is tighter and lines up with the title.",
        "On install, the getting-started page no longer points at the toolbar while the browser's Extensions menu is open. On Edge, its pin steps match Chrome's.",
      ],
      fixed: [
        "Code blocks in light mode are light, with matching syntax colours, instead of dark.",
        "Entry, topic, create and edit pages open at the top, instead of at the list's scroll position.",
        "Archiving a topic no longer changes its entry total.",
        "On an entry's page, a long link no longer squeezes the site name.",
        "A site icon that fails to load is left out of entry items, as a missing one is.",
        "The right-click menu no longer shows a stray separator on pages Lexicora cannot capture from.",
      ],
    },
  },
  {
    version: "1.0.2",
    date: "2026-10-08",
    summary:
      "1.0.1, rebuilt so that Firefox Add-ons can verify it against its source code.",
    changes: {
      improved: [
        "Lexicora now builds identically from its published source code, which Firefox Add-ons checks before publishing an update.",
      ],
    },
  },
  {
    version: "1.0.1",
    date: "2026-10-08",
    summary:
      "Fixes and polish after the first release, and a download about a third smaller.",
    changes: {
      improved: [
        "Lexicora is about a third smaller to download and install.",
        "Tags on entries and topics use the full width of the row.",
        "Two new tips under Settings → Help: what to do when a capture does nothing, and how to use Lexicora on local files.",
        "Small spacing fixes in entry and topic items and in Settings.",
      ],
      fixed: [
        "⌘/Ctrl+S now saves when creating or editing a topic, as it already did for entries.",
        "The last item in a list is no longer covered by the + button once scrolled to the end.",
        "Recent entries on the home page, and the current page in the popup, show a globe when a site's icon fails to load, instead of an empty gap.",
        "The getting-started page's opening animation no longer stutters right after installing.",
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-09-26",
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
export function formatReleaseDate(
  date: string,
  dateStyle: "short" | "medium" | "long" = "medium",
): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    dateStyle: dateStyle,
    timeZone: "UTC",
  });
}
