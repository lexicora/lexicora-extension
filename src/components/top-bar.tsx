import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRightIcon } from "lucide-react";

import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { FEATURES } from "@/constants/features";
import { useScrollPos } from "@/providers/scroll-observer";

export function TopBar() {
  const { isAtTop } = useScrollPos();

  const openExtensionWindow = () => {
    // TODO: Make sure only one windowed instance is open at a time.
    //* NOTE: For messaging, use webext-bridge/sidepanel, because the window is similar in behavior and the windowId is different so no conflicts with the real side-panel.
    browser.windows.create({
      url: browser.runtime.getURL("/window.html"), // TODO: Implement unlisted side-panel similar app (see: https://wxt.dev/guide/essentials/entrypoints.html#unlisted-pages)
      type: "popup",
      width: 1000,
      height: 800, // plus 40, because of window bar
      focused: true,
      //tabId potentially set, could be useful for messaging.
    });

    window.close(); // Close current side-panel
  };

  return (
    <section
      id="lc-top-bar-item"
      className={cn(
        "lc-top-bar fixed top-0 w-full p-2.75 pr-[calc(var(--lc-scrollbar-offset)+2px)] py-[0.7rem] z-30 border-b bg-background/80 backdrop-blur-lg transition-shadow duration-150 shadow-none",
        { "shadow-md/4 dark:shadow-md/26": !isAtTop },
      )}
    >
      {/* was: max-w-[calc(var(--lc-content-max-width)+1rem)] */}
      <div className="flex gap-0 items-center justify-between w-full max-w-(--lc-content-max-width) mx-auto inset-x-0">
        {/* Kept as a spacer so the logo stays centered when accounts are off. */}
        <div className="flex justify-start flex-1">
          <AccountMenu />
        </div>
        <div
          className={cn("shrink-0 select-none", {
            "my-0.5": !FEATURES.ACCOUNTS || !FEATURES.WINDOWED_APP,
          })}
          //role="button"
          onClick={() => {
            window.scrollTo({ top: 0 }); //MAYBE: Make instant (no animation or custom animation like motion blur...)
          }}
          title="Scroll to top"
        >
          {/*Maybe remove later and keep it blank*/}
          <img
            src={lexicoraLightThemeLogoNoBg}
            className="h-8 lc-display-light rounded-[3px]"
            alt="Lexicora logo"
            draggable="false"
          />
          <img
            src={lexicoraDarkThemeLogoNoBg}
            className="h-8 lc-display-dark rounded-[3px]"
            alt="Lexicora logo"
            draggable="false"
          />
        </div>
        {/* Kept as a spacer so the logo stays centered when the window app is off. */}
        <div className="flex justify-end flex-1">
          {FEATURES.WINDOWED_APP && (
            <Button
              variant="ghost"
              size="icon"
              className="dark:hover:bg-muted/70"
              onClick={openExtensionWindow}
              title="Open Lexicora in window"
              //title="Visit Lexicora.com"
            >
              <SquareArrowOutUpRightIcon className="size-4.5" />
            </Button>
          )}
          {/* <Button variant="ghost" size="icon">
            <a
              href="https://lexicora.com"
              title="Visit Lexicora.com"
              target="_blank"
            >
              <ExternalLinkIcon className="size-4.5" />
            </a>
          </Button> */}
        </div>
      </div>
    </section>
  );
}
