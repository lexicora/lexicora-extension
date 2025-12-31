import { MSG } from "@/types/messaging";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onMessage, sendMessage } from "webext-bridge/popup"; //* NOTE: popup is temporary but works for sidepanel as well (maybe not optimal)

export function RouterListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen only for the navigation message
    const unsubscribe = onMessage<{ path: string }>(
      MSG.NAVIGATE_IN_SIDEPANEL,
      (msg) => {
        if (!msg.data) return;
        const targetPath = msg.data.path;
        //const currentHashPath = window.location.hash.replace("#", "");
        //console.log("RouterListener: Navigating to", targetPath);

        if (targetPath && location.pathname !== targetPath) {
          //console.log(`Forcing Navigation to: ${targetPath}`);
          navigate(targetPath, { viewTransition: true });
        }
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
        "background",
      ).catch(() => {});
      if (path) {
        if (path === location.pathname) return;
        navigate(path, { viewTransition: true });
      }
    };
    navigateToLocation();
  }, []);

  return null;
}
