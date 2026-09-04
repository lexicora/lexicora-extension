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
   * The standalone windowed app (`window.html`). The entrypoint is functional
   * but unpolished — its home page is a placeholder and several window-specific
   * issues are open (#179, #180, #182, #184). Off until that work is finished;
   * the entrypoint still builds so development can continue.
   */
  WINDOWED_APP: false,
} satisfies Record<string, boolean>;
