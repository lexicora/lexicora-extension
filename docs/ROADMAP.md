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
| **Bookmark-only capture** | Capture a page from its metadata alone — title, URL, favicon, site name, description — with no page content and no editor blocks. Essentially a "super bookmark": faster than a full capture, useful for pages worth keeping but not worth reading into the library. Should sit alongside the existing capture action rather than replacing it. |
| **Empty and sparse UI states** | The popup, side-panel home and top-bar have visible gaps now that the AI surfaces are gated. Needs a layout pass. |
| **ESLint** | The config currently fails to run: `typescript-eslint` does not support TypeScript 7. No `lint` script exists either. |
| **Release prep** | Version bump, README scope statement, privacy policy, store listing copy and permission justifications. Store submission is deferred until the product is judged ready. |

### Explicitly out of scope for v1.0

Supabase sync and the web app (#68, #69), all AI features (#52, #190),
onboarding (#44), hot-keys (#145), Markdown export (#156), the editor backlog
(#8, #56, #60, #61, #62), filter popover (#144), heading map (#164), windowed
polish (#179, #180, #182, #184), and the parking lot at the bottom of this file.

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
