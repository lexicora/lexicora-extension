import styles from "./entry-create.module.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { appBlockNoteConfig } from "@/components/editor/config";
import { useCaptureData } from "@/hooks/sidepanel/use-capture-data";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  useBlocker,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";

// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { BlockNoteView } from "@/components/editor/BlockNoteView";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { useScrollPos } from "@/providers/scroll-observer";
import { useCreateBlockNote } from "@blocknote/react";

import { useRxCollection, useRxDatabase } from "rxdb/plugins/react";
import { EntryForm, type EntryFormData } from "@/components/forms/entry-form";
import { navLock } from "@/lib/navigation-lock";
import { type TopicDocType } from "@/db/schemas/topic";
import { convertBlockNoteBlocks } from "@/lib/utils/block-converter";
import { uuidv7 } from "uuidv7";

import { ArrowUpIcon, SaveIcon } from "lucide-react";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes

function EntryCreatePage() {
  const location = useLocation(); // This is used in order to trigger useEffect on location change
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editor = useCreateBlockNote(appBlockNoteConfig); // Works also like this (if necessary): {...defaultBlockNoteConfig}
  const capturedData = useCaptureData();
  const { isAtBottom } = useScrollPos();
  const [language, setLanguage] = useState(navigator.language || "en");
  const [promptText, setPromptText] = useState("");
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [topics, setTopics] = useState<TopicDocType[]>([]);

  const [editorIsDirty, setEditorIsDirty] = useState(false);
  const initialDocJsonRef = useRef(JSON.stringify(editor.document));
  // Exclude same-pathname navigations (e.g. the router-state cleanup after capture) from the blocker
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return (
      (formIsDirty || editorIsDirty) &&
      !isSaving &&
      nextLocation.pathname !== currentLocation.pathname
    );
  });
  const topicsCollection = useRxCollection("topics");
  const db = useRxDatabase();

  const isPromptActive = isPromptFocused || promptText.trim() !== "";

  //const [isEditorReady, setIsEditorReady] = useState(false); // other approach with requestAnimation frame contrary to useLayoutEffect
  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLElement>(null);
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isAutoCaptureNav = location.state?.isCapturePending === true;
  const showSkeleton = isAutoCaptureNav && !capturedData;
  //const showSkeleton = isAutoCaptureNav && (!capturedData || !isEditorReady); // other approach with requestAnimation frame contrary to useLayoutEffect

  const rightActionButton = {
    iconSmall: <SaveIcon className="size-4.5" />, // You can replace this with an actual icon component
    iconLarge: <SaveIcon className="size-5.5" />, // You can replace this with an actual icon component
    isLoading: isSaving,
    variant: "default" as const,
    //onClick: () => {},
    title: "Save Entry",
    type: "submit" as const,
    form: "entry-create-form",
  };

  useEffect(() => {
    return editor.onChange(() => {
      setEditorIsDirty(
        JSON.stringify(editor.document) !== initialDocJsonRef.current,
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection.find().$.subscribe((results) => {
      setTopics(results.map((r) => r.toJSON() as TopicDocType));
    });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  const handleEntrySubmit = async (data: EntryFormData) => {
    if (!db) return;
    setIsSaving(true);
    navLock.lock();
    const editorBlocks = editor.document;

    const promise = (async () => {
      const entryId = uuidv7();

      let finalTopicId = data.topicId;
      const isExistingTopic = topics.some((t) => t.id === finalTopicId);

      if (!isExistingTopic && finalTopicId) {
        const newTopicId = uuidv7();
        await db.topics.insert({
          id: newTopicId,
          name: finalTopicId, //* NOTE: Is effectively the name of the not yet existing topic given.
          description: "",
          tags: [],
          isFavorite: false,
          isPinned: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        finalTopicId = newTopicId;
      }

      let urlObj: URL | null = null;
      if (data.url.trim() !== "") {
        try {
          urlObj = new URL(data.url);
        } catch (e) {
          console.warn("Invalid URL for database parts:", data.url);
        }
      }

      await db.entries.insert({
        id: entryId,
        topicId: finalTopicId,
        title: data.title,
        description: data.description,
        tags: data.tags,
        isFavorite: data.isFavorite,
        isPinned: false,
        isArchived: false,
        archivedExplicitly: false,
        languageCode: data.languageCode,
        siteName: data.siteName,
        faviconUrl: data.faviconUrl,
        url: data.url,
        hostnameUrl: urlObj?.hostname || "",
        pathnameUrl: urlObj?.pathname || "",
        searchUrl: urlObj?.search || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const dbBlocks = convertBlockNoteBlocks(
        editorBlocks,
        entryId,
        "00000000-0000-0000-0000-000000000000",
      );
      if (dbBlocks.length > 0) {
        await db.blocks.bulkInsert(dbBlocks);
      }

      return entryId;
    })();

    toast.promise(promise, {
      loading: "Creating entry...",
      success: "Entry created",
      error: "Failed to create entry",
    });

    try {
      const entryId = await promise;
      navigate(`/library/entries/${entryId}`, {
        replace: true,
        viewTransition: true,
      });
    } catch (e) {
      console.error("Failed to save entry:", e);
    } finally {
      setIsSaving(false);
      navLock.unlock();
    }
  };

  useLayoutEffect(() => {
    if (capturedData?.content) {
      setLanguage(capturedData.lang || navigator.language || "en");
      const blocks = editor.tryParseHTMLToBlocks(capturedData.content);
      if (capturedData.misc.overrideExisting) {
        editor.replaceBlocks(editor.document, blocks);
        return;
      }
      const currentBlocks = editor.document;
      const isEmpty =
        currentBlocks.length === 1 &&
        currentBlocks[0].type === "paragraph" &&
        (!currentBlocks[0].content || currentBlocks[0].content.length === 0) &&
        (!currentBlocks[0].children || currentBlocks[0].children.length === 0);

      if (isEmpty) {
        editor.replaceBlocks(currentBlocks, blocks);
      } else {
        editor.insertBlocks(
          blocks,
          currentBlocks[currentBlocks.length - 1].id,
          "after",
        ); // currentBlocks[0].id, would work too.
      }
    }
  }, [capturedData, editor]);

  // Clear the router state once the data has successfully arrived
  useEffect(() => {
    if (capturedData && location.state?.isCapturePending) {
      const transitionDuration = 200;
      const cleanupTimer = setTimeout(() => {
        navigate(location.pathname, {
          replace: true,
          preventScrollReset: !capturedData.misc.overrideExisting,
          state: {},
        });
      }, transitionDuration);
      if (capturedData.misc.overrideExisting) window.scrollTo({ top: 0 });
      return () => clearTimeout(cleanupTimer);
    }
  }, [capturedData, location.state, navigate, location.pathname]);

  useEffect(() => {
    const footerElement = footerRef.current;
    const footerContentElement = footerContentRef.current;

    if (!footerElement || !footerContentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      footerElement.style.height = `${footerContentElement.offsetHeight}px`;
    });

    resizeObserver.observe(footerContentElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    //* NOTE: Opt in for now, because of editor styles being changed
    <PageContainer id="lc-new-entry-page" className="mb-0!">
      {/*Make the inner container as tall (min-height) as the vh (but not overflowing) to prevent issues with editor*/}
      <PageHeader
        title="New Entry"
        goBackButton
        goBackButtonVariant="tinted"
        rightActionButton={rightActionButton}
        heavyTeardown={true}
      />
      <main>
        <div className="max-w-(--lc-content-max-width) mx-auto w-full px-0.5">
          <section className="mx-px">
            {/*TODO: Maybe add relative and overflow-x-hidden later, when it is guaranteed to fill the entire page (height wise) */}
            <div className="text-start">
              <EntryForm
                id="entry-create-form"
                topics={topics}
                overrideExisting={capturedData?.misc?.overrideExisting ?? true}
                initialData={{
                  title: capturedData?.title || searchParams.get("title") || "",
                  topicId: searchParams.get("topicId") || "",
                  faviconUrl: capturedData?.metadata?.faviconUrl || "",
                  url: capturedData?.location?.href || "",
                  siteName:
                    capturedData?.metadata?.siteName ||
                    capturedData?.location?.hostname ||
                    "",
                  languageCode:
                    capturedData?.lang || navigator.language || "en",
                  description: capturedData?.metadata?.excerpt || "",
                  // capturedData?.textContent
                  //   ? capturedData?.textContent?.trim().slice(0, 400) + "..."
                  //   : "",
                  // [
                  //   capturedData?.metadata?.byline ? `By ${capturedData.metadata.byline}` : null,
                  //   capturedData?.metadata?.publishedTime ? `Published: ${capturedData.metadata.publishedTime}` : null,
                  //   capturedData?.metadata?.excerpt || null,
                  // ]
                  //   .filter(Boolean)
                  //   .join("\n\n") || "",
                }}
                onSubmit={handleEntrySubmit}
                isLoading={isSaving}
                onDirtyChange={setFormIsDirty}
              />
            </div>
          </section>
        </div>
        <div className="max-w-(--lc-content-max-width) /*px-px*/ mx-auto w-full">
          <Label
            htmlFor="lc-blocknote-view-new-entry"
            onClick={() => {
              editor.focus();
            }}
            className="text-sm ml-1.75 mb-1 mt-0"
          >
            Content
          </Label>
          <div className="relative">
            {/*Unused css classes for div className="relative overflow-x-hidden min-h-[55vh] mt-1" */}
            {/* --- SKELETON LOADER OVERLAY (update to shadcn-ui component later)--- */}
            {showSkeleton && (
              <div className="absolute inset-0 z-10 p-2 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
              </div>
            )}
            {/* --- ACTUAL EDITOR --- */}
            {/* It is ALWAYS mounted to prevent the Floating UI crash. We just hide it visually until ready. */}
            <div
              className={cn(
                "transition-opacity duration-150", //MAYBE: Reduce duration a bit more, dont use will-change-opacity, because editor ui elements are covered by top and bottom ui.
                showSkeleton ? "opacity-0 pointer-events-none" : "opacity-100",
              )}
            >
              <BlockNoteView
                editor={editor}
                lang={language}
                id="lc-blocknote-view-new-entry"
                className="text-left"
                // TODO: Make prop to control min height of editor.
                //editable={false}
              />
            </div>
          </div>
        </div>
      </main>
      <footer
        //id="lc-new-entry-bottom-footer"
        //className="mt-10.5"
        className={cn(styles.bottomFooter, "mt-10.5")}
        ref={footerRef}
      >
        <section
          ref={footerContentRef}
          //* NOTE: Opt in for now, because of editor styles being changed
          className="fixed bottom-0 left-0 min-h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-30
                lc-bottom-bar-styled-bg"
        >
          <div
            className={cn(
              "pb-[0.08rem] px-px mx-auto inset-x-0 relative flex items-end transition-all duration-150",
              isPromptActive ? "max-w-150" : "max-w-130",
            )}
          >
            <Textarea
              id="ai-prompt-textarea"
              ref={aiPromptTextareaRef}
              //rows={4}
              rows={1}
              maxLength={800} // was 500
              placeholder="Your desired AI prompt..."
              className={cn(
                "transition-all duration-150 py-2.5",
                "text-base! field-sizing-content resize-none max-h-[35vh] min-h-10.5 focus-visible:ring-0 scrollbar-thin scrollbar-bg-transparent",
                "border-neutral-400/50 dark:not-focus-visible:border-neutral-400/40 dark:bg-[#121724]/85 dark:focus-visible:bg-[#121724] bg-[#fefefe]/85 focus-visible:bg-[#fefefe]",
                isPromptActive ? "pb-11 backdrop-blur-lg" : "backdrop-blur-md",
                isAtBottom
                  ? "shadow-none"
                  : "shadow-[0_-6px_6px_1px_var(--color-gray-300)]/25 dark:shadow-[0_-6px_6px_1px_#000010]/25",
                import.meta.env.FIREFOX && "resize-y h-10.5", //* NOTE (feature parity discrepancy): No support fo field sizing content in Firefox and also different behavior compared to Chrome
              )}
              onFocus={() => setIsPromptFocused(true)}
              onBlur={() => setIsPromptFocused(false)}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  aiPromptTextareaRef.current?.blur();
                }
                // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
                if (e.ctrlKey && e.key === "Enter") {
                  // Maybe change it to Ctrl/Cmd + Enter?
                  e.preventDefault();
                  if (promptText.trim() === "") return;
                  // Submit AI prompt logic here
                  alert("Submitted AI request successfully!");
                }
              }}
            />

            {promptText.trim() !== "" && (
              <div
                className={cn(
                  "absolute bottom-[0.15rem] left-0.5 right-2.5 h-13 pointer-events-none rounded-bl-md transition-opacity",
                  "bg-linear-to-t dark:from-[#121724] from-30% from-[#fefefe] to-transparent",
                )}
              />
            )}
            <div
              className={cn(
                "absolute left-3.5 bottom-2.5 text-xs text-muted-foreground select-none pointer-events-none transition-opacity z-10",
                isPromptActive ? "opacity-100" : "opacity-0",
              )}
            >
              {promptText.length}/800 characters
            </div>
            <div
              className={cn(
                "transition-all duration-150 z-10",
                "absolute right-0 /*right-2.5 bottom-2.5*/ flex items-center /*justify-end*/",
                isPromptActive ? "mr-2.25 mb-2 h-7.5" : "mb-1.25 mr-1.5 h-9",
                isPromptActive &&
                  promptText.trim() === "" &&
                  "pointer-events-none",
              )}
            >
              <Button
                title="Refine Entry with AI"
                size="default"
                variant="default"
                disabled={isPromptActive && promptText.trim() === ""}
                className={cn(
                  "transition-all duration-200 h-full rounded-sm overflow-hidden",
                  isPromptActive ? "w-7.5 px-0" : "w-31",
                  promptText.trim() !== "" && "backdrop-blur-xs",
                )}
              >
                <div className="grid place-items-center">
                  <ArrowUpIcon
                    className={cn(
                      "col-start-1 row-start-1 size-4.5 transition-all duration-300",
                      isPromptActive
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-50",
                    )}
                  />
                  <span
                    className={cn(
                      "col-start-1 row-start-1 whitespace-nowrap transition-all duration-300",
                      isPromptActive
                        ? "opacity-0 scale-95 pointer-events-none"
                        : "opacity-100 scale-100",
                    )}
                  >
                    Refine with AI
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </section>
      </footer>
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent
          size="sm"
          className="select-none p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") blocker.reset?.();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3.5">
            <AlertDialogCancel
              variant="outline"
              onClick={() => blocker.reset?.()}
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="-mr-px"
              onClick={() => blocker.proceed?.()}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

export default EntryCreatePage;
