import { useState, useRef, useEffect } from "react";
import styles from "./home.module.css";
import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  HistoryIcon,
  PinIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react";
import { useTabSupport } from "@/hooks/use-tab-support";
import { MSG } from "@/constants/messaging";
import type { TabData } from "@/types/tab-data.types";
import { sendMessage } from "@/lib/messaging";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRxCollection } from "rxdb/plugins/react";
import { Separator } from "@/components/ui/separator";
import type { TopicDocType } from "@/db/schemas/topic";

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
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const topicsCollection = useRxCollection("topics");
  const entriesCollection = useRxCollection("entries");
  const [favoriteTopicsCount, setFavoriteTopicsCount] = useState(0);
  const [favoriteEntriesCount, setFavoriteEntriesCount] = useState(0);
  const [pinnedTopics, setPinnedTopics] = useState<TopicDocType[]>([]);
  const [recentTopics, setRecentTopics] = useState<TopicDocType[]>([]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .count({ selector: { isFavorite: true } })
      .$.subscribe({
        next: setFavoriteTopicsCount,
        error: () => setFavoriteTopicsCount(0),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({
        selector: { isPinned: true, isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: 3,
      })
      .$.subscribe({
        next: (docs) =>
          setPinnedTopics(docs.map((d) => d.toJSON() as TopicDocType)),
        error: () => setPinnedTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection
      .find({
        selector: { isArchived: false },
        sort: [{ updatedAt: "desc" }],
        limit: 6,
      })
      .$.subscribe({
        next: (docs) =>
          setRecentTopics(docs.map((d) => d.toJSON() as TopicDocType)),
        error: () => setRecentTopics([]),
      });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  const combinedTopics = [
    ...pinnedTopics,
    ...recentTopics.filter(
      (topic) => !pinnedTopics.some((pinned) => pinned.id === topic.id),
    ),
  ].slice(0, 3);

  useEffect(() => {
    if (!entriesCollection) return;
    const sub = entriesCollection
      .count({ selector: { isFavorite: true } })
      .$.subscribe({
        next: setFavoriteEntriesCount,
        error: () => setFavoriteEntriesCount(0),
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
    <PageContainer
      id="lc-home-page"
      classNameInner="flex flex-col h-[calc(100vh-142px)]"
    >
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
      <main className="flex-1 min-h-0 flex flex-col pb-12">
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
                  "group w-full flex items-center h-9.5 gap-2 px-3 bg-card hover:bg-card-hover not-dark:shadow-xs rounded-xl text-left",
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
            {combinedTopics.length < 3 && (
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  navigate("/library/topics/new", { viewTransition: true })
                }
                className={cn(
                  "self-center -mb-2",
                  //combinedTopics.length > 0 && "-mb-1",
                  //combinedTopics.length === 0 && "-mt-1.5",
                )}
              >
                Create a topic
              </Button>
            )}
          </div>
        </section>
        <Separator className="mt-4 mx-auto max-w-[calc(100%-8px)] shrink-0" />
        <section className="mt-5 shrink-0">
          <h2 className="text-lg font-medium mb-1 text-[#00143d] dark:text-foreground">
            Describe what you want AI to do
          </h2>
          <p className="text-sm text-muted-foreground">
            Optional — leave blank to capture the page as-is.
          </p>
        </section>
        <section className="mt-5 flex-1 min-h-0 flex flex-col">
          <Textarea
            id="ai-prompt-textarea"
            ref={aiPromptTextareaRef}
            placeholder="Type your desired AI prompt here."
            className="flex-1 min-h-22.5 resize-y w-[calc(100%-2px)] mx-auto scrollbar-thin
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
