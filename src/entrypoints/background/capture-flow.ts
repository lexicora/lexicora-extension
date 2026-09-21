import { MSG } from "@/constants/messaging";
import { sendMessage } from "@/lib/messaging";
import type {
  CaptureFailureReason,
  CaptureMode,
  PageData,
} from "@/types/page-data.types";
import {
  setPendingCapture,
  setPendingCaptureFailure,
  setPendingNavigation,
} from "./messaging-handler";

/**
 * The capture steps shared by every trigger — context menu, keyboard shortcut,
 * popup and side panel.
 */

export const NEW_ENTRY_PATH = "/library/entries/new";

export type CaptureMessage =
  | typeof MSG.GET_PAGE_SELECTION_DATA
  | typeof MSG.GET_PAGE_DATA
  | typeof MSG.GET_PAGE_METADATA;

/**
 * The content-script messages to try, in order, for a capture mode. `auto`
 * tries the selection first: the content script answers null when nothing is
 * selected, which falls through to the full page.
 */
export function captureMessagesFor(mode: CaptureMode): CaptureMessage[] {
  switch (mode) {
    case "bookmark":
      return [MSG.GET_PAGE_METADATA];
    case "auto":
      return [MSG.GET_PAGE_SELECTION_DATA, MSG.GET_PAGE_DATA];
    case "page":
      return [MSG.GET_PAGE_DATA];
  }
}

/** Asks the tab's content script for capture data, returning the first non-null answer. */
export async function fetchCaptureData(
  tabId: number,
  messages: CaptureMessage[],
): Promise<PageData | null> {
  for (const type of messages) {
    // Native messaging, for lower latency than @webext-core/messaging.
    const data: PageData | null = await browser.tabs
      .sendMessage(tabId, { type })
      .catch(() => null);
    if (data) return data;
  }
  return null;
}

/**
 * Whether this is a window the panel can open in.
 *
 * A click that did not come from a browser window — inside the panel itself,
 * for instance — reports `WINDOW_ID_NONE` (-1), and passing that to
 * `sidePanel.open` throws "No window with id: -1".
 */
function isRealWindow(windowId: number | undefined): windowId is number {
  return windowId !== undefined && windowId >= 0;
}

/**
 * Opens the side panel, queueing a navigation to the new-entry page when it is
 * opening for a capture.
 *
 * Must be called synchronously from the user-action handler, before any
 * `await`: both `sidePanel.open()` and Firefox's `sidebarAction.open()` are
 * only allowed "in response to a user action", and that stops being true once
 * the handler has yielded.
 */
export function openSidePanel(
  windowId: number | undefined,
  { forCapture = false }: { forCapture?: boolean } = {},
): void {
  if (forCapture) setPendingNavigation(NEW_ENTRY_PATH);

  if (import.meta.env.FIREFOX) {
    // @ts-ignore: sidebarAction is a Firefox-specific API
    browser.sidebarAction.open();
  } else if (isRealWindow(windowId)) {
    browser.sidePanel.open({ windowId });
  }
}

/**
 * Opens the side panel, or closes it if it was already open. Shared by the
 * open/close keyboard shortcut and the context menu item.
 *
 * Like `openSidePanel`, it must be called synchronously from the user-action
 * handler: both browsers only allow opening while that action is in scope.
 *
 * Firefox toggles natively. Chromium has no toggle, and whether the panel is
 * open has to be known before any `await` — which the background cannot, since
 * its state is lost whenever the service worker sleeps. So it always opens (a
 * no-op when already open) and asks that window's panel to close itself. A
 * panel that was already open receives the request and closes; one that is
 * only now opening is still loading, is not listening yet, and stays open.
 */
export function toggleSidePanel(windowId: number | undefined): void {
  if (import.meta.env.FIREFOX) {
    // @ts-ignore: sidebarAction is a Firefox-specific API
    browser.sidebarAction.toggle();
    return;
  }

  if (!isRealWindow(windowId)) return; // Maybe unnecessary, but likely good to keep.
  openSidePanel(windowId);
  sendMessage(MSG.TOGGLE_SIDEPANEL, { windowId }).catch(() => null);
}

/**
 * Tells the side panel a capture produced nothing, so it can say why rather
 * than sit on the loading skeleton it showed when the capture started.
 *
 * Pushed to an open panel and stored for one that is still opening, the same
 * way capture data is delivered.
 */
export async function reportCaptureFailure(
  windowId: number | undefined,
  reason: CaptureFailureReason,
): Promise<void> {
  setPendingCapture(null);
  setPendingNavigation(null);
  setPendingCaptureFailure(reason);

  if (windowId === undefined) return;

  const delivered = await sendMessage(MSG.CAPTURE_FAILED, {
    windowId,
    reason,
  }).catch(() => null);

  if (delivered === true) setPendingCaptureFailure(null);
}

/**
 * The reason to report when `messages` came back empty: a selection capture
 * asks only for the selection, so nothing there means nothing was selected.
 */
function failureReasonFor(messages: CaptureMessage[]): CaptureFailureReason {
  return messages.length === 1 && messages[0] === MSG.GET_PAGE_SELECTION_DATA
    ? "no-selection"
    : "unreachable";
}

/**
 * Fetches capture data and delivers it to the side panel — pushed if it is
 * already open, otherwise left pending for it to pull once it loads.
 */
export async function requestAndForwardCapture(
  tabId: number,
  windowId: number,
  messages: CaptureMessage[],
): Promise<PageData | null> {
  const pageCaptureData = await fetchCaptureData(tabId, messages);
  if (!pageCaptureData) {
    await reportCaptureFailure(windowId, failureReasonFor(messages));
    return null;
  }

  setPendingCaptureFailure(null);
  setPendingCapture(pageCaptureData);

  const clearPendingNavigation = await sendMessage(MSG.NAVIGATE_IN_SIDEPANEL, {
    windowId,
    path: NEW_ENTRY_PATH,
  }).catch(() => null);

  if (clearPendingNavigation === true) {
    setPendingNavigation(null);
  }

  const clearPendingCaptureData = await sendMessage(
    MSG.SEND_PAGE_CAPTURE_DATA,
    { windowId, payload: pageCaptureData },
  ).catch(() => null);

  if (clearPendingCaptureData === true) {
    setPendingCapture(null);
  }

  return pageCaptureData;
}
