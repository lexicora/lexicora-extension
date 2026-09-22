# Store listing copy

Everything a submission asks for, written once. Each field says which store
asks for it and any length limit. Nothing here is marketing that the extension
cannot back up — a reviewer checks the listing against the behaviour, and a
promise the app does not keep is a rejection.

Keep this file in step with the extension: the same claims appear in
`README.md` and in Settings → General → Privacy policy.

---

## Identity

| Field | Value |
|---|---|
| Name | Lexicora |
| Category | Productivity (Chrome) / Bookmarks & Tabs (AMO) |
| Language | English (UK spelling in the UI) |
| Website | Repository, until lexicora.com is live |
| Support | https://github.com/lexicora/lexicora-extension/issues |
| Privacy policy | Section below, published wherever the store requires a URL |
| Licence | Custom, source-available; see `LICENSE.txt` |

---

## Short description

**Chrome Web Store, 132 characters maximum.** This is 123:

> Capture a page or bookmark it, sort it into topics, search it later. Fully offline — your library never leaves your device.

**AMO summary, 250 characters maximum.** This is 240:

> Keep what you read. Capture a page's content into an editor you can annotate, or bookmark it for the link alone, then sort it into topics and search all of it later. Everything is stored in your browser: no account, no server, no telemetry.

---

## Detailed description

> **Lexicora keeps what you read, on your own machine.**
>
> Most of what is worth remembering is read once and lost — in a tab, a doc site, a chat. Lexicora captures it while you are there and makes it findable afterwards.
>
> **Two ways to save**
> Capture a page and its content lands in an editor you can edit, annotate and search, so it survives the page changing or disappearing. Or bookmark it, and only what the page says about itself is kept: title, link, site, description, author, date. Either way it becomes an ordinary entry in a topic of your choosing.
>
> **Save from wherever you are**
> The side panel sits beside the page. Capture from it, from the toolbar popup, from the right-click menu — including just the text you have selected — or with a keyboard shortcut. The page arrives with its details already filled in.
>
> **Sort it your way**
> Topics group what belongs together. Tags cut across them. Pin what you return to, archive what you are done with, favourite what matters.
>
> **Find it again**
> Search runs over titles, tags, descriptions and site names. Narrow it to a single site by typing site:react.dev, alone or with words after it.
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
> Lexicora is source-available under a non-commercial licence, and developed in the open.

---

## Single purpose (Chrome requires one sentence)

> Lexicora captures web pages and bookmarks into a local, searchable library that the user organises into topics.

---

## Permission justifications

Chrome asks per permission, in a text box each. These are written for a
reviewer: what it does, and why the extension cannot do its job without it.

| Permission | Justification |
|---|---|
| `activeTab` | Reading the page the user has asked to save. A capture or bookmark starts from an explicit action — a button, a menu item or a shortcut — and reads only the tab that action came from. |
| `scripting` | Reading the page's content and metadata at the moment of capture, by running the extension's own function in the tab the user acted on. Nothing is injected in the background or on pages the user has not chosen. |
| `tabs` | Knowing which tab is active and what its URL is, so a capture goes to the right page, the side panel shows what would be saved, and the controls are disabled on pages that cannot be read. |
| `storage` | Keeping the user's library and settings on their own device. Nothing is sent anywhere. |
| `contextMenus` | Adding Lexicora's right-click entries: capture the page, capture the selection, bookmark, and open or close the side panel. |
| `sidePanel` | The side panel is the extension's main interface, opened beside the page being read. |
| `clipboardWrite` | Copying an entry or a topic to the clipboard when the user presses Copy, as rich text and Markdown together. |

**Host permissions** (`http://*/*`, `https://*/*`, `file:///*`):

> Lexicora saves the page the user is reading, so it has to be able to read a page on any site — which site is the user's choice, made at the moment they capture. The content script is limited to http, https and local files, the schemes a capture can actually read, and it does nothing on a page until the user asks for a capture or the capture prompt is shown. No page data is sent anywhere; it goes into the user's own library in their browser.

**Remote code:** No. Everything the extension runs is in the package. No
scripts are fetched, evaluated or loaded from a server.

**Data usage disclosures** (Chrome's form, all of which are "no"):

- Personally identifiable information — not collected
- Health, financial, authentication information — not collected
- Personal communications, location, web history, user activity — not collected
- Website content — read only on an explicit capture, stored on the device,
  never transmitted
- Certify: not sold to third parties, not used for unrelated purposes, not
  used to determine creditworthiness

---

## Privacy policy

The extension's own page (Settings → General → Privacy policy) holds the full
text; publish that same text where the store asks for a URL. Its structure:
what is stored and where, what leaves the device (nothing the extension sends,
though the browser still loads site icons and linked images from their hosts),
why each permission is needed, how to delete everything, and what happens if a
future version sends anything anywhere.

---

## Screenshots

Chrome takes 1280×800 or 640×400, up to five. Suggested set, in order:

1. **The side panel beside an article**, showing "Capture page" and "Bookmark"
   — what the extension is, in one image.
2. **An entry open in the editor**, with a callout and a code block, showing
   that what is captured is editable.
3. **The library**, with topics and entries, tags visible.
4. **Search with `site:react.dev`**, showing the filter in use.
5. **Settings → Export**, showing Markdown and JSON export, for "your data is
   yours".

Avoid: personal bookmarks, real names, anything from a private site. The store
listing is public and the screenshots are the most-read part of it.

---

## AMO specifics

- **Licence:** AMO's dropdown only lists standard licences, and Lexicora's is
  custom. Choose "Custom License" and paste `LICENSE.txt` in full.
- **Review:** listed add-ons are signed and published after automated
  validation; human review can follow at any time. Keep the source buildable
  from the repository, since a reviewer may ask how the bundle was produced —
  `bun install && bun run zip:firefox`.
- **Categories:** Bookmarks & Tabs, with Productivity as secondary.

## Edge Add-ons

The Chrome copy applies unchanged. Edge reviews manually and takes longer
than Chrome, so submit it after Chrome's listing is settled.
