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
        const isAlreadyOnPath = location.pathname === targetPath;

        if (targetPath && !isAlreadyOnPath) {
          navigate(targetPath, { viewTransition: true });
        } else {
          window.location.reload();
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
