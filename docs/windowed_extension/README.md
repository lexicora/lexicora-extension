# Windowed Extension — Concept & Spec

## What it is

A new WXT entrypoint that opens Lexicora as a standalone browser window — not pinned to the side of the page like the side-panel, but a full resizable window the user can position anywhere. Same RxDB data, same components, but a wider layout built for more screen real estate.

Triggered from the browser toolbar popup or a context menu action.

## Why it's different from the side-panel

| Dimension | Side-panel | Windowed extension |
|---|---|---|
| Width | Narrow (typically 300–450px) | Wide (600px+, resizable) |
| Navigation | Bottom tab bar | Persistent left sidebar |
| Page headers | Compact, scroll-aware | Can afford larger/richer headers |
| Editor | Full-width within panel | Constrained content column, editor breathes |
| Context | Pinned to a browser tab | Floats independently |

## Layout shell

```
┌──────────────┬──────────────────────────────┐
│  Home        │                              │
│  Entries     │   Content area               │
│  Topics      │   (route outlet)             │
│  Settings    │                              │
│  ──────────  │                              │
│  PINNED      │                              │
│  › Topic A   │                              │
│  › Topic B   │                              │
│  ──────────  │                              │
│  RECENT      │                              │
│  › Topic C   │                              │
└──────────────┴──────────────────────────────┘
```

- **Left sidebar**: replaces the bottom tab bar. Built with the shadcn `Sidebar` component — gives collapsible behavior, `useSidebar()` hook, and a keyboard shortcut out of the box.
- **Content area**: renders the current route's page component.
- **No top-bar or bottom navigation** in the windowed layout.

## Sidebar sections

### 1. Core nav (top)
Fixed nav links: Home, Entries, Topics, Settings. Entries and Topics link directly to `/library?tab=entries` and `/library?tab=topics` respectively — the sidebar *is* the tab switcher, so the inner tab bar inside `LibraryPage` is hidden in windowed mode via a `hideTabBar` prop or layout context.

### 2. Pinned / Favorites
Pinned topics from RxDB (`isPinned: true`, sorted by `updatedAt` desc). Topics only for now — entries can be added later when the sidebar design is refined. The `isPinned` field already exists on both collections.

### 3. Recent
Most recently edited topics sorted by `updatedAt` desc from RxDB. This is an approximation of "recently viewed" and is good enough for Phase 2.

**True view tracking** (a `viewedAt` timestamp in WXT local storage, not RxDB) is a future feature scoped to both the windowed extension and the side-panel together. Out of scope for Phase 2. Storing view events in RxDB would generate unnecessary `_rev` revisions and future sync overhead for data that has not meaningfully changed.

## Entrypoint

Use WXT's `tabs` entrypoint type — this creates a full-page extension tab opened as a window via `chrome.windows.create`.

Location: `src/entrypoints/window/` (already created).

## Code sharing — page architecture

Shared route-level pages live in `src/pages/`, not inside either entrypoint. Both `sidepanel/App.tsx` and `window/App.tsx` import routes from `src/pages/`. Pages are distinct from components: they own routing, data, and layout; `src/components/` remains for reusable UI primitives.

```
src/
  pages/               ← shared route pages (library, settings, entry/topic CRUD, etc.)
  components/          ← reusable UI components
  entrypoints/
    sidepanel/
      pages/           ← side-panel-only: home/ (with capture UI)
    window/
      pages/           ← window-only: home/ (richer dashboard, no capture UI)
```

**Migration step (first Phase 2 commit)**: move `src/entrypoints/sidepanel/pages/` (everything except `home/`) to `src/pages/`. Pure file move, no logic changes. Must happen before building the window shell to avoid cross-entrypoint imports.

## Library page — tab suppression

`LibraryPage` (shared in `src/pages/`) works for both entrypoints. In the windowed shell the sidebar nav exposes Entries and Topics as separate items, making the inner tab bar redundant. A `hideTabBar` prop (or a layout context value) suppresses the tab switcher UI when `LibraryPage` runs inside the windowed shell.

## Home pages

| Entrypoint | Location | Content |
|---|---|---|
| Side-panel | `src/entrypoints/sidepanel/pages/home/` | Capture UI, AI prompt, pinned topics |
| Window | `src/entrypoints/window/pages/home/` | Richer dashboard — most relevant content upfront, no capture UI |

The windowed home page is its own design task. It can start as a placeholder in Phase 2 and be fully designed separately.

