import { MSG } from "@/types/messaging";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onMessage } from "webext-bridge/popup"; //* NOTE: popup is temporary but works for sidepanel as well (maybe not optimal)

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

        if (targetPath && location.pathname !== targetPath) {
          console.log(`RouterListener: Navigating to ${targetPath}`);
          navigate(targetPath);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [navigate, location]);

  return null;
}
