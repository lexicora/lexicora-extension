import { onMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import {
  getSelectionPageArticle,
  getSelectionPageData,
} from "./capture/selection";
import { getPageData } from "./capture/page";

/**
 * Sets up message handlers for pending data requests
 */
export function setupMessagingHandlers() {
  //* Background script requests
  onMessage(MSG.GET_PAGE_SELECTION_ARTICLE, getSelectionPageArticle);
  onMessage(MSG.GET_PAGE_SELECTION_DATA, getSelectionPageData);
  onMessage(MSG.GET_PAGE_DATA, getPageData);
}
