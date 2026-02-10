import { MSG } from "@/types/messaging";
import { useEffect } from "react";
import { useSidePanelMessaging } from "@/providers/messaging";

export function MessageListener() {
  const { sendMessage, onMessage } = useSidePanelMessaging();

  useEffect(() => {
    // const listenforStateRequest = () =>
    //   onMessage(MSG.REQUEST_SIDEPANEL_STATE, async () => {
    //     return { isOpen: true };
    //   });
    //listenforStateRequest();
  }, []);

  return null;
}
