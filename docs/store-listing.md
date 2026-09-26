# Store listing copy

Everything a submission asks for, written once. Each field says which store
asks for it and any length limit. Nothing here is marketing that the extension
cannot back up: a reviewer checks the listing against the behavior, and a
promise the app does not keep is a rejection.

Keep this file in step with the extension: the same claims appear in
`README.md`, `PRIVACY.md` and Settings → General → Privacy policy.

---

## Identity

| Field | Value |
| --- | --- |
| Name | Lexicora |
| Category | Productivity (Chrome) / Bookmarks & Tabs (AMO) |
| Language | English (UK spelling in the UI) |
| Website | Repository, until lexicora.com is live |
| Support | <https://github.com/lexicora/lexicora-extension/issues> |
| Contact email | hello@tgmaurer.dev (account-wide on the Chrome Web Store; also in the privacy policy and on the Support page) |
| Privacy policy | <https://github.com/lexicora/lexicora-extension/blob/main/PRIVACY.md> |
| Licence | Custom, source-available; see `LICENSE.txt` |

---

## Short description

**Chrome Web Store, 132 characters maximum.** This is 123. The store takes it
from the manifest's `description`, which WXT fills in from `package.json`, so
it is changed there and ships with the package, not typed into the dashboard:

> Capture a page or bookmark it, sort it into topics, search it later. Fully offline — your library never leaves your device.

**AMO summary, 250 characters maximum.** This is 240:

> Keep what you read. Capture a page's content into an editor you can annotate, or bookmark it for the link alone, then sort it into topics and search all of it later. Everything is stored in your browser: no account, no server, no telemetry.

---

## Detailed description

> **Lexicora keeps what you read, on your own machine.**
>
> Most of what is worth remembering is read once and lost — in a tab, a doc site, a chat. Lexicora is an offline web clipper and bookmark manager: it captures a page while you are there and makes it findable afterwards.
>
> **Two ways to save**
> Capture a page and its content lands in an editor you can edit and annotate, so it survives the page changing or disappearing. Lexicora keeps the article itself, with its headings, lists, tables, code and images, and leaves out the menus, sidebars and ads around it. Or bookmark it, and only what the page says about itself is kept: title, link, site, description, author, date. Either way it becomes an ordinary entry in a topic of your choosing.
>
> **Save from wherever you are**
> The side panel sits beside the page. Capture from it, from the toolbar popup, from the right-click menu or with a keyboard shortcut. The right-click menu and the shortcut can also keep just the text you have selected. The page arrives with its details already filled in. In Chrome and Edge, Lexicora can also suggest capturing a page you have spent a while on; accepting opens the side panel, where you decide.
>
> **Sort it your way**
> Topics group what belongs together. Tags cut across them. Pin what you return to, archive what you are done with, favorite what matters.
>
> **Find it again**
> Search runs over titles, tags, descriptions, site names and dates. Narrow it to a single site by typing site:react.dev, alone or with words after it. And when you are back on a site, the side panel shows what you already saved from it.
>
> **Write in it**
> Every entry has a rich editor: headings, lists, tables, code blocks with syntax highlighting, and callouts. Drag text or images in from the page you are reading.
>
> **Take it with you**
> Export a note, a topic or the whole library as Markdown with YAML front matter, which Obsidian reads as properties. Or export a JSON backup and import it again, with control over what wins when something exists in both.
>
> **It is yours**
> No account. No server. No analytics. Lexicora makes no network requests of its own, and everything you capture is stored by your browser on your device. Delete it all at once whenever you like.
>
> Lexicora is source-available under a non-commercial license, and developed in the open.

On AMO, leave out the sentence about the capture suggestion: it does not
exist in Firefox, and a listing may only describe what the build does.

The Chrome Web Store shows the description as plain text, so paste it without
the `>` and `**` markers: each heading on its own line, a blank line before it.

---

## Single purpose

Chrome asks what the extension is for, in its own text box, and wants a
purpose that is "narrow and easy to understand". The reviewer checks that
every feature and permission serves it, so the first sentence names the
purpose and the rest ties each feature to it:

