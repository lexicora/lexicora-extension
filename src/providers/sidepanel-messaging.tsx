import React, { createContext, useContext, useEffect, useState } from "react";

type SidePanelWindowIdContextType = number | string | null;

const SidePanelWindowIdContext =
  createContext<SidePanelWindowIdContextType>(null);

export function useSidePanelWindowId() {
  const context = useContext(SidePanelWindowIdContext);
  if (context === null) {
    throw new Error(
      "useSidePanelWindowId must be used within a SidePanelMessagingProvider",
    );
  }
  return context;
}

export function SidePanelMessagingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowId, setWindowId] =
    useState<SidePanelWindowIdContextType>(null);

  useEffect(() => {
    browser.windows
      .getCurrent()
      .then((win) => setWindowId(win.id ?? ""))
      .catch(() => setWindowId(""));
  }, []);

  if (windowId === null) {
    // You can render a loading spinner here if you'd like
    return null;
  }

  return (
    <SidePanelWindowIdContext.Provider value={windowId}>
      {children}
    </SidePanelWindowIdContext.Provider>
  );
}
