import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRightIcon, UserIcon } from "lucide-react";

import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { useScrollPos } from "@/providers/scroll-observer";

export function TopBar() {
  const { isAtTop } = useScrollPos();

  const openExtensionWindow = () => {
    // TODO: Make sure only one windowed instance is open at a time.
    //* NOTE: For messaging, use webext-bridge/sidepanel, because the window is similar in behavior and the windowId is different so no conflicts with the real side-panel.
    browser.windows.create({
      url: browser.runtime.getURL("/sidepanel.html"), // TODO: Implement unlisted side-panel similar app (see: https://wxt.dev/guide/essentials/entrypoints.html#unlisted-pages)
      type: "popup",
      width: 400,
      height: 660, // plus 40, because of window bar
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
      <div className="flex gap-0 items-center justify-between w-full max-w-317 mx-auto inset-x-0">
        <div className="flex justify-start flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="ml-0.5 size-8 rounded-md flex items-center">
                <div className="flex items-center justify-center size-full rounded-full bg-secondary/80 ring ring-inset ring-black/20 dark:ring-white/20">
                  <UserIcon className="size-4.5" />
                  {/* TODO: If logged in, show user's avatar or initials */}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="select-none">
              <DropdownMenuLabel className="py-1">My Account</DropdownMenuLabel>
              <DropdownMenuItem className="py-1">Profile</DropdownMenuItem>
              <DropdownMenuItem className="py-1">Settings</DropdownMenuItem>
              {/*TODO: Maybe add "My Plan", "Subscription" or something like that, if we have a paid offering in the future */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-1">Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-1">Sign out</DropdownMenuItem>
              {/*TODO: Make dynamic based on login status */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          className="shrink-0 select-none"
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
        <div className="flex justify-end flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={openExtensionWindow}
            title="Open Lexicora in window"
            //title="Visit Lexicora.com"
          >
            <SquareArrowOutUpRightIcon className="size-4.5" />
            {/* <a
              href="https://lexicora.com"
              title="Visit Lexicora.com"
              target="_blank"
            >
              <SquareArrowOutUpRightIcon className="size-4.5" />
            </a> */}
          </Button>
        </div>
      </div>
    </section>
  );
}
