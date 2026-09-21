import { useEffect } from "react";
import { toast } from "sonner";

import { MSG } from "@/constants/messaging";
import { onMessage } from "@/lib/messaging";

/**
 * Shows what the background has to say when it has nowhere else to say it.
 *
 * One case today: Chromium puts the "Toggle side panel" context menu item
 * inside the panel as well, where the click carries no window and there is
 * nothing to toggle. The item cannot be hidden there — see the comment on the
 * items in `constants/context-menu-items` — so it explains itself instead.
 *
 * The notice is broadcast rather than addressed to a window, because the
 * trigger has no window to name. With several panels open they would all say
 * it; the alternative is the one that clicked saying nothing.
 */
export function PanelNoticeListener() {
  useEffect(() => {
    const unsubscribe = onMessage(MSG.SIDEPANEL_NOTICE, (msg) => {
      toast.info(msg.data.text);
      return true;
    });

    return () => unsubscribe();
  }, []);

  return null;
}
