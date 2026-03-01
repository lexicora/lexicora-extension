import { useEffect, useRef } from "react";
import { PageData } from "@/types/page-data.types";
import { useSidePanelMessaging } from "@/providers/sidepanel-messaging";
import { MSG } from "@/constants/messaging";

// export function useCaptureData(
//   onDataReceived: (data: PageData, hasContentChanged: boolean) => void,
// ) {
//   const { sendMessage, onMessage } = useSidePanelMessaging();
//   const lastProcessedContent = useRef<string | null>(null);

//   const callbackRef = useRef(onDataReceived);
//   useEffect(() => {
//     callbackRef.current = onDataReceived;
//   }, [onDataReceived]);

//   useEffect(() => {
//     const handleIncomingData = (data: PageData | null) => {
//       if (!data) return;
//       // Check if the HTML content specifically has changed
//       const hasContentChanged = data.content !== lastProcessedContent.current;
//       if (hasContentChanged && data.content) {
//         lastProcessedContent.current = data.content;
//       }

//       // INSTANT EXECUTION: Always fire the callback with the data,
//       // but let the component know if it needs to re-render the editor blocks.
//       callbackRef.current(data, hasContentChanged);
//     };

//     // Push logic
//     const unsubscribe = onMessage(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
//       if (msg.data) handleIncomingData(msg.data);
//       return true;
//     });

//     // Pull logic
//     const pullData = async () => {
//       const pendingData = await sendMessage(
//         MSG.REQUEST_PENDING_DATA,
//         null,
//         "background",
//       ).catch(() => null);

//       if (pendingData) {
//         handleIncomingData(pendingData);
//       }
//     };

//     pullData();

//     return () => unsubscribe();
//   }, [onMessage, sendMessage]);
// }

export function useCaptureData() {
  const [capturedData, setCapturedData] = useState<PageData | null>(null);
  const { sendMessage, onMessage } = useSidePanelMessaging();

  // The deduplicator ref: protects the editor from double-renders
  const lastProcessedContent = useRef<string | null>(null);

  useEffect(() => {
    // 1. Core logic to safely update data only if it is genuinely new
    // data should not be null
    const handleIncomingData = (data: PageData /*| null*/) => {
      if (!data.content) return; // check might be unnecessary, since below might take care of it.

      if (data.content !== lastProcessedContent.current) {
        lastProcessedContent.current = data.content;
        setCapturedData(data);
      }
    };

    // 2. Push Listener: Catches data if the Side Panel is already open
    const unsubscribe = onMessage(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
      if (!msg.data) return null;
      handleIncomingData(msg.data);
      return true; // Signal to background to clear its pending data
    });

    // 3. Pull Logic: Fetches data if the Side Panel was just opened
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

// Other implementation to potentially use.
// import { useEffect, useRef } from "react";
// import { PageData } from "@/types/page-data.types";
// import { useSidePanelMessaging } from "@/providers/sidepanel-messaging";
// import { MSG } from "@/constants/messaging";

// export function useCaptureData(onDataReceived: (data: PageData) => void) {
//   const { sendMessage, onMessage } = useSidePanelMessaging();
//   const lastProcessedContent = useRef<string | null>(null);

//   // Use a ref to store the latest callback so we don't have to put it in the dependency array
//   // This prevents the useEffect from re-running if the callback changes
//   const callbackRef = useRef(onDataReceived);
//   useEffect(() => {
//     callbackRef.current = onDataReceived;
//   }, [onDataReceived]);

//   useEffect(() => {
//     const handleIncomingData = (data: PageData | null) => {
//       if (!data || !data.content) return;

//       if (data.content !== lastProcessedContent.current) {
//         lastProcessedContent.current = data.content;

//         // INSTANT EXECUTION: Skip React state and immediately call the function
//         callbackRef.current(data);
//       }
//     };

//     // Push logic
//     const unsubscribe = onMessage(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
//       if (msg.data) handleIncomingData(msg.data);
//       return true;
//     });

//     // Pull logic
//     const pullData = async () => {
//       const pendingData = await sendMessage(
//         MSG.REQUEST_PENDING_DATA, null, "background"
//       ).catch(() => null);

//       if (pendingData) {
//         handleIncomingData(pendingData as PageData);
//       }
//     };

//     pullData();

//     return () => unsubscribe();
//   }, [onMessage, sendMessage]);
// }
