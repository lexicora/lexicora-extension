import { ProtocolWithReturn } from "webext-bridge";
import { MSG } from "@/types/messaging";

// TODO IMPORTANT: Enforce type safety for messaging system

const navigateInSidepanel = MSG.NAVIGATE_IN_SIDEPANEL;

// declare module "webext-bridge" {
//   export interface ProtocolMap {
//     foo: { title: string };
//     // to specify the return type of the message,
//     // use the `ProtocolWithReturn` type wrapper
//     bar: ProtocolWithReturn<CustomDataType, CustomReturnType>;
//     [MSG.NAVIGATE_IN_SIDEPANEL]: ...
//   }
// }
