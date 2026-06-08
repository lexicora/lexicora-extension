# Lexicora Extension - Project Context

## Project Overview
Lexicora Extension is a browser extension for the Lexicora platform, designed to help users capture, organize, and manage information from the web. It provides features like page capturing, selection-based entry creation, and a sidepanel for managing entries and topics.

### Main Technologies
- **Framework:** [WXT](https://wxt.dev/) (Web Extension Toolbox)
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4, Radix UI, CSS Modules
- **Database:** [RxDB](https://rxdb.info/) with Dexie (IndexedDB) storage
- **Editor:** [BlockNote](https://www.blocknotejs.org/) (built on Prosemirror/Tiptap)
- **Messaging:** `@webext-core/messaging`
- **Routing:** React Router (MemoryRouter for sidepanel)

## Building and Running

### Key Commands
- `bun dev`: Starts the extension in development mode with hot-reloading.
- `bun dev:firefox`: Starts development mode specifically for Firefox.
- `bun build`: Builds the extension for production.
- `bun zip`: Packages the built extension into a ZIP file for distribution.
- `bun compile`: Runs TypeScript type checking without emitting files.
- `bun postinstall`: Prepares WXT (runs automatically after installation).

## Project Structure
- `src/entrypoints/`: Contains the entry points for different extension contexts:
    - `background/`: Background script for extension-level events and persistent state.
    - `content/`: Content scripts that run in the context of web pages.
    - `sidepanel/`: The main UI of the extension, providing a persistent sidebar.
    - `popup/`: The small popup UI that appears when clicking the extension icon.
- `src/db/`: RxDB database configuration and schemas (`topic`, `entry`, `block`).
- `src/components/`: Reusable React components:
    - `ui/`: Core UI components (buttons, inputs, etc., inspired by shadcn/ui).
    - `editor/`: BlockNote-based editor configuration and components.
    - `forms/`: Form components for entries and topics.
- `src/hooks/`: Custom React hooks for extension-specific functionality (e.g., storage, messaging, sidepanel interaction).
- `src/lib/`: Utility functions and shared logic (API, messaging, theme helpers, document parsing).
- `src/types/`: TypeScript type definitions.

## Development Conventions

### Messaging
The extension uses `@webext-core/messaging` for type-safe messaging between different contexts (background, content, sidepanel). Define message protocols in `src/lib/messaging.ts`.

### Database (RxDB)
Data persistence is handled by RxDB. Collections and schemas are defined in `src/db/schemas/`. Use `getDb()` from `src/db/index.ts` to get the database instance.

### Styling
- **Tailwind CSS 4:** Used for most styling needs.
- **CSS Modules:** Used for component-specific styles where appropriate (e.g., `*.module.css`).
- **Global Styles:** Found in `src/assets/styles/`.

### Context Parity
Be mindful of feature parity between browsers (Chrome vs. Firefox). Some APIs (like `sidePanel` vs `sidebarAction`) require conditional logic or polyfills, which WXT helps manage.

### Editor
The project uses BlockNote for rich-text editing. Custom blocks and themes should be defined in `src/components/editor/`.
