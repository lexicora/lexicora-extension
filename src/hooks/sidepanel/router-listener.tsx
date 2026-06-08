import { MSG } from "@/constants/messaging";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendMessage, onMessage } from "@/lib/messaging";
import { useSidePanelWindowId } from "@/providers/sidepanel-messaging";

export function RouterListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const windowId = useSidePanelWindowId();

  const [pushEnabled, setPushEnabled] = useState(false);

  const pathToSetIsCapturePending = [
    "/entries/new",
    /*"/entries/[id]"*/
  ];

  useEffect(() => {
    if (!pushEnabled) return;
    // Listen only for the navigation message
    const unsubscribe = onMessage(MSG.NAVIGATE_IN_SIDEPANEL, (msg) => {
      if (msg.data.windowId !== windowId) return null;

      const { path } = msg.data;

      // If the user is currently editing an entry, absorb capture-triggered
      // navigation to entry-create so the captured data goes into the open editor.
      const isOnEntryEdit = /^\/library\/entries\/[^/]+\/edit$/.test(
        location.pathname,
      );
      if (path === "/library/entries/new" && isOnEntryEdit) {
        return true; // Signal background to clear pending navigation; skip navigate()
      }

      // If already on path, replace history so that navigate(-1) works as expected
      const isAlreadyOnPath = location.pathname === path;
      const isCapturePending = pathToSetIsCapturePending.includes(path);
      navigate(path, {
        replace: isAlreadyOnPath, // Replace history if already on the target path to prevent navigation loops and ensure back button works as expected
        flushSync: isAlreadyOnPath, // Ensure the navigation happens immediately to trigger specific logic in the destination component if needed
        viewTransition: true,
        preventScrollReset: isAlreadyOnPath, // Prevent scroll reset if already on the target path
        state: {
          isCapturePending: isCapturePending,
        },
      });
      return true; //* NOTE: To signal to clear the location of pending navigation in the background or other scripts.
    });

    return () => {
      unsubscribe();
    };
  }, [pushEnabled, location]);

  useEffect(() => {
    const initNavigateToLocation = async () => {
      const path = await sendMessage(
        MSG.REQUEST_PENDING_NAVIGATION,
        null,
      ).catch(() => null);
      if (path) {
        const isOnEntryEdit = /^\/library\/entries\/[^/]+\/edit$/.test(
          location.pathname,
        );
        const suppressed = path === "/library/entries/new" && isOnEntryEdit;
        if (!suppressed && path !== location.pathname) {
          navigate(path, {
            viewTransition: true,
            state: { isCapturePending: pathToSetIsCapturePending.includes(path) },
          });
        }
      }

      setPushEnabled(true);
    };
    initNavigateToLocation();
  }, []);

  return null;
}
