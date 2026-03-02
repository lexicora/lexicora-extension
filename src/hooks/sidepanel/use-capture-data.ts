import { useEffect, useRef } from "react";
import { PageData } from "@/types/page-data.types";
import { useSidePanelMessaging } from "@/providers/sidepanel-messaging";
import { MSG } from "@/constants/messaging";

export function useCaptureData() {
  const [capturedData, setCapturedData] = useState<PageData | null>(null);
  const { sendMessage, onMessage } = useSidePanelMessaging();

  // The deduplicator ref: protects the editor from double-renders
  const lastProcessedContent = useRef<string | null>(null);

  useEffect(() => {
    // Core logic to safely update data only if it is genuinely new
    const handleIncomingData = (data: PageData) => {
      if (data.content == null) return;

      // TODO MAYBE: On long pages, trim a part so only a fraction (still sufficient), gets compared for deduplication.
      if (data.content !== lastProcessedContent.current) {
        lastProcessedContent.current = data.content;
        setCapturedData(data);
      }
    };

    // Push Listener: Catches data if the Side Panel is already open
    const unsubscribe = onMessage(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
      if (!msg.data) return null;
      handleIncomingData(msg.data);
      return true; // Signal to background to clear its pending data
    });

    // Pull Logic: Fetches data if the Side Panel was just opened
    const pullData = async () => {
      const pendingData = await sendMessage(
        MSG.REQUEST_PENDING_DATA,
        null,
        "background",
      ).catch(() => null);

      if (pendingData) {
        handleIncomingData(pendingData);
      }
    };

    pullData();

    // Cleanup the listener when the hook unmounts
    return () => unsubscribe();
  }, [onMessage, sendMessage]); // Assuming these are stable context references

  return capturedData;
}
