# Lexicora Extension — Roadmap

## Strategy

**Build & Refine**: build features incrementally, then refine the app in passes.

**Current goal**: fully functional offline app before integrating sync (Supabase) or AI features.

---

## Phase 1 — Polish the side-panel to offline-complete

Get the side-panel to a releasable, polished offline state. The components built here will be reused by the windowed extension in Phase 2.

| Priority | Issue(s) | Description | Status |
|---|---|---|---|
| 1 | [#140](https://github.com/lexicora/lexicora-extension/issues/140), [#139](https://github.com/lexicora/lexicora-extension/issues/139), [#123](https://github.com/lexicora/lexicora-extension/issues/123), [#89](https://github.com/lexicora/lexicora-extension/issues/89) | **Toast / notification layer** — install Sonner, wire up: unsaved changes dialogue, create-confirmation toasts | ✅ Done |
| 2 | [#100](https://github.com/lexicora/lexicora-extension/issues/100) | **Block navigation in forms** — use react-router's `useBlocker` to prevent accidental data loss | ✅ Done |
| 3 | [#143](https://github.com/lexicora/lexicora-extension/issues/143), [#82](https://github.com/lexicora/lexicora-extension/issues/82), [#52](https://github.com/lexicora/lexicora-extension/issues/52) | **Settings page** — user-adjustable prefs: theme, capture suggestion toggle/delay, disable-all-AI toggle, data management | |
| 4 | [#134](https://github.com/lexicora/lexicora-extension/issues/134), [#85](https://github.com/lexicora/lexicora-extension/issues/85), [#75](https://github.com/lexicora/lexicora-extension/issues/75), [#78](https://github.com/lexicora/lexicora-extension/issues/78), **new** | **Layout / max-width pass** — see note below. Do this before windowed work so the windowed layout inherits sane constraints. | |
| 5 | [#142](https://github.com/lexicora/lexicora-extension/issues/142), [#135](https://github.com/lexicora/lexicora-extension/issues/135) | **Home page redesign + light theme** — redesign side-panel home page; adjust light theme background to ~gray-50 instead of pure white | |
| 6 | [#84](https://github.com/lexicora/lexicora-extension/issues/84), [#86](https://github.com/lexicora/lexicora-extension/issues/86), [#48](https://github.com/lexicora/lexicora-extension/issues/48) | **Infrastructure cleanup** — add RxDB schema indexes on queried fields; remove unused browser permissions; prune unused packages | |

### Layout / max-width note (Priority 4)

When the side-panel is narrow, the current layout is fine. When it is wide, two problems emerge:

1. **Entry form metadata fields** (title, URL, tags, etc.) stretch to fill the full panel width because the BlockNote editor drives the container width — these fields should be capped.
2. **Top-bar, page-header, and bottom-nav** need consistent max-width treatment and border-radius when the panel is very wide ([#78](https://github.com/lexicora/lexicora-extension/issues/78)).

The fix: apply a max-width wrapper to metadata field groups only (not the editor itself), so the editor can breathe while form fields stay readable. The topic form already handles this naturally (no editor). This approach will carry over directly to the windowed extension.

A focused GitHub issue should be filed for the entry-form field width specifically.

---

## Phase 2 — Windowed extension entrypoint

A new WXT entrypoint that opens the extension as a full browser window — same data, same components, but a wider layout optimized for more screen real estate.

See [`docs/WINDOWED_EXTENSION.md`](WINDOWED_EXTENSION.md) for full spec.

Key issues: [#47](https://github.com/lexicora/lexicora-extension/issues/47), [#115](https://github.com/lexicora/lexicora-extension/issues/115), [#112](https://github.com/lexicora/lexicora-extension/issues/112), [#103](https://github.com/lexicora/lexicora-extension/issues/103), [#98](https://github.com/lexicora/lexicora-extension/issues/98)

Build order:
1. New `window/` entrypoint (WXT `tabs` entrypoint opened as a standalone window)
2. Wide layout shell — persistent left sidebar for navigation, right content area
3. Adapted pages — reuse side-panel route components where possible, swap in larger variants where the layout differs
4. Background messaging for the window instance — unique window ID handling ([#103](https://github.com/lexicora/lexicora-extension/issues/103))

---

## Phase 3 — Offline feature completeness

| Issue(s) | Description |
|---|---|
| [#61](https://github.com/lexicora/lexicora-extension/issues/61) | YouTube video block in editor |
| [#56](https://github.com/lexicora/lexicora-extension/issues/56) | Custom code syntax highlighting in editor |
| [#62](https://github.com/lexicora/lexicora-extension/issues/62) | Show toolbar when drag handle is clicked |
| [#44](https://github.com/lexicora/lexicora-extension/issues/44) | Onboarding flow on first install |
| [#131](https://github.com/lexicora/lexicora-extension/issues/131) | Deleted data cleanup (RxDB soft-delete purge) |
| [#51](https://github.com/lexicora/lexicora-extension/issues/51) | Inconsistent font in capture suggestion toast |
| [#25](https://github.com/lexicora/lexicora-extension/issues/25) | Remove unnecessary `title` attributes on obvious interactive elements |
| [#10](https://github.com/lexicora/lexicora-extension/issues/10) | Extract Lexicora SVG logo into its own exportable component |

---

## Phase 4 — Sync + AI (after offline is solid)

| Issue(s) | Description |
|---|---|
| [#69](https://github.com/lexicora/lexicora-extension/issues/69) | Integrate Supabase with extension + web-app |
| [#68](https://github.com/lexicora/lexicora-extension/issues/68) | Create web-app (Supabase, auth, sync) |
| [#52](https://github.com/lexicora/lexicora-extension/issues/52) | Disable/enable all AI setting (already in Phase 1 settings; full AI integration here) |

---

## Parking lot (needs-info / low priority)

Issues that need more thought before scheduling:

- [#130](https://github.com/lexicora/lexicora-extension/issues/130) — Potentially consolidate all messaging to `@webext-core/messaging`
- [#115](https://github.com/lexicora/lexicora-extension/issues/115) — Windowed extension: new pages with different layout (→ Phase 2)
- [#112](https://github.com/lexicora/lexicora-extension/issues/112) — Windowed extension: sidebar nav layout (→ Phase 2)
- [#104](https://github.com/lexicora/lexicora-extension/issues/104) — Optimize React with AI
- [#102](https://github.com/lexicora/lexicora-extension/issues/102) — Prompt input as its own window
- [#99](https://github.com/lexicora/lexicora-extension/issues/99) — Disable UI during save
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
- [#110](https://github.com/lexicora/lexicora-extension/issues/110) — Icons in dropdown items
