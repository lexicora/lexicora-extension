# Windowed Extension

Lexicora in its own resizable browser window: the same RxDB data and pages as
the side panel, in a wider layout with a persistent left sidebar instead of the
bottom tab bar.

## Status

**Parked.** The shell is built and works, but it is not in active development
and is out of scope for v1.0. It is hidden behind `FEATURES.WINDOWED_APP` in
[`src/constants/features.ts`](../../src/constants/features.ts), which gates the
only way in: the "open in window" button in the side-panel top bar
(`components/top-bar.tsx`), which opens `window.html` through
`browser.windows.create`.

## What exists

- **Entrypoint** — `src/entrypoints/window/`, with its own `App.tsx` and layout:
  sidebar plus content area, no top bar, no bottom navigation.
- **Sidebar** — `window/app-sidebar.tsx`, built on the shadcn `Sidebar`
  (`components/ui/sidebar.tsx`): core nav (Home, Entries, Topics, Settings),
  pinned topics and recent topics, both queried from RxDB in
  `window/__hooks__/use-sidebar-topics.ts`.
- **Shared pages** — route pages live in `src/pages/` and are used by both
  entrypoints. Only the home pages are per entrypoint
  (`sidepanel/pages/home/`, `window/pages/home/`).
- **Host detection** — `useAppHost().isWindowed` (`providers/app-host.tsx`).
  Pages are side-panel-first, so it defaults to `false` and the window opts in.
  The library uses it to hide its Entries/Topics tab bar, since the sidebar
  already switches between them, and to hide the floating create button.

## Design decisions

- **Recent means recently edited.** The sidebar sorts by `updatedAt`, an
  approximation of "recently viewed". Real view tracking, if built, belongs in
  WXT storage rather than RxDB: a view is not a change to the document, and
  writing it there would create revisions and, later, sync traffic for nothing.
  It should cover the side panel too, not just the window.
- **The sidebar is the tab switcher**, so pages must not duplicate its
  navigation.
- **A breadcrumb replaces the back button.** In the window the sidebar already
  shows where the user is, so the content area gets a breadcrumb bar
  (`components/ui/breadcrumb.tsx`) that also holds page-level actions such as
  pin and a "more" menu, rather than `PageHeader`'s compact back button.
- **Variants over forks.** Prefer making shared components layout-aware (a
  larger `PageHeader` size, the existing max-width field wrappers) over copying
  them into the window entrypoint.

## Open when it is picked up again

- **Window home page** — still a placeholder ("coming soon"). It should be its
  own design: a dashboard with the most relevant content up front, and no
  capture UI, since the window has no page to capture from.
- **Breadcrumb bar** with page actions — not built.
- **Larger `PageHeader` variant** ([#98](https://github.com/lexicora/lexicora-extension/issues/98)).
- **Messaging** — the window resolves its own `windowId`, which differs from
  the browser window it was opened from, so background → side-panel pushes
  never reach it. Whether it needs its own registration is
  [#103](https://github.com/lexicora/lexicora-extension/issues/103).
- **One instance at a time** — the top-bar button opens a new window on every
  click.
- **Keyboard shortcuts** — decide which side-panel bindings make sense in the
  window ([#184](https://github.com/lexicora/lexicora-extension/issues/184)).
- **Reactive blocks** — an entry's blocks are not a live query, so an edit made
  in the side panel does not show in the window until it reloads
  ([#182](https://github.com/lexicora/lexicora-extension/issues/182)).

## Related issues

- [#47](https://github.com/lexicora/lexicora-extension/issues/47) — Make the side-panel UI its own window
- [#115](https://github.com/lexicora/lexicora-extension/issues/115) — New app with similar pages but a different layout
- [#112](https://github.com/lexicora/lexicora-extension/issues/112) — Optimize for wider sizes with sidebar navigation
- [#103](https://github.com/lexicora/lexicora-extension/issues/103) — Window instance ID in messaging
- [#98](https://github.com/lexicora/lexicora-extension/issues/98) — Larger page-header variant
- [#59](https://github.com/lexicora/lexicora-extension/issues/59) — Hide the link hint when running as a window
- [#179](https://github.com/lexicora/lexicora-extension/issues/179), [#182](https://github.com/lexicora/lexicora-extension/issues/182), [#184](https://github.com/lexicora/lexicora-extension/issues/184) — windowed polish