## Routing

The windowed entrypoint gets its own `App.tsx` with:
- A different layout wrapper (shadcn Sidebar + content area, no top-bar, no bottom nav)
- The same `RouterListener` for background-driven navigation
- Its own `windowId` resolution (see [#103](https://github.com/lexicora/lexicora-extension/issues/103))

## Messaging

Background → window push messages need a `windowId` discriminator, same as the side-panel. The windowed entrypoint registers its own `windowId` via a dedicated message type (see [#103](https://github.com/lexicora/lexicora-extension/issues/103)).

## Breadcrumb

The content area has a breadcrumb bar at the top (e.g. `Library / Topics / Topic Name`). This replaces the `PageHeader` back-button pattern from the side-panel — in the windowed layout the user always knows where they are from the sidebar state, so the breadcrumb is the right navigation affordance instead of a compact back button.

Use the shadcn `Breadcrumb` component (`docs/windowed_extension/sidebar-reference/ui/breadcrumb.tsx`). The breadcrumb bar also houses page-level actions (pin, more menu) — see `nav-actions.tsx` in the reference for the pattern.

## Reference files

`docs/windowed_extension/sidebar-reference/` contains a generated shadcn sidebar example. Imports reference `@/components/` which maps to `src/components/` in this project. Use these as implementation reference, not as copy-paste — adapt them to use `react-router-dom` `NavLink` instead of `<a>` tags and wire data from RxDB instead of static arrays.

| Reference file | Maps to in Lexicora |
|---|---|
| `app-sidebar.tsx` | `src/entrypoints/window/app-sidebar.tsx` — root sidebar component |
| `nav-main.tsx` | Core nav section: Home, Entries, Topics (top of sidebar) |
| `nav-favorites.tsx` | Pinned topics section — wire to RxDB `isPinned: true` query |
| `nav-workspaces.tsx` | Becomes `NavRecent` — recent topics sorted by `updatedAt` desc |
| `nav-secondary.tsx` | Settings link at the bottom of the sidebar |
| `nav-actions.tsx` | Breadcrumb bar + page actions at the top of the content area |
| `team-switcher.tsx` | Not used — replace with Lexicora logo/app name in `SidebarHeader` |
| `ui/sidebar.tsx` | Already in `src/components/ui/sidebar.tsx` (shadcn) |
| `ui/breadcrumb.tsx` | Already in `src/components/ui/breadcrumb.tsx` (shadcn) |

## Component strategy

Prefer building **layout-aware variants** of existing components rather than forking them:
- `PageHeader` — already has a compact/expanded scroll variant; a `size` prop for a larger windowed variant can be added when needed ([#98](https://github.com/lexicora/lexicora-extension/issues/98))
- Form field containers — reuse the max-width wrappers from the Phase 1 layout pass
- Navigation — the shared `NavItems` list (extracted in the Phase 1 cleanup) feeds both the bottom tab bar (side-panel) and the sidebar (windowed)

## Build order

1. **Migrate shared pages** — move `src/entrypoints/sidepanel/pages/` (all except `home/`) to `src/pages/`. Update all imports. Verify `bun run compile` passes.
2. **Window shell** — build `window/App.tsx` with the shadcn Sidebar layout, wiring up shared routes from `src/pages/` and the `RouterListener`.
3. **Sidebar content** — wire up pinned topics and recent-by-`updatedAt` topics into sidebar sections.
4. **Library tab suppression** — add `hideTabBar` prop/context to `LibraryPage`; wire sidebar Entries/Topics nav items to the correct `?tab=` params.
5. **Window messaging** — unique `windowId` registration ([#103](https://github.com/lexicora/lexicora-extension/issues/103)).
6. **Window home page** — design and build the richer dashboard home (separate task).

## Related issues

- [#47](https://github.com/lexicora/lexicora-extension/issues/47) — Make sidepanel UI be its own window
- [#115](https://github.com/lexicora/lexicora-extension/issues/115) — New app with similar pages but different layout
- [#112](https://github.com/lexicora/lexicora-extension/issues/112) — Optimize for wider size with sidebar navigation
- [#103](https://github.com/lexicora/lexicora-extension/issues/103) — Window instance ID in messaging
- [#98](https://github.com/lexicora/lexicora-extension/issues/98) — Larger page-header variant
- [#59](https://github.com/lexicora/lexicora-extension/issues/59) — Hide link hint when running as window
