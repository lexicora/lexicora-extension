import { useEffect } from "react";

/**
 * Establishes a long-lived connection with the background script.
 * This acts as a heartbeat: when the Side Panel is closed (or crashes),
 * the browser natively drops this port, triggering the background script
 * to update the session storage state.
 */
export function useSidePanelConnection() {
  useEffect(() => {
    // Open the port to the background script
    const port = browser.runtime.connect({ name: "lexicora-sidepanel" });

    // Optional but recommended:
    // While the browser automatically handles disconnects when the 'X' is clicked,
    // this cleanup function ensures that during development (Hot Module Replacement),
    // React cleanly disconnects and reconnects the port without leaving ghost connections.
    return () => {
      port.disconnect();
    };
  }, []);
}
