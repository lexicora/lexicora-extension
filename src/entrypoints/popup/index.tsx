import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
// TODO: Potentially make Lexicora logos into components.

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/messaging";
import {
  ArrowUpRightIcon,
  GlobeIcon,
  PanelRightIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { FEATURES } from "@/constants/features";
import { MSG } from "@/constants/messaging";
import { useTabSupport } from "@/hooks/use-tab-support";
import { cn } from "@/lib/utils";
import type { TabData } from "@/types/tab-data.types";

function Popup() {
  const { isSupported, activeTab } = useTabSupport();
  const [promptText, setPromptText] = useState("");

  // MAYBE: Force side panel to open to home page with messaging navigation implementation.
  const openSidePanel = async (closeWindow: boolean) => {
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: sidebarAction is a Firefox-specific API
      await browser.sidebarAction.open();
    } else {
      let windowId = activeTab?.windowId;
      if (!windowId) {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        windowId = tab?.windowId;
      }
      if (!windowId) return;
      await browser.sidePanel.open({ windowId: windowId });
    }
    // sendMessage(MSG.NAVIGATE_IN_SIDEPANEL, { path: "/" }, "popup").catch(
    //   () => {},
    // );
    if (closeWindow) window.close();
  };

  const capturePage = async () => {
    if (!isSupported) return;
    openSidePanel(false);
    let finalTab = activeTab;
    if (!finalTab?.id || !finalTab?.windowId) {
      const [queriedTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      finalTab = queriedTab ?? null;
    }
    if (!finalTab?.id || !finalTab?.windowId) return; // This should never happen, but just in case to prevent errors in messaging handler.
    const tabData: TabData = {
      tabId: finalTab.id,
      windowId: finalTab.windowId,
      //title: finalTab.title,
      //url: finalTab.url,
    };
    sendMessage(MSG.REQUEST_PAGE_CAPTURE, {
      ...tabData,
      fromContext: "popup",
    }).catch(() => null);
    window.close();
  };

  useEffect(() => {
    if (!FEATURES.AI) return;
    // Focus the textarea on component mount, for better UX
    setTimeout(() => {
      document.getElementById("ai-prompt-textarea")?.focus();
      //* NOTE: Having this enabled makes the buttons below flicker, when opening the pupup
    }, 100);
  }, []);

  const pageTitle = activeTab?.title?.trim();
  const pageHost = (() => {
    if (!activeTab?.url) return null;
    try {
      return new URL(activeTab.url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  return (
    <div className="w-85 select-none px-3 pt-3 pb-3.5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {FEATURES.ACCOUNTS && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="size-8 shrink-0 rounded-md flex items-center">
                  <div className="flex items-center justify-center size-full rounded-full bg-secondary/80 ring ring-inset ring-black/20 dark:ring-white/20">
                    <UserIcon className="size-4.5" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="select-none">
                <DropdownMenuLabel className="py-1">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuItem className="py-1">Profile</DropdownMenuItem>
                <DropdownMenuItem className="py-1">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-1">Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-1">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          onClick={() => openSidePanel(true)}
          variant="ghost"
          size="icon"
          title="Open Lexicora side panel"
          className="shrink-0"
        >
          <PanelRightIcon className="size-4.5" />
        </Button>
      </header>

      {FEATURES.AI && (
        <main className="mt-3">
          <h2 className="text-sm font-medium mb-1 text-[#00143d] dark:text-foreground">
            Describe what you want AI to do
          </h2>
          <Textarea
            id="ai-prompt-textarea"
            placeholder="Type your desired AI prompt here."
            className="field-sizing-content resize-y min-h-24 w-full scrollbar-thin transition-colors duration-150 focus-visible:ring-0"
            maxLength={1000}
            disabled={!isSupported}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                if (promptText.trim() === "") return;
                // TODO: Submit the AI capture request once an AI backend exists (#52).
              }
            }}
          />
        </main>
      )}

      {/* What Capture will save, so the action is never a guess. */}
      <section
        className={cn(
          "mt-3 flex items-center gap-2.5 rounded-xl bg-card not-dark:shadow-xs px-3 py-2.5 text-left",
          !isSupported && "opacity-70",
        )}
      >
        {isSupported && activeTab?.favIconUrl ? (
          <img
            src={activeTab.favIconUrl}
            alt=""
            aria-hidden
            draggable="false"
            className="size-4 shrink-0 rounded-xs"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm truncate">
            {isSupported ? (pageTitle ?? "Untitled page") : "Can't capture this page"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isSupported
              ? (pageHost ?? "Unknown site")
              : "Browser and extension pages are not supported"}
          </p>
        </div>
      </section>

      <footer className="mt-3">
        {FEATURES.AI ? (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              title={
                isSupported
                  ? "Capture page"
                  : "You are currently on a unsupported page for capturing."
              }
              className="flex-1 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={promptText.trimEnd() !== "" || !isSupported}
              onClick={capturePage}
            >
              Capture
            </Button>
            <Button
              title={
                isSupported
                  ? "Capture page with AI"
                  : "You are currently on a unsupported page for capturing."
              }
              className="flex-1 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={!isSupported}
            >
              Capture with AI
            </Button>
          </div>
        ) : (
          <Button
            title={
              isSupported
                ? "Capture page"
                : "You are currently on a unsupported page for capturing."
            }
            className="w-full hover:bg-[color-mix(in_oklab,var(--primary)80%,var(--background))] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
            disabled={!isSupported}
            onClick={capturePage}
          >
            Capture page
          </Button>
        )}
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

export default Popup;
