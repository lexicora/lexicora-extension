import { sendMessage } from "@/lib/messaging";
import { useEffect, useState } from "react";

import { FEATURES } from "@/constants/features";
import { MSG } from "@/constants/messaging";
import { useTabSupport } from "@/hooks/use-tab-support";
import type { TabData } from "@/types/tab-data.types";
import type { CaptureMode } from "@/types/page-data.types";

import { PopupAiLayout } from "./popup-ai-layout";
import { PopupCompactLayout } from "./popup-compact-layout";

/**
 * Owns the popup's state and actions, and picks which layout renders them.
 *
 * This is the popup's single composition point. Both layouts are complete
 * designs: `PopupAiLayout` is the original one, restored unchanged when
 * `FEATURES.AI` is on; `PopupCompactLayout` is the launcher-sized one used while
 * AI is off. They are never combined.
 */
function Popup() {
  const { isSupported, activeTab, isResolved } = useTabSupport();
  const [promptText, setPromptText] = useState("");

  // MAYBE: Force side panel to open to home page with messaging navigation implementation.
  const openSidePanel = async (closeWindow: boolean) => {
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: sidebarAction is a Firefox-specific API
      await browser.sidebarAction.open();
    } else {
      let windowId = activeTab?.windowId;
      if (!windowId) {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        windowId = tab?.windowId;
      }
      if (!windowId) return;
      await browser.sidePanel.open({ windowId: windowId });
    }
    if (closeWindow) window.close();
  };

  const capturePage = async (mode: CaptureMode = "page") => {
    if (!isSupported) return;
    openSidePanel(false);
    let finalTab = activeTab;
    if (!finalTab?.id || !finalTab?.windowId) {
      const [queriedTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      finalTab = queriedTab ?? null;
    }
    if (!finalTab?.id || !finalTab?.windowId) return; // This should never happen, but just in case to prevent errors in messaging handler.
    const tabData: TabData = {
      tabId: finalTab.id,
      windowId: finalTab.windowId,
      //title: finalTab.title,
      //url: finalTab.url,
    };
    sendMessage(MSG.REQUEST_PAGE_CAPTURE, {
      ...tabData,
      fromContext: "popup",
      mode,
    }).catch(() => null);
    window.close();
  };

  useEffect(() => {
    // Waits for isResolved: the textarea is not rendered before then.
    if (!FEATURES.AI || !isResolved) return;
    // Focus the textarea on component mount, for better UX
    setTimeout(() => {
      document.getElementById("ai-prompt-textarea")?.focus();
      //* NOTE: Having this enabled makes the buttons below flicker, when opening the pupup
    }, 100);
  }, [isResolved]);

  // The popup is opened, painted and read in a second, so render it once with
  // the real tab rather than with placeholders that are corrected a frame
  // later — the buttons would fade from enabled to disabled on unsupported
  // pages, and the current-page card would pop in. The check is a single
  // `tabs.query`, so the wait is not noticeable.
  if (!isResolved) return null;

  if (FEATURES.AI) {
    return (
      <PopupAiLayout
        isSupported={isSupported}
        promptText={promptText}
        onPromptTextChange={setPromptText}
        onOpenSidePanel={() => openSidePanel(true)}
        onCapturePage={() => capturePage("page")}
      />
    );
  }

  return (
    <PopupCompactLayout
      activeTab={activeTab}
      isSupported={isSupported}
      onOpenSidePanel={() => openSidePanel(true)}
      onCapturePage={() => capturePage("page")}
      onBookmarkPage={() => capturePage("bookmark")}
    />
  );
}

export default Popup;