> Lexicora saves web pages the user chooses into a personal library on their device, where they can annotate, organize and search them. A page is saved either with its content, into an editor, or as a bookmark with its title, link and description. The side panel, toolbar popup, context menu, keyboard shortcuts and the optional save prompt are ways to save a page. Export and backup copy the library to a file.

---

## Permission justifications

Chrome asks per permission, in a text box each, "why your extension needs to
use each permission". Each answer names the feature that uses the permission
and the user action that triggers it, in one to three sentences. Where a
narrower permission exists, it says why that one is not enough: reviewers
reject permissions broader than the feature needs, so `tabs` next to
`activeTab` is the one most likely to be questioned.

| Permission | Justification |
| --- | --- |
| `storage` | Saves the user's settings, such as the theme, the editor width and the save prompt options, and whether the side panel is open. The saved pages are stored in IndexedDB, not here. |
| `unlimitedStorage` | The user's library is stored only on their device, in IndexedDB, with no copy on a server. This permission keeps the browser from deleting that database when disk space runs low, which would erase the library. |
| `tabs` | Reads the URL and title of the active tab, and updates when the user switches tabs or navigates. This is used to show in the side panel what the user already saved from the current site, and to disable the save buttons and context menu entries on pages that cannot be saved, such as browser settings pages. The activeTab permission is not enough because the side panel stays open across tab changes, without a new user action on each tab. |
| `activeTab` | Grants access to the current tab when the user clicks the toolbar button, a context menu entry or a keyboard shortcut, so Lexicora can read the page the user chose to save. |
| `scripting` | When the user clicks "Refresh Metadata" in the entry form, runs a function in the active tab that reads the page's URL, favicon, site name and language to fill in those fields. It runs only on that click and does not modify the page. |
| `contextMenus` | Adds context menu entries to capture the page, capture the selected text, bookmark the page and toggle the side panel. |
| `sidePanel` | The side panel is Lexicora's main interface. The user saves the current page and browses their library in it, next to the page they are reading. |
| `clipboardWrite` | Copies an entry or topic to the clipboard as formatted text and Markdown when the user clicks Copy. Lexicora never reads the clipboard. |

**Host permissions.** The manifest asks for none, but the content script runs
on `http://*/*`, `https://*/*` and `file:///*`, which Chrome treats as access
to all websites and asks to justify:

> The user can save a page from any website, so the content script runs on all http, https and file pages. It reads a page only when the user asks to save it: the full page, the selected text, or, for a bookmark, only the title, link and description. In Chrome and Edge it also offers to save a page the user has kept open for a while (five minutes by default). This prompt is on by default and can be turned off in Settings. It only counts the time the page is visible and reads nothing from it. The content script does not run on browser pages or extension stores, and nothing it reads leaves the device.

**Remote code:** No. Everything the extension runs is in the package. No
scripts are fetched, evaluated or loaded from a server.

**Data usage disclosures.** Google counts data an extension handles on the
device as well, not only what it sends somewhere. Its user data FAQ says so
outright ("even when data is processed or stored locally on a user's device").
Lexicora stores the pages the user saves, so two categories apply. Ticking
them is what an honest listing shows; the store then says the data is handled,
next to the three certifications below.

- **Website content: yes.** The text, images and links of the pages the user
  saves, stored in the extension's database on their device.
- **Web history: yes.** The addresses and titles of the pages the user
  saves, and the address of the current tab, read to show what was already
  saved from that site. Stored or read on the device only.
- Personally identifiable, health, financial, authentication information,
  personal communications, location, user activity: no. The save prompt
  counts only how long a page has been visible; it records no clicks,
  keystrokes, scrolling or mouse movement, which is what "user activity"
  means.
- Certify all three: not sold to third parties, not used or transferred for
  purposes unrelated to the single purpose, not used to determine
  creditworthiness or for lending.

---

## Privacy policy

