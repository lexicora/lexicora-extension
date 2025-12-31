import { onMessage } from "webext-bridge/background";
import { MSG } from "@/types/messaging";
import { pageData } from "@/types/page-selection-data.types";

// This stays private to this module (encapsulation)
let pendingScrape: pageData | null = null;

// Export the setter so context-menu.ts can call it
export const setPendingScrape = (data: pageData | null) => {
  pendingScrape = data;
};

export function setupMessagingHandlers() {
  onMessage(MSG.REQUEST_PENDING_DATA, () => {
    const data = pendingScrape;
    pendingScrape = null; // Clear after delivery to prevent stale data
    return data;
  });
}
