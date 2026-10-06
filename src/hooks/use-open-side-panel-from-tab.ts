import { useEffect, useState } from "react";

/** Firefox calls it a sidebar, in its own menus and in ours. */
export const PANEL_NAME = import.meta.env.FIREFOX ? "sidebar" : "side panel";

/**
 * Opens the side panel from an extension page shown in a tab, and closes that
 * tab once the panel is open. Used by the onboarding page, and by the windowed
 * app's placeholder while that app is switched off.
 *
 * The tab is resolved up front, so `open` can open the panel before any
 * `await`: both browsers only open it straight from a user gesture.
 */
export function useOpenSidePanelFromTab() {
  const [tab, setTab] = useState<{ id?: number; windowId?: number } | null>(
    null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    browser.tabs
      .getCurrent()
      .then((current) =>
        setTab({ id: current?.id, windowId: current?.windowId }),
      )
      .catch(() => setTab({}));
  }, []);

  const open = () => {
    const opening: Promise<unknown> = import.meta.env.FIREFOX
      ? // @ts-ignore: sidebarAction is a Firefox-specific API
        browser.sidebarAction.open()
      : browser.sidePanel.open({ windowId: tab!.windowId! });

    // The panel belongs to the window, not this tab, so it stays open once
    // the tab is gone and shows beside whichever page comes to the front.
    opening
      .then(() => (tab?.id !== undefined ? browser.tabs.remove(tab.id) : null))
      .catch(() => setFailed(true));
  };

  const canOpen = import.meta.env.FIREFOX || tab?.windowId !== undefined;

  return { open, canOpen, failed };
}
