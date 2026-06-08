# CLAUDE.md

For an overview of what Lexicora is, the problem it solves, and its design philosophy, see the [README.md](README.md).

This file focuses on architecture and development guidance for working with the codebase.

## Commands

```bash
bun run dev              # Chrome (MV3) dev server with HMR
bun run dev:edge         # Edge dev server
bun run dev:firefox      # Firefox (MV2) dev server
bun run build            # Production build for Chrome
bun run build:firefox    # Production build for Firefox
bun run zip              # Package for Chrome Web Store
bun run zip:firefox      # Package for AMO
bun run compile          # TypeScript type-check only (no emit)
bun run test             # Run unit tests (Vitest, single pass)
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Run tests with V8 coverage report
```

Type-check with `bun run compile`. Tests use Vitest with WXT's `WxtVitest()` plugin and `fakeBrowser` for in-memory extension API stubs — no real browser needed. Test files live in `__tests__/` directories alongside the code they test.

## Architecture

This is a [WXT](https://wxt.dev)-based browser extension (Chrome MV3 / Firefox MV2) built with React 19, TypeScript, and TailwindCSS v4.

### Entrypoints (`src/entrypoints/`)

| Entrypoint | Context | Purpose |
|---|---|---|
| `background/` | Service worker | Orchestrates messaging, context menus, port tracking |
| `content/` | Every page | Injects capture-suggestion toast UI; relays page data |
| `sidepanel/` | Side panel | Full React app — the primary user-facing UI |
| `popup/` | Browser toolbar popup | Minimal React app (currently a home page only) |

### Data Layer — RxDB + Dexie

`src/db/` holds the local-first database. The singleton is initialized via `getDb()` in `src/db/index.ts` and exposed to React via `RxDBProvider` (`src/providers/rxdb-provider.tsx`).

Three collections:
- **topics** — top-level grouping containers
- **entries** — web captures belonging to a topic; include metadata like `url`, `hostnameUrl`, `faviconUrl`, `isPinned`, `isArchived`
- **blocks** — rich text blocks (BlockNote) attached to entries

The `searchBlob` field on both `topics` and `entries` is a denormalized lowercase string built by `src/db/search-blob.ts` and auto-populated by RxDB `preInsert`/`preSave` middleware hooks in `src/db/index.ts`. Never set `searchBlob` manually.

Schema migrations are versioned (currently `version: 0` on all collections). RxDB requires a migration strategy when the schema version is bumped.

### Messaging

All extension messaging uses **`@webext-core/messaging`** (`src/lib/messaging.ts`). Message types are defined in `src/constants/messaging.ts` (`MSG` constants) and typed in the `ProtocolMap` interface. `sendMessage` and `onMessage` are the two exported functions used everywhere.

For background → sidepanel push messages (`NAVIGATE_IN_SIDEPANEL`, `SEND_PAGE_SELECTION_DATA`), the background embeds `windowId` in the data envelope. The sidepanel compares `msg.data.windowId` to its own windowId (obtained via `useSidePanelWindowId()` from `SidePanelMessagingProvider`) to filter messages intended for the correct window.

For content script messaging (`GET_PAGE_DATA`, `GET_PAGE_SELECTION_DATA`), native `browser.tabs.sendMessage` / `browser.runtime.onMessage` is used directly for lower latency.

### Settings / Storage

Settings are stored via WXT's storage API (`src/lib/utils/storage/settings.ts`):
- `sync:` prefix — synced across devices (theme, capture-suggestion toggle, delay multiplier)
- `session:` prefix — transient RAM storage, lost on browser close (sidepanel open/closed state)

Use the `useAppStorage` hook (`src/hooks/use-app-storage.ts`) for reactive access to any `WxtStorageItem` in React components.

### Sidepanel UI Structure

The sidepanel uses `react-router-dom` with a **MemoryRouter** (not URL-based). Routes are declared in `src/entrypoints/sidepanel/App.tsx`. Navigation is driven by messages from the background via `RouterListener` (`src/hooks/sidepanel/router-listener.tsx`).

Layout wraps every route: `TopBar` → `Outlet` → `BottomNavigation`, all inside `ScrollObserverProvider` and `SidePanelMessagingProvider` (which resolves and provides the current `windowId`).

### Capture Suggestion Feature

The content script (`src/entrypoints/content/capture/suggestion.ts`) shows a draggable toast after the user has been on a page for a configurable delay. It uses WXT's `createShadowRootUi` to inject isolated CSS into a shadow DOM, avoiding host-page style conflicts. This feature is **not supported on Firefox** due to API limitations; all Firefox-incompatible code is gated with `if (!import.meta.env.FIREFOX)`.

### Firefox vs. Chrome/Edge Parity

Known divergences (marked with `NOTE: Feature parity discrepancy` comments):
- `browser.sidePanel` API → Firefox uses `browser.sidebarAction`
- Capture suggestion toast → unsupported on Firefox
- Port-based sidepanel state tracking → unsupported on Firefox
- `MSG.OPEN_SIDEPANEL` from content script → not usable on Firefox

### Rich Text Editor

Entry content is edited with **BlockNote** (`@blocknote/react`). The editor component lives at `src/components/editor/BlockNoteView.tsx`. Blocks are stored separately in the `blocks` RxDB collection.

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json` and WXT's build config).

## Development Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the phased implementation plan and open issue backlog.

**Current phase**: Phase 1 — Polish the side-panel to offline-complete.
**Current goal**: fully functional offline app before integrating Supabase sync or AI features.

Upcoming major feature: **Windowed extension** (Phase 2) — a new `window/` entrypoint with a wider sidebar-based layout. Spec in [`docs/WINDOWED_EXTENSION.md`](docs/WINDOWED_EXTENSION.md).
