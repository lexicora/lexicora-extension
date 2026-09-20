# Lexicora — Capture, Structure, Retrieve Knowledge Instantly

> A browser-first knowledge capture and retrieval tool for developers, students, and AI-heavy users.

Lexicora is built for people who consume large amounts of information on the web. It focuses on **fast capture**, **clear structure**, and **instant retrieval** — without forcing users into complex workspaces, deep nesting, or heavy manual organization.

It is intentionally opinionated: not a general-purpose note-taking app, not a workspace OS, not a social platform. It is a **tool** — optimized for turning web content into usable, searchable knowledge with minimal friction.

---

## The Problem

Most valuable knowledge today lives in AI chat conversations, documentation sites, blogs, and Wikipedia — scattered across tabs, sessions, and tools. Once consumed, it is usually lost, buried, or extremely hard to retrieve later.

Lexicora solves this by letting users:

- capture web content directly from the browser
- clean and structure it automatically
- store it in a fast, searchable local knowledge base
- retrieve it instantly when needed

All without changing how they already browse or use AI tools.

---

## How It Works

1. Browse the web — AI chats, docs, articles, wikis, anywhere
2. The extension detects relevant content or allows manual selection
3. Save with a single action from the browser side panel
4. Lexicora cleans the content and preserves its structure (headings, paragraphs, lists, code, tables, callouts)
5. Saved knowledge becomes instantly searchable
6. When revisiting a related page, Lexicora can surface existing saved knowledge

Most interactions happen inside the **browser side panel**, keeping context and flow intact.

---

## Design Principles

- **Capture-first** — saving knowledge should be effortless
- **Retrieval-first** — finding saved knowledge must be instant
- **Speed over complexity** — no heavy UI, no deep nesting
- **Flat structure by design** — intentional limits improve clarity
- **Keyboard-driven** — minimal mouse usage
- **Browser-native** — works where knowledge is consumed
- **AI-optional** — useful without AI, powerful with it
- **Offline-friendly** — designed with offline availability in mind

---

## Key Features

- Browser extension with side panel UI (Chrome, Edge, Firefox)
- Capture a page's content, or bookmark it for the link alone
- Web content cleaned by its own parser, into the blocks the editor uses
- Block-based structured storage with the BlockNote editor
- Capture from the panel, the toolbar popup, the right-click menu or a keyboard shortcut
- Fast full-text search across all saved knowledge, with a `site:` filter
- Automatic capture suggestion toast on relevant pages
- Export as Markdown (one note, a topic, or the whole library as a zip) and a JSON backup that can be imported again
- Offline-first local database (RxDB)
- Theme support (light / dark)
- Keyboard-driven navigation, browser-wide and in the panel

### v1.0 scope

v1.0 ships as a polished, **offline-only** extension: everything stays on the
device and the extension makes no network requests of its own. AI, accounts
and the standalone window are built but hidden behind feature flags
(`src/constants/features.ts`), so nothing promises an unbuilt feature. See
[`docs/ROADMAP.md`](docs/ROADMAP.md).

### Planned / Beyond v1.0

- AI-assisted summarization and refinement
- Sync across devices, and a web app for expanded views and management
- Light sharing and collaboration
- The standalone windowed app, which is built but parked

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Extension framework | [WXT](https://wxt.dev) (Chrome MV3 / Firefox MV2) |
| UI | [React 19](https://react.dev), [TailwindCSS v4](https://tailwindcss.com), [shadcn-ui](https://ui.shadcn.com/) (built on [Radix UI](https://www.radix-ui.com/) + [Base UI](https://base-ui.com/)) |
| Routing | [React Router](https://reactrouter.com/) |
| Editor | [BlockNote](https://www.blocknotejs.org//) |
| Local database | [RxDB](https://rxdb.info/) + [Dexie](https://dexie.org/) |
| Messaging | [@webext-core/messaging](https://github.com/aklinker1/webext-core) |
| Content parsing | Its own DOM parser (`src/lib/utils/document-parser.ts`) + [DOMPurify](https://github.com/cure53/DOMPurify) |
| Export | [fflate](https://github.com/101arrowz/fflate) for zip archives |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Testing | [Vitest](https://vitest.dev/) + WXT's `fakeBrowser` |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Package manager | [Bun](https://bun.sh) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Chrome, Edge, or Firefox (for loading the extension)

### Install Dependencies

```bash
bun install
```

### Development

```bash
bun run dev              # Chrome (MV3) with hot module replacement
bun run dev:edge         # Edge dev server
bun run dev:firefox      # Firefox (MV2) dev server
```

Load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `.output/chrome-mv3` directory

### Build

```bash
bun run build            # Production build for Chrome
bun run build:firefox    # Production build for Firefox
bun run zip              # Package for Chrome Web Store
bun run zip:firefox      # Package for AMO (Firefox Add-ons)
```

### Type-Check and Lint

```bash
bun run compile          # TypeScript type-check only (no emit)
bun run lint             # oxlint, including type-aware rules
```

ESLint is not used: `typescript-eslint` does not support TypeScript 7, while
oxlint's type-aware rules run on it. The config is `.oxlintrc.json`.

### Tests

```bash
bun run test             # Single-pass unit tests
bun run test:watch       # Watch mode
bun run test:coverage    # With V8 coverage report
```

Tests use Vitest with WXT's `WxtVitest()` plugin and `fakeBrowser` for in-memory extension API stubs — no real browser required. Test files live in `__tests__/` directories co-located with the code they test.

---

## Architecture Overview

### Entrypoints

| Entrypoint | Context | Purpose |
| --- | --- | --- |
| `background/` | Service worker | Orchestrates messaging, context menus, port tracking |
| `content/` | Every page | Injects capture-suggestion toast; relays page data |
| `sidepanel/` | Side panel | Full React app — primary user-facing UI |
| `popup/` | Browser toolbar | Minimal React app (currently a home page only) |

### Data Layer

`src/db/` holds the local-first RxDB database. Three collections:

- **topics** — top-level grouping containers
- **entries** — web captures with metadata (`url`, `faviconUrl`, `isPinned`, `isArchived`, etc.)
- **blocks** — rich text blocks (BlockNote) attached to entries

A `searchBlob` field on topics and entries is a denormalized lowercase string for full-text search, auto-populated by RxDB middleware — never set it manually.

### Settings & Storage

Stored via WXT's storage API:

- `sync:` prefix — synced across devices (theme, capture settings)
- `session:` prefix — transient RAM, cleared on browser close (sidepanel state)

Use the `useAppStorage` hook for reactive access in React components.

---

## Status

Lexicora is under active development. The current milestone is v1.0, the
offline-only extension described above; the backend, web app and AI features
come after it, as the core experience settles.

The core vision remains intentionally narrow: **turning ephemeral web knowledge into permanent, accessible understanding**.

---

## What Lexicora Is Not

Lexicora intentionally avoids becoming a full project management tool, a generic note-taking app, a deeply nested workspace, or a social platform. Those problems are already solved elsewhere — often at the cost of speed and clarity.
