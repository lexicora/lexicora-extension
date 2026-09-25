import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { AccountMenu } from "@/components/account-menu";
import { CaptureActions } from "@/components/capture/capture-actions";
import { WebsiteLink } from "@/components/website-link";
import { CurrentPageCard } from "@/components/capture/current-page-card";
import { Button } from "@/components/ui/button";
import { PanelRightIcon } from "lucide-react";
import { cn } from "cn";

interface PopupCompactLayoutProps {
  activeTab: Browser.tabs.Tab | null;
  isSupported: boolean;
  onOpenSidePanel: () => void;
  onCapturePage: () => void;
  onBookmarkPage: () => void;
}

const extraRounding = import.meta.env.FIREFOX; // Aligns with Firefox's new design.

/**
 * The popup without AI: a launcher rather than a workspace.
 *
 * The AI layout's tall prompt gave the popup its height; without it the same
 * structure is mostly padding. This one sizes to its content — a compact header,
 * the page a capture would save, and the capture and bookmark actions.
 */
export function PopupCompactLayout({
  activeTab,
  isSupported,
  onOpenSidePanel,
  onCapturePage,
  onBookmarkPage,
}: PopupCompactLayoutProps) {
  return (
    <div className="w-85 select-none p-3 /*pb-3.5*/">
      <header className="flex items-center justify-between gap-2 ml-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <AccountMenu className="bg-secondary/80" />
          <img
            src={lexicoraLightThemeLogoNoBg}
            className="h-6 lc-display-light rounded-xs shrink-0"
            alt=""
            aria-hidden
            draggable="false"
          />
          <img
            src={lexicoraDarkThemeLogoNoBg}
            className="h-6 lc-display-dark rounded-xs shrink-0"
            alt=""
            aria-hidden
            draggable="false"
          />
          <span className="text-lg font-bold text-[#00143d] dark:text-foreground truncate">
            Lexicora
          </span>
        </div>
        <Button
          onClick={onOpenSidePanel}
          variant="ghost"
          size="icon"
          title="Open Lexicora side panel"
          className={cn("shrink-0", extraRounding && "rounded-lg")}
        >
          <PanelRightIcon className="size-4.5" />
        </Button>
      </header>

      <CurrentPageCard
        activeTab={activeTab}
        isSupported={isSupported}
        className="mt-3"
      />

      <footer className="mt-3">
        <CaptureActions
          isSupported={isSupported}
          onCapturePage={onCapturePage}
          onBookmarkPage={onBookmarkPage}
          extraRounding={extraRounding}
        />
        <WebsiteLink className="mt-2.5" size="xs" />
      </footer>
    </div>
  );
}
