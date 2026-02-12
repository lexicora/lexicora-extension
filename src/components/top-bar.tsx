import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { useScrollPos } from "@/providers/scroll-observer";

export function TopBar() {
  const { isAtTop } = useScrollPos();

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
          <Avatar className="size-8 ml-0.5" title="Profile">
            <AvatarImage
              src="https://github.com/tgmaurer.png"
              alt="@tgmaurer"
            />
            <AvatarFallback>TG</AvatarFallback>
          </Avatar>
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
            //title="Visit Lexicora.com"
            asChild
          >
            <a
              href="https://lexicora.com"
              title="Visit Lexicora.com"
              target="_blank"
            >
              <ExternalLinkIcon className="size-4.5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
