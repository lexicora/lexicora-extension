import styles from "./entry-edit.module.css";
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
import { BlockNoteView } from "@/components/editor/BlockNoteView";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  EntryForm,
  type EntryFormApi,
  type EntryFormData,
} from "@/components/forms/entry-form";
import { BlockDocType } from "@/db/schemas/block";
import { EntryDocType } from "@/db/schemas/entry";
import { TopicDocType } from "@/db/schemas/topic";
import { cn } from "@/lib/utils";
import {
  convertBlockNoteBlocks,
  convertDbBlocksToBlockNote,
} from "@/lib/utils/block-converter";
import { useScrollPos } from "@/providers/scroll-observer";
import { ArrowUpIcon, SaveIcon } from "lucide-react";
import { useCaptureData } from "@/hooks/sidepanel/use-capture-data";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useRxCollection } from "rxdb/plugins/react";
import { uuidv7 } from "uuidv7";
import { navLock } from "@/lib/navigation-lock";

interface EntryEditContentProps {
  entry: EntryDocType;
  initialBlocks: any[];
  topics: TopicDocType[];
  onSave: (data: EntryFormData, editorBlocks: any[]) => Promise<void>;
  isSaving: boolean;
}

function EntryEditContent({
  entry,
  initialBlocks,
  topics,
  onSave,
  isSaving,
}: EntryEditContentProps) {
  const editor = useCreateBlockNote({
    ...appBlockNoteConfig,
    initialContent: initialBlocks.length > 0 ? initialBlocks : undefined,
  });

  const capturedData = useCaptureData();
  const formApiRef = useRef<EntryFormApi | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [editorIsDirty, setEditorIsDirty] = useState(false);
  const initialDocJsonRef = useRef(JSON.stringify(editor.document));
  const blocker = useBlocker((formIsDirty || editorIsDirty) && !isSaving);

  useEffect(() => {
    return editor.onChange(() => {
      setEditorIsDirty(
        JSON.stringify(editor.document) !== initialDocJsonRef.current,
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!capturedData?.content) return;
    const blocks = editor.tryParseHTMLToBlocks(capturedData.content);
    const api = formApiRef.current;
    if (capturedData.misc.overrideExisting) {
      editor.replaceBlocks(editor.document, blocks);
      // Source fields always overwritten on full-page capture
      api?.setFieldValue("url", capturedData.location.href || "");
      api?.setFieldValue(
        "siteName",
        capturedData.metadata.siteName || capturedData.location.hostname || "",
      );
      api?.setFieldValue("faviconUrl", capturedData.metadata.faviconUrl || "");
      api?.setFieldValue("languageCode", capturedData.lang || "");
      // Description only written if currently empty
      if (api && !api.getFieldValue("description")) {
        api.setFieldValue("description", capturedData.metadata.excerpt || "");
      }
    } else {
      const current = editor.document;
      const isEmpty =
        current.length === 1 &&
        current[0].type === "paragraph" &&
        (!current[0].content || current[0].content.length === 0) &&
        (!current[0].children || current[0].children.length === 0);
      if (isEmpty) {
        editor.replaceBlocks(current, blocks);
      } else {
        editor.insertBlocks(blocks, current[current.length - 1].id, "after");
      }
      // For selection capture, all metadata fields only written if currently empty
      if (api) {
        if (!api.getFieldValue("url"))
          api.setFieldValue("url", capturedData.location.href || "");
        if (!api.getFieldValue("siteName"))
          api.setFieldValue(
            "siteName",
            capturedData.metadata.siteName ||
              capturedData.location.hostname ||
              "",
          );
        if (!api.getFieldValue("faviconUrl"))
          api.setFieldValue(
            "faviconUrl",
            capturedData.metadata.faviconUrl || "",
          );
        if (!api.getFieldValue("languageCode"))
          api.setFieldValue("languageCode", capturedData.lang || "");
        if (!api.getFieldValue("description"))
          api.setFieldValue("description", capturedData.metadata.excerpt || "");
      }
    }
  }, [capturedData, editor]);

  const formId = "entry-edit-form";

  const saveButton = {
    iconSmall: <SaveIcon className="size-4.5" />,
    iconLarge: <SaveIcon className="size-5.5" />,
    isLoading: isSaving,
    variant: "default" as const,
    title: "Save Entry",
    type: "submit" as const,
    form: formId,
  };

  const handleSubmit = (data: EntryFormData) => onSave(data, editor.document);

  return (
    <>
      <PageHeader
        title="Edit Entry"
        goBackButton
        goBackButtonVariant="tinted"
        rightActionButton={saveButton}
        heavyTeardown={true}
      />
      <main>
        <div className="max-w-(--lc-content-max-width) mx-auto w-full px-0.5">
          <section className="mx-px">
            <div className="text-start">
              <EntryForm
                id={formId}
                topics={topics}
                onFormReady={(api) => {
                  formApiRef.current = api;
                }}
                overrideExisting={true}
                initialData={{
                  title: entry.title,
                  topicId: entry.topicId,
                  description: entry.description || "",
                  tags: entry.tags,
                  faviconUrl: entry.faviconUrl || "",
                  url: entry.url,
                  siteName: entry.siteName || "",
                  languageCode: entry.languageCode,
                  isFavorite: entry.isFavorite,
                }}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                onDirtyChange={setFormIsDirty}
              />
              <Label
                htmlFor="lc-blocknote-view-entry-edit"
                onClick={() => editor.focus()}
                className="text-sm ml-1 mb-1 mt-0"
              >
                Content
              </Label>
            </div>
          </section>
        </div>
        <div className="max-w-(--lc-content-max-width) /*px-px*/ mx-auto w-full">
          <BlockNoteView
            editor={editor}
            lang={entry.languageCode}
            id="lc-blocknote-view-entry-edit"
            className="text-left"
          />
        </div>
      </main>
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
    </>
  );
}

function EntryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entriesCollection = useRxCollection("entries");
  const blocksCollection = useRxCollection("blocks");
  const topicsCollection = useRxCollection("topics");

  // undefined = loading, null = not found
  const { isAtBottom } = useScrollPos();
  const [entry, setEntry] = useState<EntryDocType | null | undefined>(
    undefined,
  );
  const [blocks, setBlocks] = useState<any[] | null>(null);
  const [topics, setTopics] = useState<TopicDocType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const isPromptActive = isPromptFocused || promptText.trim() !== "";
  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLElement>(null);
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!entriesCollection || !id) return;
    let cancelled = false;
    entriesCollection
      .findOne({ selector: { id } })
      .exec()
      .then((doc) => {
        if (!cancelled) setEntry(doc ? (doc.toJSON() as EntryDocType) : null);
      })
      .catch((err) => {
        console.error("Error loading entry:", err);
        if (!cancelled) setEntry(null);
      });
    return () => {
      cancelled = true;
    };
  }, [entriesCollection, id]);

  useEffect(() => {
    if (!blocksCollection || !id) return;
    blocksCollection
      .find({ selector: { entryId: id } })
      .exec()
      .then((docs) =>
        setBlocks(convertDbBlocksToBlockNote(docs as BlockDocType[])),
      )
      .catch((err) => {
        console.error("Error loading blocks:", err);
        setBlocks([]);
      });
  }, [blocksCollection, id]);

  // Topics are loaded reactively to keep the combobox up to date
  useEffect(() => {
    if (!topicsCollection) return;
    const sub = topicsCollection.find().$.subscribe((results) => {
      setTopics(results.map((r) => r.toJSON() as TopicDocType));
    });
    return () => sub.unsubscribe();
  }, [topicsCollection]);

  useEffect(() => {
    const footerElement = footerRef.current;
    const footerContentElement = footerContentRef.current;

    if (!footerElement || !footerContentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      footerElement.style.height = `${footerContentElement.offsetHeight}px`;
    });

    resizeObserver.observe(footerContentElement);

    return () => resizeObserver.disconnect();
  }, [entry, blocks]);

  const handleSave = async (data: EntryFormData, editorBlocks: any[]) => {
    if (!entriesCollection || !blocksCollection || !entry) return;
    setIsSaving(true);
    navLock.lock();

    const promise = (async () => {
      let finalTopicId = data.topicId;
      const isExistingTopic = topics.some((t) => t.id === finalTopicId);

      if (!isExistingTopic && finalTopicId && topicsCollection) {
        const newTopicId = uuidv7();
        await topicsCollection.insert({
          id: newTopicId,
          name: finalTopicId,
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
      if (data.url.trim()) {
        try {
          urlObj = new URL(data.url);
        } catch {}
      }

      const doc = await entriesCollection
        .findOne({ selector: { id: entry.id } })
        .exec();
      if (!doc) throw new Error("Entry not found");

      await doc.incrementalPatch({
        title: data.title,
        topicId: finalTopicId,
        description: data.description,
        tags: data.tags,
        faviconUrl: data.faviconUrl,
        url: data.url,
        hostnameUrl: urlObj?.hostname || "",
        pathnameUrl: urlObj?.pathname || "",
        searchUrl: urlObj?.search || "",
        siteName: data.siteName,
        languageCode: data.languageCode,
        isFavorite: data.isFavorite,
        updatedAt: new Date().toISOString(),
      });

      // Reconcile blocks: v7 IDs are preserved (update in place), v4 IDs get new v7s (insert).
      const newDbBlocks = convertBlockNoteBlocks(editorBlocks, entry.id);
      const newBlockIdSet = new Set(newDbBlocks.map((b) => b.id));

      const existingBlocks = await blocksCollection
        .find({ selector: { entryId: entry.id } })
        .exec();
      const orphaned = existingBlocks.filter((b) => !newBlockIdSet.has(b.id));

      await Promise.all(orphaned.map((b) => b.remove()));
      if (newDbBlocks.length > 0) {
        await blocksCollection.bulkUpsert(newDbBlocks);
      }
    })();

    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved",
      error: "Failed to save changes",
    });

    try {
      await promise;
      navigate(-1);
    } catch (e) {
      console.error("Failed to update entry:", e);
    } finally {
      setIsSaving(false);
      navLock.unlock();
    }
  };

  if (entry === undefined || blocks === null) {
    return (
      <PageContainer id="lc-entry-edit-page">
        <PageHeader title="Edit Entry" goBackButton />
      </PageContainer>
    );
  }

  if (entry === null) {
    return (
      <PageContainer id="lc-entry-edit-page">
        <PageHeader title="Edit Entry" goBackButton />
        <main className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-muted-foreground">
            This entry could not be found.
          </p>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer id="lc-entry-edit-page" className="mb-0!">
      <EntryEditContent
        entry={entry}
        initialBlocks={blocks}
        topics={topics}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <footer className={cn(styles.bottomFooter, "mt-10.5")} ref={footerRef}>
        <section
          ref={footerContentRef}
          className="fixed bottom-0 left-0 min-h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-30
                lc-bottom-bar-styled-bg"
        >
          <div
            className={cn(
              "pb-[0.08rem] px-px max-w-200 mx-auto inset-x-0 relative flex items-end transition-all duration-150",
              isPromptActive ? "max-w-150" : "max-w-130",
            )}
          >
            <Textarea
              id="ai-prompt-textarea-edit"
              ref={aiPromptTextareaRef}
              rows={1}
              maxLength={800}
              placeholder="Your desired AI prompt..."
              className={cn(
                "transition-all duration-150 py-2.5",
                "text-base! field-sizing-content resize-none max-h-[35vh] min-h-10.5 focus-visible:ring-0 scrollbar-thin scrollbar-bg-transparent",
                "border-neutral-400/50 dark:not-focus-visible:border-neutral-400/40 dark:bg-[#121724]/85 dark:focus-visible:bg-[#121724] bg-[#fefefe]/85 focus-visible:bg-[#fefefe]",
                isPromptActive ? "pb-11 backdrop-blur-lg" : "backdrop-blur-md",
                isAtBottom
                  ? "shadow-none"
                  : "shadow-[0_-6px_6px_1px_var(--color-gray-300)]/25 dark:shadow-[0_-6px_6px_1px_#000010]/25",
                import.meta.env.FIREFOX && "resize-y h-10.5", //* NOTE (feature parity discrepancy): No support for field-sizing-content in Firefox
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
                // NOTE (feature parity discrepancy): Firefox does not support this
                if (e.ctrlKey && e.key === "Enter") {
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
                "absolute right-0 flex items-center",
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
    </PageContainer>
  );
}

export default EntryEditPage;
