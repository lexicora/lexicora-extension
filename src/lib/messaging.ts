import { MSG } from "@/constants/messaging";
import type { Article } from "@/types/mozilla-article.types";
import type { PageData } from "@/types/page-data.types";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  //getStringLength(s: string): number;
  [MSG.GET_PAGE_SELECTION_ARTICLE](data: null): null | Article;
  [MSG.GET_PAGE_SELECTION_DATA](data: null): null | PageData;
  [MSG.GET_PAGE_DATA](data: null): null | PageData;
  [MSG.OPEN_SIDEPANEL](): void;
}

const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
export { sendMessage as sendMessageCore, onMessage as onMessageCore };
