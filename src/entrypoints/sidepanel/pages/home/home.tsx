import { useState } from "react";
import styles from "./home.module.css";
import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  HistoryIcon,
  PinIcon,
  StarIcon,
} from "lucide-react";
import { useTabSupport } from "@/hooks/use-tab-support";
import { FEATURES } from "@/constants/features";
import { MSG } from "@/constants/messaging";
import type { TabData } from "@/types/tab-data.types";
import type { CaptureMode } from "@/types/page-data.types";
import { sendMessage } from "@/lib/messaging";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHomeData } from "./__hooks__/use-home-data";
import { AiPromptSection } from "@/components/home/ai-prompt-section";
import { LibraryEmptyState } from "@/components/home/library-empty-state";
import { RecentEntries } from "@/components/home/recent-entries";
import { CaptureActions } from "@/components/capture/capture-actions";

function formatFavoriteCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 10000) {
    const value = count / 1000;
    return `${value % 1 === 0 ? value : value.toFixed(1)}k`;
  }
  return `${Math.floor(count / 1000)}k+`;
}

function HomePage() {
  const navigate = useNavigate();
  const { isSupported, activeTab } = useTabSupport();
  const [promptText, setPromptText] = useState("");

  const {
    favoriteTopicsCount,
    favoriteEntriesCount,
    combinedTopics,
    maxTopicsToShow,
    recentEntries,
    isLibraryEmpty,
  } = useHomeData();

  /**
   * Single composition point for the flexible middle of the page. The three
   * options are alternatives for the same space and must never render together.
   * Turning FEATURES.AI back on restores the original prompt layout.
   */
  const mainContent = FEATURES.AI
    ? "ai-prompt"
    : isLibraryEmpty
      ? "empty-state"
      : "recent-entries";

  const capturePage = async (mode: CaptureMode = "page") => {
    if (!isSupported) return;
    let finalTab = activeTab;
    if (!finalTab?.id || !finalTab?.windowId) {
      const [queriedTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      finalTab = queriedTab ?? null;
    }
    if (!finalTab?.id || !finalTab?.windowId) return;
    const tabData: TabData = {
      tabId: finalTab.id,
      windowId: finalTab.windowId,
    };
    sendMessage(MSG.REQUEST_PAGE_CAPTURE, {
      ...tabData,
      fromContext: "side-panel",
      mode,
    }).catch(() => null);
    navigate("/library/entries/new", {
      viewTransition: true,
      state: { isCapturePending: true },
    });
  };

  return (
    <PageContainer id="lc-home-page" classNameInner="flex flex-col">
      <header className="mt-4 shrink-0">
        <span className="flex justify-center gap-3 items-baseline mb-3">
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
            Visit Lexicora.com <ArrowUpRightIcon className="inline" size={16} />
          </a>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <section className="mt-3 shrink-0">
          <div className="flex items-center justify-center gap-2.75">
            <Button
              size="sm"
              variant="secondary"
              className="group flex items-center justify-center min-w-34 gap-1.5 pl-2.5 pr-2 rounded-full bg-card hover:bg-card-hover not-dark:shadow-xs"
              title="Favorite entries"
              onClick={() =>
                navigate("/library?tab=entries&favorites=true", {
                  viewTransition: true,
                })
              }
            >
              <StarIcon className="size-3.5 text-yellow-600 fill-yellow-600 dark:text-yellow-500 dark:fill-yellow-500 shrink-0" />
              Entries
              <span className="text-xs text-muted-foreground mt-0.5">
                {formatFavoriteCount(favoriteEntriesCount)}
              </span>
              <ChevronRightIcon className="transition-opacity size-3 shrink-0 opacity-70 group-hover:opacity-90" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="group flex items-center justify-center min-w-34 gap-1.5 pl-2.5 pr-2 rounded-full bg-card hover:bg-card-hover not-dark:shadow-xs"
              title="Favorite topics"
              onClick={() =>
                navigate("/library?tab=topics&favorites=true", {
                  viewTransition: true,
                })
              }
            >
              <StarIcon className="size-3.5 text-yellow-600 fill-yellow-600 dark:text-yellow-500 dark:fill-yellow-500 shrink-0" />
              Topics
              <span className="text-xs text-muted-foreground mt-0.5">
                {formatFavoriteCount(favoriteTopicsCount)}
              </span>
              <ChevronRightIcon className="transition-opacity size-3 shrink-0 opacity-70 group-hover:opacity-90" />
            </Button>
          </div>
          <div className="flex flex-col gap-1.75 mt-2">
            {combinedTopics.map((topic, index) => (
              <Button
                key={topic.id}
                variant="secondary"
                className={cn(
                  "group w-full flex items-center h-9.5 gap-2 px-3 bg-card hover:bg-card-hover not-dark:shadow-xs rounded-xl text-left transition-colors",
                  index === 0 && "mt-1.75",
                )}
                //title="View topic"
                onClick={() =>
                  navigate(`/library/topics/${topic.id}`, {
                    viewTransition: true,
                  })
                }
              >
                {topic.isPinned ? (
                  <PinIcon className="size-3.5 text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500 shrink-0" />
                ) : (
                  <HistoryIcon className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm truncate flex-1">{topic.name}</span>
                <ChevronRightIcon className="transition-opacity size-3.5 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100" />
              </Button>
            ))}
            {mainContent !== "empty-state" &&
              combinedTopics.length < maxTopicsToShow && (
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  navigate("/library/topics/new", { viewTransition: true })
                }
                className="self-center -mb-2"
              >
                Create a topic
              </Button>
            )}
          </div>
        </section>

        {mainContent === "ai-prompt" && (
          <AiPromptSection
            isSupported={isSupported}
            promptText={promptText}
            onPromptTextChange={setPromptText}
          />
        )}
        {mainContent === "empty-state" && <LibraryEmptyState />}
        {mainContent === "recent-entries" && (
          <RecentEntries entries={recentEntries} />
        )}
      </main>
      <footer className={styles.bottomFooter}>
        <section className="fixed bottom-14.75 left-0 h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-10 lc-bottom-bar-styled-bg">
          <div className="flex gap-0 items-center justify-between w-full max-w-(--lc-content-max-width) mx-auto inset-x-0">
            {FEATURES.AI ? (
              <>
                <div
                  className={`flex justify-start transition-all motion-reduce:transition-none duration-300 ease-in-out ${
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
                    onClick={() => capturePage("page")}
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
              </>
            ) : (
              <CaptureActions
                isSupported={isSupported}
                onCapturePage={() => capturePage("page")}
                onBookmarkPage={() => capturePage("bookmark")}
              />
            )}
          </div>
        </section>
      </footer>
    </PageContainer>
  );
}

export default HomePage;
