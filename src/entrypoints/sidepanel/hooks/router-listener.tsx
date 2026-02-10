import { MSG } from "@/types/messaging";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidePanelMessaging } from "@/providers/messaging";

export function RouterListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendMessage, onMessage } = useSidePanelMessaging();

  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (!pushEnabled) return;
    // Listen only for the navigation message
    const unsubscribe = onMessage(MSG.NAVIGATE_IN_SIDEPANEL, (msg) => {
      if (!msg.data) return null;

      // If already on path, replace history so that navigate(-1) works as expected
      const isAlreadyOnPath = location.pathname === msg.data.path;
      navigate(msg.data.path, {
        replace: isAlreadyOnPath, // Replace history if already on the target path to prevent navigation loops and ensure back button works as expected
        flushSync: isAlreadyOnPath, // Ensure the navigation happens immediately to trigger specific logic in the destination component if needed
        viewTransition: true,
      });
      return true; //* NOTE: To signal to clear the location of pending navigation in the background or other scripts.
    });

    return () => {
      unsubscribe();
    };
  }, [pushEnabled, location]);

  useEffect(() => {
    const initNavigateToLocation = async () => {
      const path = await sendMessage(
        MSG.REQUEST_PENDING_NAVIGATION,
        null,
        "background", //destination,
      ).catch(() => {});
      if (path) {
        if (path === location.pathname) return;
        navigate(path, { viewTransition: true });
      }

      setPushEnabled(true);
    };
    initNavigateToLocation();
    // parameter: destination: "background" | "popup" | "content",
    // navigateToLocation("background");
    // navigateToLocation("content");
    // navigateToLocation("popup");
  }, []);

  return null;
}
