import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { MSG } from "@/constants/messaging";
import { useTabSupport } from "@/hooks/use-tab-support";
import { sendMessage } from "@/lib/messaging";
import type { CaptureMode } from "@/types/page-data.types";
import type { TabData } from "@/types/tab-data.types";

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
      navigate("/library/entries/new", {
        viewTransition: true,
        state: { isCapturePending: true },
      });
      return true;
    },
    [isSupported, activeTab, navigate],
  );

  return { capture, isSupported, activeTab };
}