The extension's own page (Settings → General → Privacy policy) holds the full
text, and [`PRIVACY.md`](../PRIVACY.md) holds the same text at a public
address, which is the URL both stores get. Change the two together. Its
structure:
what is stored and where, what leaves the device (nothing the extension sends,
though the browser still loads site icons and linked images from their hosts),
why each permission is needed, how to delete everything, and what happens if a
future version sends anything anywhere.

---

## Screenshots

Chrome takes 1280×800 or 640×400, up to five; export exactly 1280×800 rather
than relying on the store to scale. AMO accepts other sizes, but the same set
works there. Together the five tell one story: read something, capture it,
write in it, find it again, take it with you.

1. **The side panel beside an article**, showing "Capture page" and "Bookmark":
   what the extension is, in one image. Use an evergreen Wikipedia article
   with a freely licensed lead image near the top (James Webb Space
   Telescope, Octopus, Great Barrier Reef). Not a current event: the listing
   stays up for years, and a capture button beside news, or a disaster, reads
   badly.
2. **An entry open in the editor**, with a callout and a code block, showing
   that what is captured is editable. Capture a react.dev page with real code
   in it (Synchronizing with Effects, say) and add a callout of your own; on a
   Wikipedia note a code block would look staged.
3. **The library**, with topics and entries, tags visible. The dev seed data
   works, if every name reads like a real library and nothing like a
   placeholder.
4. **Search with `site:react.dev`**, showing the filter in use, the exact
   example the description gives. The library needs three to five react.dev
   entries among others, so the filter visibly narrows it.
5. **Settings → Export**, showing Markdown and JSON export, for "your data is
   yours".

**Look.** Dark mode throughout: it stands apart from the stores' white pages
and is where Lexicora's design is strongest. All of it dark in every shot:
the browser's own theme, the page (Wikipedia, react.dev and MDN all have a
dark mode) and Lexicora, since one white page beside a dark panel is the
jarring version. Check each at 640×400: muted text loses contrast when
scaled down, and if it blurs, zoom the page a step before capturing or add a
caption in Figma.

**Capturing on a Retina Mac.** Size the browser window to exactly 1280×800
points, which a Retina display captures at 2560×1600, exactly twice the
store size, so halving it keeps text sharp. A fullscreen window on a 14-inch
MacBook Pro is 16:10 too (3024×1890 below the notch), but scales down by an
uneven factor. With the dev browser in front:

```sh
osascript -e 'tell application "Google Chrome for Testing" to set bounds of front window to {100, 60, 1380, 860}'
```

(or `"Google Chrome"`, whichever the dev browser is called). Capture the
window with ⌘⇧4, Space, then ⌥-click, which leaves out the drop shadow, and
export at 50% as PNG without transparency, or JPEG.

**Before capturing.** Use the fresh `bun run dev` profile (no bookmarks bar,
profile picture, other extensions or personal tabs) and pin Lexicora to the
toolbar so its icon shows.

Avoid: personal bookmarks, real names, anything from a private site. The store
listing is public and the screenshots are the most-read part of it.

---

## AMO specifics

- **Licence:** AMO's dropdown only lists standard licences, and Lexicora's is
  custom. Choose "Custom License" and paste `LICENSE.txt` in full.
- **Review:** listed add-ons are signed and published after automated
  validation; human review can follow at any time. Keep the source buildable
  from the repository, since a reviewer may ask how the bundle was produced:
  `bun install && bun run zip:firefox`.
- **Categories:** Bookmarks & Tabs, with Productivity as secondary.
- **Version numbers are final.** AMO never accepts a version number twice,
  not even after the upload is deleted. Upload the Firefox zip only once the
  build is final; a fix after that is 1.0.1.

## Replacing a package before submitting

On the Chrome Web Store, an item that has not been submitted for review can
take a new package as often as needed, with the same version number. The rule
that each upload must have a higher version applies once a version has been
submitted or published. So until "Submit for review", rebuild and upload
again freely.

## Edge Add-ons

The Chrome copy applies unchanged. Edge reviews manually and takes longer
than Chrome, so submit it after Chrome's listing is settled.
