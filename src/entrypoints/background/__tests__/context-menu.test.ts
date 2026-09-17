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
  info: { menuItemId: string },
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
