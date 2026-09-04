import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";

import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRightIcon, PanelRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useScrollPos } from "@/providers/scroll-observer";

interface PopupAiLayoutProps {
  isSupported: boolean;
  promptText: string;
  onPromptTextChange: (value: string) => void;
  onOpenSidePanel: () => void;
  onCapturePage: () => void;
}

/**
 * The popup as designed before the feature flags, kept verbatim so turning
 * `FEATURES.AI` back on restores the original layout rather than a
 * reconstruction: a scroll-aware fixed nav, the full Lexicora wordmark, the
 * tall prompt textarea, and the footer whose plain "Capture" button collapses
 * away as soon as a prompt is typed.
 *
 * The account menu is the one deliberate change — it now comes from the shared
 * `AccountMenu`, which renders nothing while `FEATURES.ACCOUNTS` is off.
 */
export function PopupAiLayout({
  isSupported,
  promptText,
  onPromptTextChange,
  onOpenSidePanel,
  onCapturePage,
}: PopupAiLayoutProps) {
  const { isAtTop } = useScrollPos();

  return (
    <div className="w-85 overflow-auto h-full pt-20 pb-15 px-3 select-none">
      <header>
        <nav
          className={cn(
            "fixed top-0 left-0 w-full p-2.75 z-10 border-b bg-background/80 backdrop-blur-lg transition-shadow duration-150 shadow-none",
            { "shadow-md/5 dark:shadow-md/20": !isAtTop },
          )}
        >
          <div className="flex gap-0 items-center justify-between w-full">
            <div className="flex justify-start flex-1">
              <AccountMenu className="bg-secondary/80" />
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
                onClick={onOpenSidePanel}
                variant="ghost"
                size="icon"
                title="Open Side Panel"
                // Maybe change title to "Open app (in side panel)", or similar. potentially leave out (in side panel).
              >
                <PanelRightIcon className="size-4.5" />
              </Button>
            </div>
          </div>
        </nav>
        <section className="mt-1">
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
              className="text-sm text-muted-foreground transition-all duration-100 hover:underline hover:underline-offset-2 hover:text-lc-muted-foreground-hover"
              title="https://lexicora.com"
            >
              Visit Lexicora.com{" "}
              <ArrowUpRightIcon className="inline" size={16} />
            </a>
          </div>
          {/*TODO: Maybe show indication (like in browsers bottom left of window), where this link leads */}
        </section>
      </header>
      <main>
        <section>
          <hr className="mt-3 mx-2" />
          <article>
            <h2 className="text-lg font-medium mt-4 mb-1 text-[#00143d] dark:text-foreground">
              Describe what you want AI to do
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Optional — leave blank to capture the page as-is.
            </p>
          </article>
        </section>
        <section className="mt-5">
          <Textarea
            id="ai-prompt-textarea"
            placeholder="Type your desired AI prompt here."
            // Adjust default height to either 6 rows (min-h-40.5) or 5 rows (min-h-34.5)
            className="field-sizing-content resize-y /*min-h-40.5*/ min-h-34.5 /*max-h-300*/ ml-px w-[calc(100%-2px)] scrollbar-thin
            transition-colors duration-150 focus-visible:ring-0 /*not-dark:border-gray-300*/ /*shadow-none*/"
            maxLength={1000}
            disabled={!isSupported}
            title={
              isSupported
                ? ""
                : "You are currently on a unsupported page for capturing."
            }
            value={promptText}
            onChange={(e) => onPromptTextChange(e.target.value)}
            onKeyDown={(e) => {
              // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
              if (e.ctrlKey && e.key === "Enter") {
                // Submit AI prompt logic here
                e.preventDefault();
                if (promptText.trim() === "") return;
                // TODO: Submit the AI capture request once an AI backend exists (#52).
              }
            }}
          />
        </section>
      </main>
      <footer>
        <section className="fixed bottom-0 left-0 h-15 w-full p-3 pt-2.75 z-10 lc-bottom-bar-styled-bg">
          {/*MAYBE: Remove the animation disabling motion-reduce, because it is a very noticeable and maybe not optimal for accessibility*/}
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
                title={
                  isSupported
                    ? "Capture page"
                    : "You are currently on a unsupported page for capturing."
                }
                className={cn(
                  "w-full hover:bg-[color-mix(in_oklab,var(--secondary),black_7%)] dark:hover:bg-[color-mix(in_oklab,var(--secondary)80%,var(--background))] overflow-hidden",
                  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-secondary!",
                )}
                disabled={promptText.trimEnd() !== "" || !isSupported}
                onClick={onCapturePage}
              >
                Capture
              </Button>
            </div>
            <div className="flex justify-end flex-1">
              <Button
                title={
                  isSupported
                    ? "Capture page with AI"
                    : "You are currently on a unsupported page for capturing."
                }
                className="w-full hover:bg-[color-mix(in_oklab,var(--primary)80%,var(--background))] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
                disabled={!isSupported}
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
