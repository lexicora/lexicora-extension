import React, { createContext, useContext, useEffect, useState } from "react";

type AppWindowIdContextType = number | string | null;

const AppWindowIdContext = createContext<AppWindowIdContextType>(null);

export function useAppWindowId() {
  const context = useContext(AppWindowIdContext);
  if (context === null) {
    throw new Error(
      "useAppWindowId must be used within an AppMessagingProvider",
    );
  }
  return context;
}

/**
 * Resolves and provides the current browser `windowId` for background → app push
 * message filtering. Host-agnostic: used by both the side-panel and the windowed
 * entrypoint (the window is just another browser window with its own id).
 */
export function AppMessagingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowId, setWindowId] = useState<AppWindowIdContextType>(null);

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
    <AppWindowIdContext.Provider value={windowId}>
      {children}
    </AppWindowIdContext.Provider>
  );
}
