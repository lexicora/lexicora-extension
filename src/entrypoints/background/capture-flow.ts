import { MSG } from "@/constants/messaging";
import { sendMessage } from "@/lib/messaging";
import type { CaptureMode, PageData } from "@/types/page-data.types";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";

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
  } else if (windowId !== undefined) {
    browser.sidePanel.open({ windowId });
  }
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
  if (!pageCaptureData) return null;

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
