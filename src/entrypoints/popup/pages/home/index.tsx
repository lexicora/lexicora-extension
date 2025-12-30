import { useState } from "react";
import reactLogo from "@/assets/logos/react.svg";
import wxtLogo from "/wxt.svg";
import "./HomePage.css";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowUpRight } from "lucide-react";

function HomePage() {
  const [count, setCount] = useState(0);

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

  return (
    <div className="w-100">
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
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
    </div>
  );
}

export default HomePage;
