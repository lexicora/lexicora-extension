import { useState } from "react";
import reactLogo from "@/assets/logos/react.svg";
import wxtLogo from "/wxt.svg";
import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import "./HomePage.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { PlusIcon, ArrowUpRightIcon } from "lucide-react";

function HomePage() {
  const [promptText, setPromptText] = useState("");
  //const [count, setCount] = useState(0);

  //const createBtn = "bg-green-600 hover:bg-green-700 text-white hover:text-gray-100";

  return (
    <div id="lc-home-page" className="lc-page-container select-none">
      <div className="lc-page-container-inner">
        <header className="mt-4">
          <span className="flex justify-center gap-3 items-baseline mb-3">
            {/*Maybe add link to lexicora.com */}
            <img
              src={lexicoraLightThemeLogoNoBg}
              className="h-6.5 lc-display-light rounded-xs"
              alt="Lexicora logo"
              draggable="false"
            />
            <img
              src={lexicoraDarkThemeLogoNoBg}
              className="h-6.5 lc-display-dark rounded-xs"
              alt="Lexicora logo"
              draggable="false"
            />
            {/*#00143d is the Lexicora color */}
            <h1 className="text-4xl font-bold mb-2 text-[#00143d] dark:text-foreground leading-0">
              Lexicora
            </h1>
          </span>
          <div className="flex justify-center mt-1">
            <a
              href="https://lexicora.com"
              target="_blank"
              className="text-sm text-muted-foreground transition-all duration-100 hover:underline hover:underline-offset-2 hover:text-(--lc-muted-foreground-hover)"
              title="https://lexicora.com"
            >
              Visit Lexicora.com{" "}
              <ArrowUpRightIcon className="inline" size={16} />
            </a>
          </div>
          <hr className="mt-3 mx-2" />
        </header>
        <main className="mb-12">
          <section className="mt-4">
            <h2 className="text-base font-semibold text-red-400 /*text-[#00143d]*/ /*dark:text-foreground*/">
              Put other actions and stuff here!
            </h2>
            {/* Maybe add buttons for recent captures, settings, help, most recent entries, favorit entries etc. */}
            <hr className="mt-3 mx-2" />
          </section>
          <section>
            {/*TODO: Maybe show indication (like in browsers bottom left of window), where this link leads */}
            <article>
              <h2 className="text-lg font-medium mt-4 mb-1 text-[#00143d] dark:text-foreground">
                Describe what you want AI to do
              </h2>
              <p className="text-sm text-muted-foreground">
                Provide instructions for capturing and enhancing the content of
                the current page using AI.
              </p>
              <hr className="mx-24 mt-2.75" />
              <p className="text-sm text-muted-foreground mt-2">
                Or, leave it blank to capture the page as-is.
              </p>
            </article>
          </section>
          <section className="mt-5">
            <Textarea
              id="ai-prompt-textarea"
              placeholder="Type your desired AI prompt here."
              // Adjust default height to full height minus top and bottom bars and content above
              className="field-sizing-content resize-y min-h-[max(138px,calc(100vh-478px))] /*min-h-34.5*/ /*max-h-300*/ w-[calc(100%-2px)] max-w-313.5 mx-auto scrollbar-thin
            transition-colors duration-150 focus-visible:ring-0"
              maxLength={1000}
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                // Makes sure shadow disappears
              }} // 4. Update state on every keystroke
              onKeyDown={(e) => {
                // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
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
        <footer id="lc-home-page-bottom-footer">
          <section
            className="fixed bottom-14.75 left-0 h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-10
                lc-bottom-bar-styled-bg"
          >
            {/*MAYBE: Remove the animation disabling motion-reduce, because it is a very noticeable and maybe not optimal for accessibility*/}
            <div className="flex gap-0 items-center justify-between w-full max-w-314 mx-auto inset-x-0">
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
        {/*<div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="test-app text-3xl">WXT + React</h1>
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
          <ModeToggle />
        </div>
        <div className="mb-4">
          <Link to="/entries/new" viewTransition={true}>
            <Button
              variant="secondary"
              className="green-button" //createBtn
              size="sm"
            >
              <PlusIcon /> New Entry
            </Button>
          </Link>
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>*/}
      </div>
    </div>
  );
}

export default HomePage;
