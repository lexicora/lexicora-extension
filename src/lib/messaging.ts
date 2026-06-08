import { MSG } from "@/constants/messaging";
import type { Article } from "@/types/mozilla-article.types";
import type { PageData } from "@/types/page-data.types";
import type { TabData } from "@/types/tab-data.types";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  // Background-targeted (from content, popup, or sidepanel → background)
  [MSG.OPEN_SIDEPANEL](): void;
  [MSG.REQUEST_PENDING_DATA](data: null): PageData | null;
  [MSG.REQUEST_PENDING_NAVIGATION](data: null): string | null;
  [MSG.REQUEST_PAGE_CAPTURE](data: TabData & { fromContext: string }): void;

  // Sidepanel-targeted push (background → sidepanel; windowId in data for per-window filtering)
  [MSG.NAVIGATE_IN_SIDEPANEL](data: { windowId: number | string; path: string }): boolean | null;
  [MSG.SEND_PAGE_SELECTION_DATA](data: { windowId: number | string; payload: PageData | null }): boolean | null;

  // Content-targeted (AI feature, pending full implementation)
  [MSG.GET_PAGE_SELECTION_ARTICLE](data: null): Article | null;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
