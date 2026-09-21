import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MSG } from "@/constants/messaging";
import { onMessage, sendMessage } from "@/lib/messaging";
import { useAppWindowId } from "@/providers/app-messaging";
import type {
  CaptureFailureReason,
  CaptureMode,
} from "@/types/page-data.types";

/**
 * What the user is told. One line each: a toast, not an essay.
 *
 * The wording follows what was asked for — a bookmark that fails should not
 * say "captured" — except where the reason itself makes the action plain.
 */
export function captureFailureMessage(
  reason: CaptureFailureReason,
  mode: CaptureMode = "page",
): string {
  const bookmarking = mode === "bookmark";

  switch (reason) {
    case "unsupported":
      return bookmarking
        ? "This page can't be bookmarked"
        : "This page can't be captured";
    case "no-selection":
      return "Nothing is selected on the page";
    case "unreachable":
      // True of either action: the page never answered.
      return "Couldn't read the page — reload it and try again";
  }
}

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
    const report = (reason: CaptureFailureReason, mode: CaptureMode) => {
      toast.error(captureFailureMessage(reason, mode));

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
      report(msg.data.reason, msg.data.mode);
      return true; // Signals the background to drop its pending failure
    });

    // Pulled, when the trigger opened the panel and it was not listening yet.
    void sendMessage(MSG.REQUEST_PENDING_CAPTURE_FAILURE, null)
      .then((failure) => {
        if (failure) report(failure.reason, failure.mode);
      })
      .catch(() => null);

    return () => unsubscribe();
  }, [windowId, navigate]);

  return null;
}
