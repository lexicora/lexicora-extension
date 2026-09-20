import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MSG } from "@/constants/messaging";
import { onMessage, sendMessage } from "@/lib/messaging";
import { useAppWindowId } from "@/providers/app-messaging";
import type { CaptureFailureReason } from "@/types/page-data.types";

/** What the user is told, per reason. One line each: a toast, not an essay. */
export const CAPTURE_FAILURE_MESSAGE: Record<CaptureFailureReason, string> = {
  unsupported: "This page can't be captured",
  "no-selection": "Nothing is selected on the page",
  unreachable: "Couldn't read the page — reload it and try again",
};

/**
 * Says why a capture produced nothing, whatever triggered it: a keyboard
 * shortcut, the context menu, the popup or the panel itself.
 *
 * Without this the panel navigates to the new-entry page, shows its loading
 * skeleton and waits for data that never arrives. So the failure also clears
 * the pending state that the skeleton hangs on, leaving an empty new entry.
 *
 * Rendered once inside `AppMessagingProvider`, which is where the panel's own
 * windowId comes from — the same place `RouterListener` sits, and the reason
 * this is a component rather than a hook called in the layout.
 */
export function CaptureFailureListener() {
  const windowId = useAppWindowId();
  const navigate = useNavigate();
  const location = useLocation();

  // Read at the time of the failure, so the listener is not re-attached on
  // every navigation.
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const report = (reason: CaptureFailureReason) => {
      toast.error(CAPTURE_FAILURE_MESSAGE[reason]);

      const current = locationRef.current;
      if (current.state?.isCapturePending !== true) return;
      void navigate(`${current.pathname}${current.search}`, {
        replace: true,
        preventScrollReset: true,
        state: {},
      });
    };

    // Pushed, when the panel was already open.
    const unsubscribe = onMessage(MSG.CAPTURE_FAILED, (msg) => {
      if (msg.data.windowId !== windowId) return null;
      report(msg.data.reason);
      return true; // Signals the background to drop its pending failure
    });

    // Pulled, when the trigger opened the panel and it was not listening yet.
    void sendMessage(MSG.REQUEST_PENDING_CAPTURE_FAILURE, null)
      .then((reason) => {
        if (reason) report(reason);
      })
      .catch(() => null);

    return () => unsubscribe();
  }, [windowId, navigate]);

  return null;
}
