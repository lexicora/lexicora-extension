import { ProtocolWithReturn } from "webext-bridge";
import { MSG } from "@/types/messaging";
import type { PageData } from "@/types/page-selection-data.types";
import { Article } from "@/types/mozilla-article.types";

// TODO IMPORTANT: Enforce type safety for messaging system

declare module "webext-bridge" {
  export interface ProtocolMap {
    // From anywhere to side-panel
    [MSG.SEND_PAGE_SELECTION_DATA]: ProtocolWithReturn<
      PageData | null,
      boolean | null
    >;
    [MSG.NAVIGATE_IN_SIDEPANEL]: ProtocolWithReturn<
      { path: string },
      boolean | null
    >;
    // From anywhere to content-script
    [MSG.GET_PAGE_SELECTION_ARTICLE]: ProtocolWithReturn<null, Article | null>;
    [MSG.GET_PAGE_SELECTION_DATA]: ProtocolWithReturn<null, PageData | null>;

    // From side-panel to background
    [MSG.REQUEST_PENDING_DATA]: ProtocolWithReturn<null, PageData | null>;
    [MSG.REQUEST_PENDING_NAVIGATION]: ProtocolWithReturn<null, string | null>;

    // From anywhere to background
    [MSG.OPEN_SIDEPANEL]: null;
    [MSG.CHECK_SIDEPANEL_OPEN]: ProtocolWithReturn<null, boolean>;

    // to specify the return type of the message,
    // use the `ProtocolWithReturn` type wrapper
    //foo: { title: string, description: string };
    //bar: ProtocolWithReturn<CustomDataType, CustomReturnType>;
  }
}
