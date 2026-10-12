import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { findRelease } from "@/constants/changelog";
import { takePendingUpdateNotice } from "@/lib/update-notice";

// Once per panel: strict mode runs effects twice in development, and both
// runs would read the notice before either had cleared it.
let checked = false;

/**
 * Says once, in the first side panel opened after an update, that Lexicora
 * was updated, and links to what changed (see `lib/update-notice`).
 */
export function UpdateNoticeListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (checked) return;
    checked = true;

    void takePendingUpdateNotice().then((previousVersion) => {
      if (previousVersion === null) return;

      const version = browser.runtime.getManifest().version;
      const release = findRelease(version);
      toast.success(`Lexicora updated to ${version}`, {
        description: release?.summary,
        duration: 15_000,
        action: {
          label: "What's changed",
          onClick: () =>
            navigate(
              release
                ? `/settings/about/whats-changed/${release.version}`
                : "/settings/about/whats-changed",
              { viewTransition: true },
            ),
        },
      });
    });
  }, [navigate]);

  return null;
}
