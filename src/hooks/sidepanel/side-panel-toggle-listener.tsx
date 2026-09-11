import { useEffect } from "react";

import { MSG } from "@/constants/messaging";
import { onMessage } from "@/lib/messaging";
import { navLock } from "@/lib/navigation-lock";
import { useAppWindowId } from "@/providers/app-messaging";

/**
 * A panel younger than this treats a toggle request as the one that just opened
 * it, rather than as a request to close. Loading the panel takes longer than
 * delivering the message, so this only guards against an unusually fast load.
 */
const JUST_OPENED_MS = 1000;

/**
 * Whether a toggle request should close this panel: it must be for this
 * window, must not be the request that just opened it, and must not land
 * mid-save.
 */
export function shouldCloseForToggle({
  requestedWindowId,
  ownWindowId,
  ageMs,
  saving,
}: {
  requestedWindowId: number | string;
  ownWindowId: number | string;
  ageMs: number;
  saving: boolean;
}): boolean {
  return requestedWindowId === ownWindowId && ageMs >= JUST_OPENED_MS && !saving;
}

/**
 * The panel's half of the open/close shortcut (see `toggleSidePanel` in the
 * background): closes this panel when the shortcut is pressed while it is
 * already open. Chromium only — Firefox's sidebar shortcut toggles natively.
 */
export function SidePanelToggleListener() {
  const windowId = useAppWindowId();

  useEffect(() => {
    return onMessage(MSG.TOGGLE_SIDEPANEL, (msg) => {
      const close = shouldCloseForToggle({
        requestedWindowId: msg.data.windowId,
        ownWindowId: windowId,
        // performance.now() counts from this document's load.
        ageMs: performance.now(),
        // Never close mid-save; the shortcut can be pressed again after.
        saving: navLock.isLocked(),
      });
      if (!close) return null;
      window.close();
      return true;
    });
  }, [windowId]);

  return null;
}
