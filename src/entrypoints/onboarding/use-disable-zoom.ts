import { useEffect } from "react";

/**
 * Turns zooming off for this tab: Ctrl/⌘ with the wheel, a trackpad pinch,
 * the keyboard shortcuts and the browser menu's zoom buttons all do nothing,
 * and the tab shows at the browser's default zoom. The page is laid out for
 * that — the intro in particular measures the window and would land off
 * target in a tab zoomed mid-animation.
 *
 * Through the browser rather than by cancelling events, which cannot reach
 * the menu or a zoom level the tab already had. Both browsers reset it when
 * the tab navigates or reloads, so it is set on every load.
 */
export function useDisableZoom() {
  useEffect(() => {
    browser.tabs
      .getCurrent()
      .then((tab) =>
        tab?.id !== undefined
          ? browser.tabs.setZoomSettings(tab.id, { mode: "disabled" })
          : undefined,
      )
      .catch(() => undefined);
  }, []);
}
