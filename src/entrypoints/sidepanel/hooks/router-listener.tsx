import { MSG } from "@/types/messaging";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidePanelMessaging } from "../providers/messaging";

export function RouterListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendMessage, onMessage } = useSidePanelMessaging();

  useEffect(() => {
    // Listen only for the navigation message
    const unsubscribe = onMessage<{ path: string }>(
      MSG.NAVIGATE_IN_SIDEPANEL,
      (msg) => {
        if (!msg.data) return null;

        // If already on path, replace history so that navigate(-1) works as expected
        const isAlreadyOnPath = location.pathname === msg.data.path;
        navigate(msg.data.path, {
          replace: isAlreadyOnPath,
          viewTransition: true,
        });
        return true; //* NOTE: To signal to clear the location of pending navigation in the background or other scripts.
      },
    );

    return () => {
      unsubscribe();
    };
  }, [navigate, location]);

  useEffect(() => {
    const navigateToLocation = async () => {
      const path = await sendMessage<string | null>(
        MSG.REQUEST_PENDING_NAVIGATION,
        {},
        "background", //destination,
      ).catch(() => {});
      if (path) {
        if (path === location.pathname) return;
        navigate(path, { viewTransition: true });
      }
    };
    navigateToLocation();
    // parameter: destination: "background" | "popup" | "content",
    // navigateToLocation("background");
    // navigateToLocation("content");
    // navigateToLocation("popup");
  }, []);

  return null;
}
