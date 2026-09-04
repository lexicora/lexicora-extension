import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { AccountMenu } from "@/components/account-menu";
import { CurrentPageCard } from "@/components/capture/current-page-card";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, PanelRightIcon } from "lucide-react";

interface PopupCompactLayoutProps {
  activeTab: Browser.tabs.Tab | null;
  isSupported: boolean;
  onOpenSidePanel: () => void;
  onCapturePage: () => void;
}

/**
 * The popup without AI: a launcher rather than a workspace.
 *
 * The AI layout's tall prompt gave the popup its height; without it the same
 * structure is mostly padding. This one sizes to its content — a compact header,
 * the page a capture would save, and the capture action.
 *
 * The planned bookmark-only capture belongs next to the capture button here.
 */
export function PopupCompactLayout({
  activeTab,
  isSupported,
  onOpenSidePanel,
  onCapturePage,
}: PopupCompactLayoutProps) {
  return (
    <div className="w-85 select-none px-3 pt-3 pb-3.5">
      <header className="flex items-center justify-between gap-2">
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
          className="shrink-0"
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
        <Button
          title={
            isSupported
              ? "Capture page"
              : "You are currently on a unsupported page for capturing."
          }
          className="w-full hover:bg-[color-mix(in_oklab,var(--primary)80%,var(--background))] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
          disabled={!isSupported}
          onClick={onCapturePage}
        >
          Capture page
        </Button>
        <div className="flex justify-center mt-2.5">
          <a
            href="https://lexicora.com"
            target="_blank"
            className="text-xs text-muted-foreground transition-all duration-100 hover:underline hover:underline-offset-2 hover:text-lc-muted-foreground-hover"
            title="https://lexicora.com"
          >
            Visit Lexicora.com <ArrowUpRightIcon className="inline" size={13} />
          </a>
        </div>
      </footer>
    </div>
  );
}
