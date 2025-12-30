import { useState } from "react";
import reactLogo from "@/assets/logos/react.svg";
import wxtLogo from "/wxt.svg";
import lexicoraLightThemeLogo from "@/assets/logos/Lexicora_alt1.svg";
import lexicoraDarkThemeLogo from "@/assets/logos/Lexicora_alt2.svg";
import { getAppTheme } from "@/lib/theme-helper";
import "./HomePage.css";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowUpRight, PanelRight, PanelRightOpen } from "lucide-react";

function HomePage() {
  const [count, setCount] = useState(0);
  //const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [theme, setTheme] = useState(getAppTheme());

  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: Browser.storage.StorageChange;
    }) => {
      if (changes["lexicora-ui-theme"]) {
        //@ts-ignore: Theme is always light | dark or undefined
        setTheme(changes["lexicora-ui-theme"].newValue);
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const openSidePanel = async () => {
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: sidebarAction is a Firefox-specific API
      await browser.sidebarAction.toggle();
    } else {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;
      await browser.sidePanel.open({ tabId: tab.id });
    }
    window.close();
  };

  // eventlistener for when theme changes to re-render the component

  return (
    <div className="w-85 overflow-auto h-full pt-20 pb-32 px-6">
      <div>
        <section
          className="fixed top-0 left-0 w-full border-b border-solid p-3"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div className="flex justify-start flex-1 gap-1">
              <Button
                onClick={() => setCount((count) => count + 1)}
                variant="secondary"
              >
                count is {count}
              </Button>
              <ModeToggle />
            </div>
            <div className="shrink-0">
              {theme === "light" ? (
                <img
                  src={lexicoraLightThemeLogo}
                  className="h-9"
                  alt="Lexicora logo"
                />
              ) : (
                <img
                  src={lexicoraDarkThemeLogo}
                  className="h-9"
                  alt="Lexicora logo"
                />
              )}
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
        </section>
      </div>

      <div>
        <section>
          {/*<div>
          <a href="https://wxt.dev" target="_blank">
            <img src={wxtLogo} className="logo" alt="WXT logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>*/}
          <h1 className="test-app text-3xl font-bold">WXT + React</h1>
          <div className="card">
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
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
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
            et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
            et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </section>
      </div>
      <div>
        <section
          className="fixed bottom-0 left-0 h-28 w-full border-t border-solid"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
          }}
        ></section>
      </div>
    </div>
  );
}

export default HomePage;
