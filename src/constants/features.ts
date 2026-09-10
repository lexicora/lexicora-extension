/**
 * Feature flags for functionality that is designed and partially built, but not
 * shipped in the current release.
 *
 * v1.0 ships as an offline-only, single-device knowledge capture extension. The
 * AI, account and windowed-app surfaces below are intentionally hidden rather
 * than deleted — the UI work is done and re-enabling is a one-line change once
 * the backing implementation exists.
 *
 * Guard *user-facing surfaces* with these flags (buttons, inputs, nav items,
 * settings entries). Routes for gated features are simply not registered, so a
 * gated link must never be rendered.
 *
 * Properties are typed as `boolean` (not `as const` literals) so that gated code
 * stays type-checked and free of "unreachable code" noise while the flag is off.
 *
 * ## How these are structured
 *
 * A flag never scatters conditionals through a surface. Each surface has one
 * composition point that picks between *complete* layouts, so both branches are
 * designs in their own right and neither is leftovers of the other:
 *
 * - `entrypoints/popup/index.tsx` → `PopupAiLayout` | `PopupCompactLayout`
 * - `sidepanel/pages/home/home.tsx` → its `mainContent` decision, choosing
 *   `AiPromptSection` | `LibraryEmptyState` | `RecentEntries`
 * - `components/account-menu.tsx` → renders nothing itself when `ACCOUNTS` is
 *   off, so call sites never repeat the check
 *
 * ## Flipping a flag
 *
 * Nothing renders the "on" branches today, so they cannot be assumed to still
 * be correct. `bun run compile` catches type and import breakage but not layout
 * breakage. After flipping one, re-check its surfaces by hand:
 *
 * | Flag                | Re-check                                              |
 * |---------------------|-------------------------------------------------------|
 * | `AI`                | popup; side-panel home main + capture footer; entry    |
 * |                     | create and edit bottom prompt bars; Settings AI item,  |
 * |                     | which needs a `/settings/ai` route registering first.  |
 * |                     | The AI footers predate Bookmark and do not offer it,   |
 * |                     | so turning AI on hides Bookmark until they are redone  |
 * | `ACCOUNTS`          | top bar; popup header; Settings account item, which    |
 * |                     | needs a `/settings/account` route registering first    |
 * | `SIDE_PANEL_TOP_BAR`| every side-panel page's top offset, and PageHeader's   |
 * |                     | compact strip while scrolling                          |
 * | `WINDOWED_APP`      | top-bar button; the whole `window/` entrypoint         |
 *
 * Both settings entries link to routes that do not exist yet — turning `AI` or
 * `ACCOUNTS` on without adding them lands the user on the not-found page.
 */
export const FEATURES = {
  /**
   * AI capture and refinement: prompt inputs on the popup and side-panel home,
   * "Capture with AI" and "Refine with AI" actions, and the AI settings page.
   * Off until a model backend exists — see issues #52 and #190.
   */
  AI: false,

  /**
   * User accounts: profile menus in the top-bar and popup, and the account
   * settings page. Off until Supabase auth exists — see issue #69.
   */
  ACCOUNTS: false,

  /**
   * The side-panel top bar.
   *
   * Off because everything it held — the account menu and the "open in window"
   * button — is itself gated, leaving a band of chrome with no purpose above
   * every page, and duplicated branding on the home page. Turn this back on
   * together with `ACCOUNTS` or `WINDOWED_APP`.
   *
   * Hiding it also shifts the layout: `main.tsx` puts `lc-no-top-bar` on the
   * root element, which zeroes the page container's top margin and the scroll
   * padding, and `PageHeader` anchors its compact strip to the top of the
   * viewport instead of below the bar.
   */
  SIDE_PANEL_TOP_BAR: false,

  /**
   * The new bottom navigation style, which is a single row of icons instead of
   * a row of buttons with text. Off until the new design is fully implemented
   * and tested.
   */
  SIDE_PANEL_NEW_BOTTOM_NAV_STYLE: true,

  /**
   * The standalone windowed app (`window.html`). The entrypoint is functional
   * but unpolished — its home page is a placeholder and several window-specific
   * issues are open (#179, #180, #182, #184). Off until that work is finished;
   * the entrypoint still builds so development can continue.
   */
  WINDOWED_APP: false,
} satisfies Record<string, boolean>;
