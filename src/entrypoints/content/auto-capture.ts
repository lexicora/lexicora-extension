import { sendMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";

const TIMER_DURATION_MS = 60000; // 1 Minute // TODO: Get from settings later

export function setupAutoCaptureTimer() {
  let captureTimer: ReturnType<typeof setTimeout>;

  const startTimer = () => {
    // Clear any existing timer to avoid duplicates
    if (captureTimer) clearTimeout(captureTimer);

    captureTimer = setTimeout(() => {
      // Only trigger if the page is currently visible to the user
      if (document.visibilityState === "visible") {
        sendMessage(MSG.TRIGGER_AUTO_CAPTURE_NOTIFICATION, {}, "background");
      }
    }, TIMER_DURATION_MS);
  };

  const stopTimer = () => {
    if (captureTimer) clearTimeout(captureTimer);
  };

  // 1. Start the timer immediately upon load
  startTimer();

  // 2. Reset/Stop timer based on page visibility
  // If the user switches tabs, we pause the timer so they aren't notified
  // about a page they aren't looking at.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      stopTimer();
    } else {
      startTimer();
    }
  });

  // 3. Cleanup when the page unloads (SPA navigation or close)
  window.addEventListener("beforeunload", stopTimer);
}
