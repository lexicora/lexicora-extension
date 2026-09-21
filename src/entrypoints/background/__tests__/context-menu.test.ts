import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { CMI_ID } from "@/constants/context-menu-items";
import { MSG } from "@/constants/messaging";
import { setupContextMenuActions } from "../context-menu";

/**
 * Covers the context menu's side panel item, which toggles through the same
 * function as the open/close shortcut rather than a copy of it.
 */

type ClickListener = (
  info: { menuItemId: string; pageUrl?: string; frameUrl?: string },
  tab?: Browser.tabs.Tab,
) => void;

let onClicked: ClickListener;
let sidePanelOpen: Mock<(options: { windowId?: number }) => Promise<void>>;
let runtimeSendMessage: Mock<(message: unknown) => Promise<unknown>>;

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(browser.contextMenus.onClicked, "addListener").mockImplementation(
    (listener) => {
      onClicked = listener as ClickListener;
    },
  );
  sidePanelOpen = vi.fn(async () => {});
  vi.spyOn(browser.sidePanel, "open").mockImplementation(sidePanelOpen as never);
  runtimeSendMessage = vi.fn(async () => null);
  vi.spyOn(browser.runtime, "sendMessage").mockImplementation(
    runtimeSendMessage as never,
  );

  setupContextMenuActions();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const tab = { id: 7, windowId: 3, url: "https://example.com" } as Browser.tabs.Tab;
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("context menu: open or close side panel", () => {
  it("opens the panel synchronously, while the click still counts", () => {
    onClicked({ menuItemId: CMI_ID.TOGGLE_SIDE_PANEL }, tab);

    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 3 });
  });

  it("asks an already open panel to close, as the shortcut does", async () => {
    onClicked({ menuItemId: CMI_ID.TOGGLE_SIDE_PANEL }, tab);
    await flush();

    const sent = runtimeSendMessage.mock.calls.map(
      ([message]) => message as { type: string; data: unknown },
    );
    expect(sent).toContainEqual(
      expect.objectContaining({
        type: MSG.TOGGLE_SIDEPANEL,
        data: { windowId: 3 },
      }),
    );
  });
});

describe("context menu: a click that carries no window", () => {
  it("says so in the panel instead of throwing", async () => {
    // Chromium offers the item inside the panel too, where there is nothing
    // to toggle: sidePanel.open would throw "No window with id: -1".
    onClicked({ menuItemId: CMI_ID.TOGGLE_SIDE_PANEL }, {
      id: 7,
      windowId: -1,
    } as Browser.tabs.Tab);
    await flush();

    expect(sidePanelOpen).not.toHaveBeenCalled();
    expect(
      runtimeSendMessage.mock.calls.map(([message]) => message),
    ).toContainEqual(
      expect.objectContaining({
        type: MSG.SIDEPANEL_NOTICE,
        data: { text: "Can't toggle the panel from inside it" },
      }),
    );
  });
});

describe("context menu: a capture that finds nothing", () => {
  it("says nothing is selected when the selection capture comes back empty", async () => {
    vi.spyOn(browser.tabs, "sendMessage").mockImplementation((async () =>
      null) as never);

    onClicked({ menuItemId: CMI_ID.CAPTURE_SELECTION_AS_IS }, tab);
    await flush();

    const sent = runtimeSendMessage.mock.calls.map(
      ([message]) => message as { type: string; data: unknown },
    );
    expect(sent).toContainEqual(
      expect.objectContaining({
        type: MSG.CAPTURE_FAILED,
        data: { windowId: 3, reason: "no-selection", mode: "page" },
      }),
    );
  });

  it("says the page could not be read when a page capture comes back empty", async () => {
    vi.spyOn(browser.tabs, "sendMessage").mockImplementation((async () =>
      null) as never);

    onClicked({ menuItemId: CMI_ID.CAPTURE_PAGE_AS_IS }, tab);
    await flush();

    const sent = runtimeSendMessage.mock.calls.map(
      ([message]) => message as { type: string; data: unknown },
    );
    expect(sent).toContainEqual(
      expect.objectContaining({
        type: MSG.CAPTURE_FAILED,
        data: { windowId: 3, reason: "unreachable", mode: "page" },
      }),
    );
  });
});
