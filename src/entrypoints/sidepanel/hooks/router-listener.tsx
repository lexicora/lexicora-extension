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
        if (!msg.data) return;
        navigate(msg.data.path, { viewTransition: true });

        // const targetPath = msg.data.path;
        // const isAlreadyOnPath = location.pathname === targetPath;

        // if (targetPath && !isAlreadyOnPath) {
        //   navigate(targetPath, { viewTransition: true });
        // } else {
        //   navigate(targetPath, {
        //     state: { reload: true }, // pass state to component, then in component const location = useLocation(); if(location.state.reload) { do something }
        //     viewTransition: true,
        //   });
        //   //window.location.reload();
        // }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [navigate, location]);

  useEffect(() => {
    const navigateToLocation = async () =>
      //destination: "background" | "popup" | "content",
      {
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
    // navigateToLocation("background");
    // navigateToLocation("content");
    // navigateToLocation("popup");
  }, []);

  return null;
}
