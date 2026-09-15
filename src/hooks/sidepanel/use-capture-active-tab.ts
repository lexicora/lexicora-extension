import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { MSG } from "@/constants/messaging";
import { useTabSupport } from "@/hooks/use-tab-support";
import { sendMessage } from "@/lib/messaging";
import type { CaptureMode } from "@/types/page-data.types";
import type { TabData } from "@/types/tab-data.types";
import { NEW_ENTRY_PATH, isEntryEditPath } from "@/lib/routes";

/**
 * Captures the active tab from inside the side panel: asks the background to
 * collect the page data, and moves the panel to the new-entry page, where the
 * data arrives. Shared by the home page's buttons and the panel shortcuts.
 *
 * `capture` resolves to false without doing anything on a page that cannot be
 * captured, so callers can say so.
 */
export function useCaptureActiveTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSupported, activeTab } = useTabSupport();

  const capture = useCallback(
    async (mode: CaptureMode = "page"): Promise<boolean> => {
      if (!isSupported) return false;

      let finalTab = activeTab;
      if (!finalTab?.id || !finalTab?.windowId) {
        const [queriedTab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        finalTab = queriedTab ?? null;
      }
      if (!finalTab?.id || !finalTab?.windowId) return false;

      const tabData: TabData = {
        tabId: finalTab.id,
        windowId: finalTab.windowId,
      };
      sendMessage(MSG.REQUEST_PAGE_CAPTURE, {
        ...tabData,
        fromContext: "side-panel",
        mode,
      }).catch(() => null);
      // On an entry's edit page the capture belongs to the entry being edited,
      // which is listening for it — navigating away would start a new one and
      // abandon the edit. The same rule lets the popup and the browser-wide
      // shortcuts capture into an open editor; see router-listener.
      if (!isEntryEditPath(location.pathname)) {
        // Capturing again from the new-entry page replaces it rather than
        // stacking a second copy, which Back would otherwise land on. The
        // state still goes through, so the editor shows its loading skeleton
        // while the page data arrives.
        const alreadyThere = location.pathname === NEW_ENTRY_PATH;
        navigate(NEW_ENTRY_PATH, {
          replace: alreadyThere,
          preventScrollReset: alreadyThere,
          viewTransition: true,
          state: { isCapturePending: true },
        });
      }
      return true;
    },
    [isSupported, activeTab, navigate, location.pathname],
  );

  return { capture, isSupported, activeTab };
}
