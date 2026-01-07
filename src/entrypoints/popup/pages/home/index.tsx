import { useState } from "react";
import reactLogo from "@/assets/logos/react.svg";
import wxtLogo from "/wxt.svg";
import lexicoraLightThemeLogo from "@/assets/logos/Lexicora_alt1.svg";
import lexicoraDarkThemeLogo from "@/assets/logos/Lexicora_alt2.svg";
import { getAppTheme } from "@/lib/theme-helper";
import "./HomePage.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowUpRight, PanelRight, PanelRightOpen } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import { MSG } from "@/types/messaging";
import { sendMessage } from "webext-bridge/background"; // HACK NOTE: Using background works for sidepanel, due to sidepanel using popup as a workaround
import { Textarea } from "@/components/ui/textarea";

function HomePage() {
  const [count, setCount] = useState(0);
  const [promptText, setPromptText] = useState("");
  //const { theme } = useTheme()

  // MAYBE: Force side panel to open to home page with messaging navigation implementation.
  const openSidePanel = async () => {
    if (import.meta.env.FIREFOX) {
      // NOTE: Firefox always reloads the sidebar to default page, even when open.
      // @ts-ignore: sidebarAction is a Firefox-specific API
      await browser.sidebarAction.open();
    } else {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
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
          className="fixed top-0 left-0 w-full p-3 z-10
          border-b border-solid border-(--color-border)
          bg-background/80 backdrop-blur-lg"
        >
          <div className="flex gap-0 items-center justify-between w-full">
            <div className="flex justify-start flex-1 gap-1">
              {/*<Button
                onClick={() => setCount((count) => count + 1)}
                variant="secondary"
              >
                count is {count}
              </Button>*/}
              {/*<ModeToggle />*/}
              <Avatar className="size-8 border" title="Profile">
                <AvatarImage
                  src="https://github.com/tgrant06.png"
                  alt="@tgrant06"
                />
                <AvatarFallback>TM</AvatarFallback>
              </Avatar>
            </div>
            <div className="shrink-0">
              {/*Maybe remove later and keep it blank*/}
              {/*Maybe add link to lexicora.com */}
              <img
                src={lexicoraLightThemeLogo}
                className="h-9 lc-light-theme-logo"
                alt="Lexicora logo"
                draggable="false"
              />
              <img
                src={lexicoraDarkThemeLogo}
                className="h-9 lc-dark-theme-logo"
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
          <span className="inline-flex gap-3 items-baseline">
            {/*Maybe add link to lexicora.com */}
            <img
              src={lexicoraLightThemeLogo}
              className="h-6.5 lc-light-theme-logo"
              alt="Lexicora logo"
              draggable="false"
            />
            <img
              src={lexicoraDarkThemeLogo}
              className="h-6.5 lc-dark-theme-logo"
              alt="Lexicora logo"
              draggable="false"
            />
            <h1 className="text-4xl font-bold mb-2 text-[#00143d] dark:text-foreground">
              Lexicora
            </h1>
          </span>
          <h2 className="test-app text-2xl font-bold">WXT + React</h2>
          <div className="card">
            <div className="flex gap-2.5 justify-center mb-2.5">
              <Button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </Button>
              <Button onClick={openSidePanel}>
                Open Side Panel <ArrowUpRight />
              </Button>
              <ModeToggle />
            </div>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the WXT and React logos to learn more
          </p>
          <article>
            <p>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet.
            </p>
          </article>
        </section>
        <section className="mt-6">
          <Textarea
            placeholder="Type your desired AI prompt here."
            className="resize-y field-sizing-content min-h-29 ml-px w-[calc(100%-4px)] focus-visible:ring-0"
            value={promptText} // 3. Bind the state to the value prop
            onChange={(e) => setPromptText(e.target.value)} // 4. Update state on every keystroke
          />
        </section>
      </main>
      <footer>
        <section
          className="fixed bottom-0 left-0 h-15.25 w-full p-3 pt-3.25 z-10
          lc-bottom-bar-styled-bg"
        >
          <div className="flex gap-3 items-center justify-between w-full">
            <div className="flex justify-start flex-1">
              <Button
                variant="secondary"
                title="Capture page"
                className="w-full hover:bg-secondary hover:brightness-90 /*active:brightness-80*/"
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
