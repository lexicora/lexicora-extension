import { useState } from "react";
import reactLogo from "@/assets/logos/react.svg";
import wxtLogo from "/wxt.svg";
import lexicoraLightThemeLogo from "@/assets/logos/Lexicora_alt1.svg";
import lexicoraDarkThemeLogo from "@/assets/logos/Lexicora_alt2.svg";
import { getAppTheme } from "@/lib/theme-helper";
import "./HomePage.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import {
  ArrowUpRight,
  PanelRight,
  PanelRightOpen,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import { MSG } from "@/types/messaging";

function HomePage() {
  const [promptText, setPromptText] = useState("");
  //const { theme } = useTheme()

  // MAYBE: Force side panel to open to home page with messaging navigation implementation.
  const openSidePanel = async () => {
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: sidebarAction is a Firefox-specific API
      await browser.sidebarAction.open();
    } else {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      //const windowId = await browser.windows.getCurrent().then((win) => win.id);
      if (!tab) return;
      await browser.sidePanel.open({ windowId: tab.windowId });
    }
    // sendMessage(MSG.NAVIGATE_IN_SIDEPANEL, { path: "/" }, "popup").catch(
    //   () => {},
    // );
    window.close();
  };

  return (
    <div className="w-85 overflow-auto h-full pt-20 pb-15 px-2">
      <header>
        <nav
          className="fixed top-0 left-0 w-full p-2.75 z-10
          border-b border-solid border-(--color-border)
          bg-background/80 backdrop-blur-lg"
        >
          <div className="flex gap-0 items-center justify-between w-full">
            <div className="flex justify-start flex-1 gap-1">
              {/*MAYBE: Add dropdown menu of quick actions here (profile included)*/}
              <Avatar className="size-8 border ml-0.5" title="Profile">
                <AvatarImage
                  src="https://github.com/tgrant06.png"
                  alt="@tgrant06"
                />
                <AvatarFallback>TM</AvatarFallback>
              </Avatar>
            </div>
            <div
              className="shrink-0"
              onClick={() => {
                window.scrollTo({ top: 0 });
              }}
              title="Scroll to top"
            >
              {/*Maybe remove later and keep it blank*/}
              <img
                src={lexicoraLightThemeLogo}
                className="h-9 lc-display-light"
                alt="Lexicora logo"
                draggable="false"
              />
              <img
                src={lexicoraDarkThemeLogo}
                className="h-9 lc-display-dark"
                alt="Lexicora logo"
                draggable="false"
              />
            </div>
            <div className="flex justify-end flex-1">
              <Button
                onClick={openSidePanel}
                variant="ghost"
                size="icon"
                title="Open Side Panel"
              >
                <PanelRight />
              </Button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <section>
          {/*<Tooltip>
            <TooltipTrigger className="cursor-pointer" asChild>*/}
          <span className="inline-flex gap-3 items-baseline">
            {/*Maybe add link to lexicora.com */}
            <img
              src={lexicoraLightThemeLogo}
              className="h-6.5 lc-display-light"
              alt="Lexicora logo"
              draggable="false"
            />
            <img
              src={lexicoraDarkThemeLogo}
              className="h-6.5 lc-display-dark"
              alt="Lexicora logo"
              draggable="false"
            />
            <h1 className="text-4xl font-bold mb-2 text-[#00143d] dark:text-foreground">
              Lexicora
            </h1>
          </span>
          {/*TODO: Maybe show indication (like in browsers bottom left of window), where this link leads */}
          {/*</TooltipTrigger>
            <TooltipContent className="p-1">
          <p>
            Visit Lexicora.com <ArrowUpRight className="inline" size={16} />
          </p>
          </TooltipContent>
          </Tooltip>*/}
          <a
            href="https://lexicora.com"
            target="_blank"
            className="flex justify-center text-sm mt-0.5 text-muted-foreground hover:underline hover:underline-offset-2"
            //title="Go to Lexicora.com"
            title="https://lexicora.com"
          >
            Visit lexicora.com <ArrowUpRight className="inline" size={16} />
          </a>
          <hr className="mt-2.5 mx-2" />
          <article>
            <h2 className="text-lg font-medium mt-4 mb-1 text-[#00143d] dark:text-foreground">
              Describe what you want AI to do
            </h2>
            <p className="text-sm text-muted-foreground">
              Provide instructions for capturing and enhancing the content of
              the current page using AI.
            </p>
            <hr className="mx-24 mt-2.5" />
            <p className="text-sm text-muted-foreground mt-2">
              Or, leave it blank to capture the page as-is.
            </p>
          </article>
        </section>
        <section className="mt-5">
          <Textarea
            id="ai-prompt-textarea"
            placeholder="Type your desired AI prompt here."
            // Adjust default height to either 6 rows (min-h-40.5) or 5 rows (min-h-34.5)
            className="field-sizing-content resize-y /*min-h-40.5*/ min-h-34.5 ml-px w-[calc(100%-4px)] focus-visible:ring-0"
            maxLength={1000}
            value={promptText} // 3. Bind the state to the value prop
            onChange={(e) => setPromptText(e.target.value)} // 4. Update state on every keystroke
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                // Submit AI prompt logic here
                e.preventDefault();
                if (promptText.trim() === "") return;
                alert("Submitted AI request successfully!");
                // TODO: do more here
              }
            }}
          />
        </section>
      </main>
      <footer>
        <section
          className="fixed bottom-0 left-0 h-15 w-full p-3 z-10
                lc-bottom-bar-styled-bg"
        >
          <div className="flex gap-0 items-center justify-between w-full">
            <div
              className={`flex justify-start transition-all motion-reduce:transition-none duration-300 ease-in-out /*overflow-visible*/ ${
                promptText.trimEnd() === ""
                  ? "flex-1 max-w-[50%] mr-3"
                  : "flex-0 max-w-0 opacity-0 mr-0 blur-[6px]"
              }`}
            >
              <Button
                variant="secondary"
                title="Capture page"
                className="w-full hover:bg-secondary hover:brightness-90 overflow-hidden /*active:brightness-80*/"
                disabled={promptText.trimEnd() !== ""}
              >
                Capture
              </Button>
            </div>
            <div className="flex justify-end flex-1">
              <Button
                title="Capture page with AI"
                className="w-full hover:bg-primary hover:brightness-90 /*active:brightness-80*/"
              >
                Capture with AI
              </Button>
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
}

export default HomePage;
