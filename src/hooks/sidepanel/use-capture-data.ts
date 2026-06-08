import { useEffect, useState } from "react";
import { PageData } from "@/types/page-data.types";
import { sendMessageCore, onMessageCore } from "@/lib/messaging";
import { useSidePanelWindowId } from "@/providers/sidepanel-messaging";
import { MSG } from "@/constants/messaging";

export function useCaptureData() {
  const [capturedData, setCapturedData] = useState<PageData | null>(null);
  const windowId = useSidePanelWindowId();

  useEffect(() => {
    // Core logic to safely update data only if it is genuinely new
    const handleIncomingData = (data: PageData) => {
      if (data.content == null) return;

      // Disable strict content deduplication so repeat triggers
      // of identical payloads (like full page captures) still go through.
      setCapturedData(data);
    };

    // Push Listener: Catches data if the Side Panel is already open
    const unsubscribe = onMessageCore(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
      if (msg.data.windowId !== windowId) return null;
      if (!msg.data.payload) return null;
      handleIncomingData(msg.data.payload);
      return true; // Signal to background to clear its pending data
    });

    // Pull Logic: Fetches data if the Side Panel was just opened
    const pullData = async () => {
      const pendingData = await sendMessageCore(
        MSG.REQUEST_PENDING_DATA,
        null,
      ).catch(() => null);

      if (pendingData) {
        handleIncomingData(pendingData);
      }
    };

    pullData();

    // Cleanup the listener when the hook unmounts
    return () => unsubscribe();
  }, [windowId]);

  return capturedData;
}
