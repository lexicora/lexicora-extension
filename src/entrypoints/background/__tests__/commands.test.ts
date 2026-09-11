import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { MSG } from "@/constants/messaging";
import { COMMAND_ID } from "@/constants/shortcuts";
import { setupCommands } from "../commands";

/**
 * Covers the browser-wide shortcuts.
 *
 * The rule that matters most is timing: the browser only lets the side panel
 * open "in response to a user action", and a handler stops counting as one
 * once it has awaited. So these tests check that the panel is opened
 * synchronously, before the capture's first message has even resolved.
 */

type CommandListener = (command: string, tab?: Browser.tabs.Tab) => void;

let onCommand: CommandListener;
type SendMessage = (tabId: number, message: { type: string }) => Promise<unknown>;

let sidePanelOpen: Mock<(options: { windowId?: number }) => Promise<void>>;
let tabsSendMessage: Mock<SendMessage>;

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(browser.commands.onCommand, "addListener").mockImplementation(
    (listener) => {
      onCommand = listener as CommandListener;
    },
  );
  sidePanelOpen = vi.fn(async () => {});
  // Chrome's overloaded typings do not line up with a plain mock.
  vi.spyOn(browser.sidePanel, "open").mockImplementation(sidePanelOpen as never);
  // Never resolves unless a test says so, so "was the panel opened first" is
  // answered before any await in the handler can complete.
  tabsSendMessage = vi.fn<SendMessage>(() => new Promise(() => {}));
  vi.spyOn(browser.tabs, "sendMessage").mockImplementation(tabsSendMessage as never);

  setupCommands();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const tab = (url: string) =>
  ({ id: 7, windowId: 3, url }) as Browser.tabs.Tab;

/** Lets pending promise callbacks run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("browser-wide shortcuts", () => {
  it("opens the side panel synchronously when capturing", () => {
    onCommand(COMMAND_ID.CAPTURE, tab("https://example.com/article"));

    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 3 });
  });

  it("captures the selection first, then falls back to the page", async () => {
    tabsSendMessage.mockImplementation(async () => null);

    onCommand(COMMAND_ID.CAPTURE, tab("https://example.com/article"));
    await flush();

    expect(tabsSendMessage.mock.calls.map(([, msg]) => msg.type)).toEqual([
      MSG.GET_PAGE_SELECTION_DATA,
      MSG.GET_PAGE_DATA,
    ]);
  });

  it("stops at the selection when there is one", async () => {
    tabsSendMessage.mockImplementation(async (_tabId, msg) =>
      msg.type === MSG.GET_PAGE_SELECTION_DATA ? { content: "<p>x</p>" } : null,
    );

    onCommand(COMMAND_ID.CAPTURE, tab("https://example.com/article"));
    await flush();

    expect(tabsSendMessage.mock.calls.map(([, msg]) => msg.type)).toEqual([
      MSG.GET_PAGE_SELECTION_DATA,
    ]);
  });

  it("bookmarks with metadata only", async () => {
    tabsSendMessage.mockImplementation(async () => null);

    onCommand(COMMAND_ID.BOOKMARK, tab("https://example.com/article"));
    await flush();

    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 3 });
    expect(tabsSendMessage.mock.calls.map(([, msg]) => msg.type)).toEqual([
      MSG.GET_PAGE_METADATA,
    ]);
  });

  it("only opens the panel on a page that cannot be captured", async () => {
    onCommand(COMMAND_ID.CAPTURE, tab("chrome://extensions/"));
    await flush();

    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 3 });
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });

  it("opens the side panel for its own shortcut without capturing", async () => {
    onCommand(COMMAND_ID.OPEN_SIDE_PANEL, tab("https://example.com"));
    await flush();

    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 3 });
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });
});
