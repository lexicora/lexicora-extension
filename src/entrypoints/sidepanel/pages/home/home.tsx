import { useState, useRef, useEffect } from "react";
import styles from "./home.module.css";
import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { useTabSupport } from "@/hooks/use-tab-support";
import { MSG } from "@/constants/messaging";
import type { TabData } from "@/types/tab-data.types";
import { sendMessage } from "@/lib/messaging";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRxCollection } from "rxdb/plugins/react";
import type { TopicDocType } from "@/db/schemas/topic";
import type { EntryDocType } from "@/db/schemas/entry";

function HomePage() {
  const navigate = useNavigate();
  const { isSupported, activeTab } = useTabSupport();
  const [promptText, setPromptText] = useState("");
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const [favoriteTopics, setFavoriteTopics] = useState<TopicDocType[]>([]);
  const [favoriteEntries, setFavoriteEntries] = useState<EntryDocType[]>([]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({ selector: { isFavorite: true }, sort: [{ updatedAt: "desc" }] })
      .$.subscribe({
        next: (docs) =>
          setFavoriteTopics(
            docs.slice(0, 6).map((d) => d.toJSON() as TopicDocType),
          ),
        error: () => setFavoriteTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!entriesCollection) return;
    const sub = entriesCollection
      .find({ selector: { isFavorite: true }, sort: [{ updatedAt: "desc" }] })
      .$.subscribe({
        next: (docs) =>
          setFavoriteEntries(
            docs.slice(0, 6).map((d) => d.toJSON() as EntryDocType),
          ),
        error: () => setFavoriteEntries([]),
      });
    return () => sub.unsubscribe();
  }, [entriesCollection]);

  const capturePage = async () => {
    if (!isSupported) return;
    let finalTab = activeTab;
    if (!finalTab?.id || !finalTab?.windowId) {
      const [queriedTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      finalTab = queriedTab;
    }
    if (!finalTab?.id || !finalTab?.windowId) return;
    const tabData: TabData = {
      tabId: finalTab.id,
      windowId: finalTab.windowId,
    };
    sendMessage(MSG.REQUEST_PAGE_CAPTURE, {
      ...tabData,
      fromContext: "side-panel",
    }).catch(() => null);
    navigate("/library/entries/new", {
      viewTransition: true,
      state: { isCapturePending: true },
    });
  };

  return (
    <PageContainer id="lc-home-page">
      <header className="mt-4">
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
      </header>
      <main className="mb-12">
        <section className="mt-3">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <StarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Favorite Topics
            </span>
          </div>
          {favoriteTopics.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {favoriteTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() =>
                    navigate(`/library/topics/${topic.id}`, {
                      viewTransition: true,
                    })
                  }
                  className="shrink-0 px-3 py-1.5 text-sm bg-card hover:bg-card-hover rounded-full text-foreground truncate max-w-40 border border-border transition-colors duration-150"
                >
                  {topic.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground px-1 py-1">
              No favorite topics yet.
            </p>
          )}
        </section>

        <section className="mt-4">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <StarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Favorite Entries
            </span>
          </div>
          {favoriteEntries.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {favoriteEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() =>
                    navigate(`/library/entries/${entry.id}`, {
                      viewTransition: true,
                    })
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 bg-card hover:bg-card-hover rounded-xl text-left border border-border transition-colors duration-150"
                >
                  {entry.faviconUrl && (
                    <img
                      src={entry.faviconUrl}
                      className="size-4 shrink-0"
                      alt=""
                    />
                  )}
                  <span className="text-sm truncate">{entry.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground px-1 py-1">
              No favorite entries yet.
            </p>
          )}
        </section>

        <section className="mt-5">
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
            ref={aiPromptTextareaRef}
            placeholder="Type your desired AI prompt here."
            className="field-sizing-content resize-y min-h-[max(138px,calc(100vh-478px))] w-[calc(100%-2px)] mx-auto scrollbar-thin
            transition-colors duration-150 focus-visible:ring-0"
            maxLength={1000}
            disabled={!isSupported}
            title={
              isSupported
                ? ""
                : "You are currently on a unsupported page for capturing."
            }
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                aiPromptTextareaRef.current?.blur();
              }
              // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                if (promptText.trim() === "") return;
                alert("Submitted AI request successfully!");
              }
            }}
          />
        </section>
      </main>
      <footer className={styles.bottomFooter}>
        <section className="fixed bottom-14.75 left-0 h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-10 lc-bottom-bar-styled-bg">
          <div className="flex gap-0 items-center justify-between w-full max-w-(--lc-content-max-width) mx-auto inset-x-0">
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
                  "w-full hover:bg-secondary hover:brightness-90 overflow-hidden disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:brightness-100",
                  {
                    "disabled:pointer-events-none": promptText.trimEnd() !== "",
                  },
                )}
                disabled={promptText.trimEnd() !== "" || !isSupported}
                onClick={capturePage}
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
                className="w-full hover:bg-primary hover:brightness-90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:brightness-100"
                disabled={!isSupported}
              >
                Capture with AI
              </Button>
            </div>
          </div>
        </section>
      </footer>
    </PageContainer>
  );
}

export default HomePage;
