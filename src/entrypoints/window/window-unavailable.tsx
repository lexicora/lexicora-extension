import { PanelRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PANEL_NAME,
  useOpenSidePanelFromTab,
} from "@/hooks/use-open-side-panel-from-tab";

/**
 * Shown in place of the windowed app while `FEATURES.WINDOWED_APP` is off.
 *
 * Nothing links to `window.html` then, but the page still builds and can be
 * reached by typing its address. Rather than handing over an unfinished app,
 * this points to the side panel and closes itself once that is open.
 */
export function WindowUnavailable() {
  const { open, canOpen, failed } = useOpenSidePanelFromTab();

  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-3 px-4 text-center select-none">
      <h1 className="text-2xl font-bold tracking-tight">
        {/* Use this text if feature is planned and in development: This view isn't available yet */}
        This view is currently unavailable.
      </h1>
      <p className="text-muted-foreground max-w-sm text-pretty">
        Lexicora lives in the {PANEL_NAME}, beside the page you are reading.
      </p>
      <Button className="mt-3" size="lg" onClick={open} disabled={!canOpen}>
        <PanelRightIcon data-icon="inline-start" />
        Open the {PANEL_NAME}
      </Button>
      <p className="text-xs text-muted-foreground">
        {failed
          ? `The ${PANEL_NAME} didn't open here — use Lexicora's toolbar button instead.`
          : "This tab closes once it is open."}
      </p>
    </main>
  );
}
