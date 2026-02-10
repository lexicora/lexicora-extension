import React, { createContext, useContext, useEffect, useState } from "react";
import { getSidePanel } from "webext-bridge/side-panel";

type SidePanelBridge = ReturnType<typeof getSidePanel>;
type SidePanelMessagingContextType = SidePanelBridge | null;

const SidePanelMessagingContext =
  createContext<SidePanelMessagingContextType>(null);

export function useSidePanelMessaging() {
  const context = useContext(SidePanelMessagingContext);
  if (!context) {
    throw new Error(
      "useSidePanelMessaging must be used within a SidePanelMessagingProvider",
    );
  }
  return context;
}

export function SidePanelMessagingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidePanel, setSidePanel] =
    useState<SidePanelMessagingContextType>(null);

  useEffect(() => {
    const initSidePanel = async () => {
      try {
        // const [tab] = await browser.tabs.query({
        //   active: true,
        //   currentWindow: true,
        // });
        const windowId = await browser.windows
          .getCurrent()
          .then((win) => win.id);

        if (windowId) {
          setSidePanel(getSidePanel(windowId));
        } else {
          // Fallback for contexts where a tab might not be active,
          // though less ideal.
          setSidePanel(getSidePanel("")); // 0 works too
        }
      } catch (error) {
        console.error("Failed to initialize side panel messaging:", error);
        // Fallback if tabs query fails
        setSidePanel(getSidePanel("")); // 0 works too
      }
    };

    initSidePanel();
  }, []);

  if (!sidePanel) {
    // You can render a loading spinner here if you'd like
    return null;
  }

  return (
    <SidePanelMessagingContext.Provider value={sidePanel}>
      {children}
    </SidePanelMessagingContext.Provider>
  );
}
