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
| Editor | Full-width within panel | Can have constrained content column beside metadata panel |
| Context | Pinned to a browser tab | Floats independently |

## Layout shell

```
┌─────────────────────────────────────────┐
│  TopBar (logo, search, window actions)  │
├──────────┬──────────────────────────────┤
│          │                              │
│  Left    │   Content area               │
│  Sidebar │   (route outlet)             │
│  (nav)   │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

- **Left sidebar**: persistent navigation (Topics, Entries, Settings, etc.) — replaces the bottom tab bar from the side-panel. Similar to a VitePress/Docusaurus sidebar.
- **Content area**: renders the current route's page component.
- **No bottom navigation** in the windowed layout.

## Entrypoint

Use WXT's `tabs` entrypoint type — this creates a full-page extension tab that can be opened as a window via `chrome.windows.create`.

Location: `src/entrypoints/window/` (mirrors `src/entrypoints/sidepanel/` structure).

## Routing

Reuse the same `react-router-dom` routes and page components from the side-panel where possible. The windowed entrypoint gets its own `App.tsx` with:
- A different layout wrapper (sidebar instead of top-bar + bottom-nav)
- The same `RouterListener` for background-driven navigation
- Its own `windowId` resolution (see [#103](https://github.com/tgmaurer/lexicora-extension/issues/103))

## Pages — reuse vs. adapt

| Page | Strategy |
|---|---|
| Topics list | Reuse — may need wider card layout |
| Topic detail / entries list | Reuse |
| Entry form (edit) | Adapt — metadata fields in a right panel or capped column, editor fills center |
| Entry view | Adapt — wider reading column |
| Settings | Reuse — already form-based |
| Home / dashboard | New — windowed home has more space for overview widgets |

## Messaging

Background → window push messages need a `windowId` discriminator, same as the side-panel. The windowed entrypoint registers its own `windowId` via a dedicated message type (see [#103](https://github.com/tgmaurer/lexicora-extension/issues/103) for the ID strategy).

## Component strategy

Prefer building **layout-aware variants** of existing components rather than forking them:
- `PageHeader` — already has a compact/expanded scroll variant; add a `size` prop for the windowed large variant ([#98](https://github.com/tgmaurer/lexicora-extension/issues/98))
- Form field containers — use the max-width wrapper established in the Phase 1 layout pass
- Navigation — extract a shared `NavItems` list so both the bottom tab bar (side-panel) and the left sidebar (windowed) consume the same items

## Related issues

- [#47](https://github.com/tgmaurer/lexicora-extension/issues/47) — Make sidepanel UI be its own window
- [#115](https://github.com/tgmaurer/lexicora-extension/issues/115) — New app with similar pages but different layout
- [#112](https://github.com/tgmaurer/lexicora-extension/issues/112) — Optimize for wider size with sidebar navigation
- [#103](https://github.com/tgmaurer/lexicora-extension/issues/103) — Window instance ID in messaging
- [#98](https://github.com/tgmaurer/lexicora-extension/issues/98) — Larger page-header variant
- [#59](https://github.com/tgmaurer/lexicora-extension/issues/59) — Hide link hint when running as window
