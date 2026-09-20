# Lexicora Extension — Roadmap

## v1.0 Milestone — offline release

**v1.0 ships as a polished, offline, single-device knowledge capture extension.**
It is a deliberate scope cut, not the completion of the phases below: the
original plan ran through Supabase sync and AI features, and those are no longer
part of the definition of done.

Everything in v1.0 stays on the user's machine. The extension makes no network
requests of its own.

### Hidden, not removed

AI, accounts and the windowed app are gated behind `FEATURES` in
[`src/constants/features.ts`](../src/constants/features.ts), all set to `false`.
The UI for them exists and re-enabling is a one-line change, but nothing that
promises an unbuilt feature is visible to users.

### Remaining work for v1.0

| Item | Notes |
|---|---|
| **Bookmark-only capture** ✅ | Capture a page from its metadata alone — title, URL, favicon, site name, description — with no page content and no editor blocks. A secondary "Bookmark" button beside "Capture page" on the side-panel home and the popup (`components/capture/capture-actions.tsx`). The content script answers `GET_PAGE_METADATA` by reading meta tags from the live page, without cloning or parsing it; the description comes only from the page's meta tags, never its text. The entry still goes through the create page so a topic can be picked. Open: the AI layouts have no Bookmark button yet, and a bookmark sent from the popup while the side panel is on an entry's *edit* page is ignored, since there is no content to merge. |
| **Export and rich copy** ([#156](https://github.com/lexicora/lexicora-extension/issues/156)) ✅ | Entry and topic detail pages, in `src/lib/export/`. **Copy** writes one clipboard item with HTML and Markdown (`text/plain`): rich editors keep the formatting, and plain-text targets such as Obsidian get Markdown. It uses a readable header, since front matter pasted mid-note shows as raw text. **Download** gives an entry as a `.md` note, or a topic as a `.zip` folder with an index note linking one note per entry. Metadata goes in YAML front matter (source, site, topic, description, tags, language, created/updated, `archived` when set), which Obsidian reads as properties. Blocks are converted without rendering, using an editor instance that is never mounted but shares the app's editor config. Whole-library Markdown export ✅ sits next to the JSON export in Settings → Export: a folder per topic plus an index note, built a topic at a time so memory stays bounded and progress can be shown, with navigation held while it runs. **Later:** a setting to use the readable header in files instead of front matter. Remaining limit: images stay remote URLs and are not downloaded into the archive. |
| **Keyboard shortcuts** ([#145](https://github.com/lexicora/lexicora-extension/issues/145)) ✅ | All defined in `src/constants/shortcuts.ts`, which the manifest, the key handler and Settings → Keyboard Shortcuts all read. ⌘ on macOS means ⌘ and Ctrl on Windows/Linux means Ctrl, never either on either. **Browser-wide** (`background/commands.ts`): ⌃⇧L / Alt+Shift+L opens *and closes* the side panel, ⌃⇧C / Alt+Shift+C captures (the selection if there is one, otherwise the page), ⌃⇧B / Alt+Shift+B bookmarks. The panel always opens synchronously, since the browser only allows opening it in response to a user action; a test enforces this. To close, the background asks an already-open panel to close itself, because it cannot know synchronously whether the panel is open. Firefox's sidebar shortcut toggles natively. **In the side panel** (`hooks/sidepanel/use-panel-shortcuts.ts`): `h` home, `l` library, `s` settings, `t` scroll to top, `/` or ⌘K/Ctrl+K search, `n` new entry (in the current topic when on one), `Shift+N` new topic, `e` or ⌘E/Ctrl+E edit the open entry or topic, `c` capture, `b` bookmark, `?` shortcuts page, ⌘/Ctrl+S save. Back/forward take only the arrow pair (⌘← ⌘→ on macOS, Alt+← Alt+→ elsewhere), because the panel's in-memory router history is invisible to the browser. macOS's other back/forward pair (⌘[ ⌘] on US layouts, ⌘Ö ⌘Ä on Swiss and German ones) and the Home key are deliberately left unbound, so those keep driving the web page and the browser's own instant scroll while the panel has focus. Shift is only significant for letters (`n` vs `Shift+N`); for symbols it is ignored, since which characters need Shift depends on the layout. They only fire while the panel has focus; everything except save is ignored while typing or inside dialogs and menus. **Open:** the mouse side-button navigation (`use-mouse-navigation`) is reported not to work — needs confirming whether that is Firefox only, where the hook was already marked unsupported, or Chromium too. **Not yet verified in a real browser:** the shortcuts on Firefox at all, that the toggle closes the panel, whether Edge accepts `chrome://extensions/shortcuts` from the settings button, and the default keys against each browser's own shortcuts. |
| **Storage and query pass** ✅ | **Purging soft-deleted rows** has three triggers, none of which anything depends on alone: a debounced purge after deletions (`db/cleanup`, one per burst rather than one per delete), RxDB's periodic policy — retuned, since its defaults wait a minute after opening and keep tombstones a month, so an extension session often ended before the first sweep — and the button in Settings → Storage. **Writes** ([#152](https://github.com/lexicora/lexicora-extension/issues/152), [#146](https://github.com/lexicora/lexicora-extension/issues/146)): cascades bulk-remove, the topic archive cascade is one bulk write shared by both call sites and skips entries already in the wanted state, saving an entry writes only the blocks that changed rather than all of them, and saving a form with no edits writes nothing at all — it used to bump `updatedAt` and move the item to the top of the library. **Indexes**: `userId` dropped from all three collections (the field stays), `hostnameUrl` added on entries, `maxLength` added to the indexed timestamps, without which the compound indexes on `updatedAt` could not be used at all. **JSON conversion** ([#176](https://github.com/lexicora/lexicora-extension/issues/176)): investigated and left alone — `toJSON()` is a shallow clone minus four metadata fields, not the deep copy the issue assumed, so the reactive queries cost about nothing. **Key compression** was tried and set aside on `feat/key-compression`: 18% smaller entry rows and 9% smaller blocks, but ~6µs per document written, and storage was never the constraint. |
| **JSON backup and import** ✅ | Settings → Import reads a file Export wrote (`src/lib/backup/`), shows what it holds before anything changes and offers three merge modes — keep mine, take the file's, add only what is missing — comparing records by `updatedAt`, never by RxDB's `_rev`. Nothing already stored is deleted. Tags from a file are brought within the schema's limits rather than trusted. Markdown is export-only. |
| **Editor** ✅ | Beyond the blocks themselves: a wide layout toggle for entry content, an alert block that exports as a GitHub-style callout and is parsed back from pages that use them, content dropped from a page cleaned like a captured selection, a right click on the drag handle selecting the block, and a parser that keeps images in text, visible control text and code beside links. The formatting toolbar is defined once rather than per render, which used to remount it and close any open dropdown. |
| **Cleanup pass** ✅ | Tags are split, de-duplicated and limited with errors the user sees rather than silent truncation (`lib/utils/tags.ts`). A capture that produces nothing now says why — unsupported page, nothing selected, page did not answer — instead of leaving the panel on a loading skeleton. The capture prompt no longer appears next to a side panel opened while its countdown ran, and its font is loaded from the extension's own files rather than a stylesheet a page's `font-src` policy can refuse, which also stopped 251 KB of CSS being injected into every page. The TODO comments were triaged: what is blocked on a hidden feature now says so, preferences became MAYBE. The legacy shadcn editor components went, with eight `@radix-ui` packages, `turndown` and `next-themes`. |
| **Help and settings pages** ✅ | The FAQ no longer describes features that do not exist, and covers bookmarks, images by URL, importing, shortcuts and the storage cleanup. Tips gained alerts, the keys worth knowing and the home page's site group. Settings → General is down to a **privacy policy** page, written from what the code actually does — including that the browser syncs the four settings but never the library, and that it still loads site icons and linked images from their hosts. Settings → Help → Support points at the repository. The licences list was rebuilt from each package's own field: `uuidv7` is Apache-2.0, not MIT, and DOMPurify is dual-licensed. |
| **Empty and sparse UI states** | The popup, side-panel home and top-bar have visible gaps now that the AI surfaces are gated. Needs a layout pass. |
| **Firefox pass** | Nothing here has been checked in a real Firefox: the shortcuts at all, whether the toggle closes the sidebar, the context menu's contexts and separators, the rich clipboard, the zip download and import. The capture prompt and the port-based panel state are Chromium-only by design. |
| **Linting** ✅ | ESLint was replaced by [oxlint](https://oxc.rs): `typescript-eslint` only supports TypeScript below 6.1 and TS 7 has no JavaScript API for its parser, while oxlint's type-aware rules (`oxlint-tsgolint`) are built on TS 7. `bun run lint` runs it with type information in about a second; the config is `.oxlintrc.json`. Existing `eslint-disable` comments still apply. CSS files are no longer linted. **Open:** the first run's findings (55 errors, 128 warnings) are left for the code cleanup pass. |
| **Release prep** | Version bump (the manifest still says 0.1.0), store listing copy and permission justifications, and the licence check ([#183](https://github.com/lexicora/lexicora-extension/issues/183)). The content script still matches `<all_urls>`, which is worth narrowing before submission. Store submission is deferred until the product is judged ready. Done already: the README's scope statement and the privacy policy page, whose text the listing can reuse. |

### Vacuum notes

Deletion in RxDB is soft: documents are flagged `_deleted` and only the cleanup
plugin physically purges them. Lexicora has no undelete — both confirmation
dialogs say the action cannot be undone, and nothing reads `_deleted` — so
tombstones serve no purpose here beyond wasted bytes. (Archiving is a different
thing entirely: `isArchived` is a field on a live document, structurally out of
the purge's reach.)

**What is in place**

- **After deletions** — `db/cleanup` queues a purge, debounced, so deleting a
  topic with all its entries costs one purge rather than one per document. A
  purge scans every document older than the cutoff, so its cost hardly depends
  on how much it reclaims; batching is what keeps it cheap.
- **Periodically** — RxDB's `cleanupPolicy`, retuned in `db/index`: it now
  starts 10s after a collection opens rather than 60s, treats a tombstone as
  cold after a minute rather than a month, and repeats every 2 minutes. The
  loop only runs after writes, so an idle panel does not scan.
- **On request** — "Clean Up Database" in Settings → Storage, and
  "Clear all data", both through the same `cleanupNow`.
- **Cascade deletion** lives in [`src/db/cascade-delete.ts`](../src/db/cascade-delete.ts)
  and is shared by all four call sites, so a new deletion path cannot silently
  orphan blocks. Deleting a topic costs three writes regardless of its size.

**Open, possible future work**

- **Scheduled background cleanup.** `browser.alarms` could wake the service
  worker to purge on a timer, removing the need for the user to ever press the
  button. Two things block it today: the background never opens the database, so
  it would construct a second RxDB instance over the same IndexedDB (legal under
  `multiInstance`, but a full open); and the MV3 background is a classic script,
  not `"type": "module"`, so there is no dynamic `import()` and RxDB plus Dexie
  would be statically bundled into a service worker that currently sits at 28 KB
  and is parsed on every wake. Making the background an ESM worker first would
  let the purge live in a lazily-loaded chunk. If it is built, it should call
  `cleanup(0)` explicitly rather than leave the policy loop running there — a
  service worker killed while holding leadership stalls the side panel's own
  cleanup until the elector times it out.
- **Storage usage display.** `navigator.storage.estimate()` works in extension
  pages and covers IndexedDB, so the number could sit next to the cleanup
  button for context. Two caveats: the estimate is deliberately padded and is
  origin-wide, so it includes `storage.local` and caches — an indicator, not a
  precise figure — and it will not visibly drop right after a cleanup, because
  IndexedDB does not return freed pages to the OS immediately. A "storage is
  filling up" *warning* is not worth building: there is no `unlimitedStorage`
  permission, so the quota is Chrome's default of roughly 60% of free disk,
  which a text library will never approach.

### Explicitly out of scope for v1.0

Supabase sync and the web app (#68, #69), all AI features (#52, #190),
onboarding (#44), the editor backlog (#8, #56, #60, #61, #62), the filter popover (#144), heading map (#164), windowed polish (#179, #180, #182, #184), and the
parking lot at the bottom of this file.

On file upload: images, video, audio and files are added by web address only.
BlockNote shows its upload tab when the editor config defines an upload
handler, and this one deliberately does not: a copy of every file would live
in IndexedDB, inflating both the library and the JSON backup, for a local-only
release with no storage to put it in. The consequence is stated in the FAQ —
those blocks show what is still online, and an export does not carry them.

On the BlockNote upgrade (#195): stay on 0.52. From the next versions the shadcn
variant is built on Base UI instead of Radix, and it was tried — it runs, but
it is fundamentally at odds with the editor's heavily customised CSS selectors
and other custom implementations, so it is worse rather than better. There is
no feature waiting on it. `^0.52.1` already keeps installs on 0.52.x, since a
caret on a 0.x version does not cross minors. If it is ever revisited, the
`prosemirror-model` / `prosemirror-view` overrides in package.json need
checking against whatever versions the new BlockNote expects — they exist to
keep a single copy of each, without which Enter stops creating blocks.

On the filter popover (#144): the library's search takes one `site:` filter,
which covers the case that needed it — "Show all from this site" on the home
page. A stopgap rather than a syntax; real filtering would replace it.

---

## Strategy

> **Note:** the phases below describe the original, larger plan. They are kept
> for context and as the backlog beyond v1.0. Phases 1 and 2 are largely
> complete; Phase 3 onward is out of scope for the v1.0 milestone above.

**Build & Refine**: build features incrementally, then refine the app in passes.

**Current goal**: fully functional offline app before integrating sync (Supabase) or AI features.

---

## Phase 1 — Polish the side-panel to offline-complete

Get the side-panel to a releasable, polished offline state. The components built here will be reused by the windowed extension in Phase 2.

| Priority | Issue(s) | Description | Status |
|---|---|---|---|
| 1 | [#140](https://github.com/lexicora/lexicora-extension/issues/140), [#139](https://github.com/lexicora/lexicora-extension/issues/139), [#123](https://github.com/lexicora/lexicora-extension/issues/123), [#89](https://github.com/lexicora/lexicora-extension/issues/89) | **Toast / notification layer** — install Sonner, wire up: unsaved changes dialogue, undo-archive toast, create-confirmation toasts | ✅ Done |
| 2 | [#100](https://github.com/lexicora/lexicora-extension/issues/100) | **Block navigation in forms** — use react-router's `useBlocker` to prevent accidental data loss | ✅ Done |
| 3 | [#143](https://github.com/lexicora/lexicora-extension/issues/143), [#82](https://github.com/lexicora/lexicora-extension/issues/82) | **Settings page** — user-adjustable prefs: theme, capture suggestion toggle/delay, data management | ✅ Done |
| 4 | [#84](https://github.com/lexicora/lexicora-extension/issues/84), [#86](https://github.com/lexicora/lexicora-extension/issues/86), [#48](https://github.com/lexicora/lexicora-extension/issues/48) | **Infrastructure cleanup** — RxDB schema indexes, remove unused permissions, prune unused packages | ✅ Done |
| 5 | [#134](https://github.com/lexicora/lexicora-extension/issues/134), [#85](https://github.com/lexicora/lexicora-extension/issues/85), [#75](https://github.com/lexicora/lexicora-extension/issues/75), [#78](https://github.com/lexicora/lexicora-extension/issues/78), **new** | **Layout / max-width pass** — see note below. Do this before windowed work so the windowed layout inherits sane constraints. | ✅ Done |
| 6 | [#3](https://github.com/lexicora/lexicora-extension/issues/3) | **Stylize shadcn UI theme** — finalize the overall component theme; sets the visual foundation before the home page redesign | ✅ Done |
| 7 | [#142](https://github.com/lexicora/lexicora-extension/issues/142), [#135](https://github.com/lexicora/lexicora-extension/issues/135), [#155](https://github.com/lexicora/lexicora-extension/issues/155) | **Home page redesign + visual polish** — redesign side-panel home page; adjust light theme to ~gray-50; add topic name above entry title in entry detail | ✅ Done |

### Layout / max-width note (Priority 5)

When the side-panel is narrow, the current layout is fine. When it is wide, two problems emerge:

1. **Entry form metadata fields** (title, URL, tags, etc.) stretch to fill the full panel width because the BlockNote editor drives the container width — these fields should be capped.
2. **Top-bar, page-header, and bottom-nav** need consistent max-width treatment and border-radius when the panel is very wide ([#78](https://github.com/lexicora/lexicora-extension/issues/78)).

The fix: apply a max-width wrapper to metadata field groups only (not the editor itself), so the editor can breathe while form fields stay readable. The topic form already handles this naturally (no editor). This approach will carry over directly to the windowed extension.

A focused GitHub issue should be filed for the entry-form field width specifically.

### Phase 1 cleanup pass ✅ Done

Bug fixes, light-mode follow-ons, and a focused refactor before Phase 2.

---

## Phase 2 — Windowed extension entrypoint

A new WXT entrypoint that opens the extension as a full browser window — same data, same components, but a wider layout optimized for more screen real estate.

**Status: parked.** The entrypoint, the sidebar and the shared pages in
`src/pages/` are built, hidden behind `FEATURES.WINDOWED_APP`; the window home
page, breadcrumb bar and window messaging are not. What exists, the design
decisions and what is open are in
[`docs/windowed_extension/README.md`](windowed_extension/README.md).

Key issues: [#47](https://github.com/lexicora/lexicora-extension/issues/47), [#115](https://github.com/lexicora/lexicora-extension/issues/115), [#112](https://github.com/lexicora/lexicora-extension/issues/112), [#103](https://github.com/lexicora/lexicora-extension/issues/103), [#98](https://github.com/lexicora/lexicora-extension/issues/98)

When it is picked up again, finish with a cleanup pass: consolidate anything
duplicated between the two entrypoints into shared components and hooks, and
tidy routing and messaging patterns that became awkward with a second host.

---

## Phase 3 — Offline feature completeness

| Issue(s) | Description |
|---|---|
| [#144](https://github.com/lexicora/lexicora-extension/issues/144) | Filter dropdown / popover UI for more complex list filtering |
| [#145](https://github.com/lexicora/lexicora-extension/issues/145) | Hot-key support |
| [#164](https://github.com/lexicora/lexicora-extension/issues/164) | Heading map / outline in entry detail and edit view |
| [#166](https://github.com/lexicora/lexicora-extension/issues/166) | Copy confirmation feedback when using copy button / dropdown in detail pages |
| [#173](https://github.com/lexicora/lexicora-extension/issues/173) | Improved loading skeleton for entry create and edit pages |
| [#156](https://github.com/lexicora/lexicora-extension/issues/156) | Download entries / topics as Markdown (alongside copy button; destination set in settings) |
| [#61](https://github.com/lexicora/lexicora-extension/issues/61) | YouTube video block in editor |
| [#56](https://github.com/lexicora/lexicora-extension/issues/56) | Custom code syntax highlighting in editor |
| [#62](https://github.com/lexicora/lexicora-extension/issues/62) | Show toolbar when drag handle is clicked |
| [#60](https://github.com/lexicora/lexicora-extension/issues/60) | Adjust per-block margins (top/bottom) |
| [#168](https://github.com/lexicora/lexicora-extension/issues/168) | Add `text-pretty` class to editor content |
| [#8](https://github.com/lexicora/lexicora-extension/issues/8) | Update BlockNote editor to use shadcn components |
| [#44](https://github.com/lexicora/lexicora-extension/issues/44) | Onboarding flow on first install |
| [#51](https://github.com/lexicora/lexicora-extension/issues/51) | Inconsistent font in capture suggestion toast |
| [#25](https://github.com/lexicora/lexicora-extension/issues/25) | Remove unnecessary `title` attributes on obvious interactive elements |
| [#10](https://github.com/lexicora/lexicora-extension/issues/10) | Extract Lexicora SVG logo into its own exportable component |

### Phase 3 cleanup pass (critical — pre-Supabase gate)

This is the most important cleanup. Before any Supabase code is written, the data layer must be solid — sync bugs are the hardest to debug, and messy offline code compounds that significantly:

- `src/db/` — ensure collection hooks, middleware, and query patterns are clean and consistent
- RxDB schema and migration strategies reviewed and tidy
- Settings storage patterns consistent across all `WxtStorageItem` usage
- Remove any soft-delete / orphaned data that accumulated during Phase 3
- Final dead code sweep across the whole codebase

---

## DB preparation — focused data layer effort (before Supabase)

A dedicated pass to get the data layer solid before any sync code is written. Sync bugs are the hardest to debug — messy offline DB code compounds that significantly.

| Issue(s) | Description |
|---|---|
| [#153](https://github.com/lexicora/lexicora-extension/issues/153) | Fix RxDB soft-delete so "clear all data" actually purges documents |
| [#152](https://github.com/lexicora/lexicora-extension/issues/152) | Replace per-document remove loops with `bulkRemove`; audit RxDB operator usage |
| [#176](https://github.com/lexicora/lexicora-extension/issues/176) | RxDB JSON conversion may be completely unnecessary — investigate and remove if so |
| [#131](https://github.com/lexicora/lexicora-extension/issues/131) | Deleted data cleanup — soft-delete purge strategy |

This overlaps with the Phase 3 cleanup pass for DB concerns — run them together as one focused effort.

---

## Phase 4 — Sync + AI (after offline is solid)

| Issue(s) | Description |
|---|---|
| [#69](https://github.com/lexicora/lexicora-extension/issues/69) | Integrate Supabase with extension + web-app |
| [#68](https://github.com/lexicora/lexicora-extension/issues/68) | Create web-app (Supabase, auth, sync) |
| [#146](https://github.com/lexicora/lexicora-extension/issues/146) | Minimize updating unchanged data to reduce sync payload |
| [#52](https://github.com/lexicora/lexicora-extension/issues/52) | Disable/enable all AI setting |

---

## Parking lot (needs-info / low priority)

Issues that need more thought before scheduling:

- [#175](https://github.com/lexicora/lexicora-extension/issues/175) — Future: replace port-based side-panel detection with direct `@webext-core/messaging` ping
- [#174](https://github.com/lexicora/lexicora-extension/issues/174) — Potentially make bottom-navigation icon animations subtler
- [#172](https://github.com/lexicora/lexicora-extension/issues/172) — Potentially disable form submit on Enter when editing form fields
- [#170](https://github.com/lexicora/lexicora-extension/issues/170) — Potentially add pin as dropdown in forms or remove favorite toggle
- [#165](https://github.com/lexicora/lexicora-extension/issues/165) — Potentially add subtle border / refracting effect on list items
- [#161](https://github.com/lexicora/lexicora-extension/issues/161) — Potentially add full-screen / full-width toggle for editable editors
- [#160](https://github.com/lexicora/lexicora-extension/issues/160) — Potentially switch monospace font to Cascadia Mono
- [#104](https://github.com/lexicora/lexicora-extension/issues/104) — Optimize React with AI
- [#102](https://github.com/lexicora/lexicora-extension/issues/102) — Prompt input as its own window
- [#87](https://github.com/lexicora/lexicora-extension/issues/87) — Rename "Entries" tab
- [#83](https://github.com/lexicora/lexicora-extension/issues/83) — Remove settings from bottom nav
- [#80](https://github.com/lexicora/lexicora-extension/issues/80) — Auto-create topic from site metadata
- [#79](https://github.com/lexicora/lexicora-extension/issues/79) — Example prompts dropdown in prompt input
- [#74](https://github.com/lexicora/lexicora-extension/issues/74) — Compact page-header option even when at top
- [#73](https://github.com/lexicora/lexicora-extension/issues/73) — Reduce blur / reactive backdrop in page-header
- [#71](https://github.com/lexicora/lexicora-extension/issues/71) — `@webext-core/match-patterns` for URL matching
- [#59](https://github.com/lexicora/lexicora-extension/issues/59) — Hide link hint when side-panel is its own window
- [#53](https://github.com/lexicora/lexicora-extension/issues/53) — Setting: how new captures replace editor content
- [#37](https://github.com/lexicora/lexicora-extension/issues/37) — Drag-and-drop selected content bug in editor
