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
| **Export and rich copy** ([#156](https://github.com/lexicora/lexicora-extension/issues/156)) ✅ | Entry and topic detail pages, in `src/lib/export/`. **Copy** writes one clipboard item with HTML and Markdown (`text/plain`): rich editors keep the formatting, and plain-text targets such as Obsidian get Markdown. It uses a readable header, since front matter pasted mid-note shows as raw text. **Download** gives an entry as a `.md` note, or a topic as a `.zip` folder with an index note linking one note per entry. Metadata goes in YAML front matter (source, site, topic, description, tags, language, created/updated, `archived` when set), which Obsidian reads as properties. Blocks are converted without rendering, using an editor instance that is never mounted but shares the app's editor config. **Later:** whole-library Markdown export in Settings → Data Management next to the JSON export, and a setting to use the readable header in files instead of front matter. Remaining limit: images stay remote URLs and are not downloaded into the archive. |
| **Keyboard shortcuts** ([#145](https://github.com/lexicora/lexicora-extension/issues/145)) ✅ | All defined in `src/constants/shortcuts.ts`, which the manifest, the key handler and Settings → Keyboard Shortcuts all read. **Browser-wide** (manifest `commands`, handled in `background/commands.ts`): open side panel, capture, and bookmark on ⌃⇧L/C/B on macOS and Alt+Shift+L/C/B elsewhere. Capture takes the selection if there is one, otherwise the page. Firefox's open shortcut is its built-in `_execute_sidebar_action`. The panel is opened synchronously before any `await`, because the browser only allows it in response to a user action; a test enforces this. **In the side panel** (`hooks/sidepanel/use-panel-shortcuts.ts`): `/` search, `n` new entry (in the current topic when on one), `c` capture, `b` bookmark, `?` shortcuts page, and ⌘/Ctrl+S to save. These only fire while the panel has focus, and single keys are ignored while typing or inside dialogs and menus. No browser-claimed keys are used. The settings page shows live bindings (a skipped default reads "Not set") and opens the browser's shortcut settings. **Not yet verified in a real browser:** whether Edge accepts `chrome://extensions/shortcuts` from the settings button, and the default keys against each browser's own shortcuts. |
| **Empty and sparse UI states** | The popup, side-panel home and top-bar have visible gaps now that the AI surfaces are gated. Needs a layout pass. |
| **ESLint** | The config currently fails to run: `typescript-eslint` does not support TypeScript 7. No `lint` script exists either. |
| **Release prep** | Version bump, README scope statement, privacy policy, store listing copy and permission justifications. Store submission is deferred until the product is judged ready. |

### Vacuum notes

Deletion in RxDB is soft: documents are flagged `_deleted` and only the cleanup
plugin physically purges them. Lexicora has no undelete — both confirmation
dialogs say the action cannot be undone, and nothing reads `_deleted` — so
tombstones serve no purpose here beyond wasted bytes. (Archiving is a different
thing entirely: `isArchived` is a field on a live document, structurally out of
the purge's reach.)

**What is in place**

- **Settings → Data Management → "Clean Up Database"** runs `cleanup(0)` on all
  three collections. It is the guaranteed path, and it is deliberately manual:
  a purge scans every document older than the cutoff to find the tombstones
  among them, so a call costs roughly the same whether it reclaims one row or a
  thousand. Cost tracks how often it runs, not how much it frees — which makes
  one batched, user-initiated action the cheapest possible schedule. Every
  action on the page is disabled while it runs, matching the write lock the
  purge already holds.
- **The automatic `cleanupPolicy`** (`minimumDeletedTime: 1 day`) still runs,
  unchanged. It fires 60s after a collection opens, then after writes every 5
  minutes. Because only `RxDBProvider` opens the database — never the background
  — this only happens while the side panel or window stays open a full minute,
  so it is opportunistic rather than reliable. That is fine now that the button
  exists as the guarantee.
- **Cascade deletion** lives in [`src/db/cascade-delete.ts`](../src/db/cascade-delete.ts)
  and is shared by all four call sites, so a new deletion path cannot silently
  orphan blocks. It is also a bulk operation: deleting a topic costs three
  writes regardless of its size, where the previous per-document loop cost one
  write per block.

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
onboarding (#44), the editor backlog (#8, #56, #60, #61, #62), filter popover
(#144), heading map (#164), windowed polish (#179, #180, #182, #184), and the
parking lot at the bottom of this file.

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

See [`docs/windowed_extension/README.md`](windowed_extension/README.md) for full spec.

Key issues: [#47](https://github.com/lexicora/lexicora-extension/issues/47), [#115](https://github.com/lexicora/lexicora-extension/issues/115), [#112](https://github.com/lexicora/lexicora-extension/issues/112), [#103](https://github.com/lexicora/lexicora-extension/issues/103), [#98](https://github.com/lexicora/lexicora-extension/issues/98)

Build order:
1. New `window/` entrypoint (WXT `tabs` entrypoint opened as a standalone window)
2. Wide layout shell — persistent left sidebar for navigation, right content area
3. Adapted pages — reuse side-panel route components where possible, swap in larger variants where the layout differs
4. Background messaging for the window instance — unique window ID handling ([#103](https://github.com/lexicora/lexicora-extension/issues/103))

### Phase 2 cleanup pass

Before starting Phase 3, do a short focused refactor:

- Consolidate anything duplicated between the side-panel and windowed entrypoints into shared components/hooks
- Clean up routing and messaging patterns that became awkward when the second entrypoint was added
- Audit `src/entrypoints/` for any copy-pasted structure that should be extracted to `src/components/` or `src/hooks/`

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
