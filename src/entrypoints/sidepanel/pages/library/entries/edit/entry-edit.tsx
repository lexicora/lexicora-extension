import { Label } from "@/components/ui/label";
import { appBlockNoteConfig } from "@/components/editor/config";
import { BlockNoteView } from "@/components/editor/BlockNoteView";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { EntryForm, type EntryFormData } from "@/components/forms/entry-form";
import { BlockDocType } from "@/db/schemas/block";
import { EntryDocType } from "@/db/schemas/entry";
import { TopicDocType } from "@/db/schemas/topic";
import {
  convertBlockNoteBlocks,
  convertDbBlocksToBlockNote,
} from "@/lib/utils/block-converter";
import { SaveIcon } from "lucide-react";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRxCollection } from "rxdb/plugins/react";
import { uuidv7 } from "uuidv7";

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

  const handleSubmit = (data: EntryFormData) => {
    onSave(data, editor.document);
  };

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
        <section className="mx-px">
          <div className="text-start">
            <EntryForm
              id={formId}
              topics={topics}
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
            />
            <Label
              htmlFor="lc-blocknote-view-entry-edit"
              onClick={() => editor.focus()}
              className="text-sm ml-1 mb-1 mt-0"
            >
              Content
            </Label>
            <BlockNoteView
              editor={editor}
              lang={entry.languageCode}
              id="lc-blocknote-view-entry-edit"
            />
          </div>
        </section>
      </main>
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
  const [entry, setEntry] = useState<EntryDocType | null | undefined>(
    undefined,
  );
  const [blocks, setBlocks] = useState<any[] | null>(null);
  const [topics, setTopics] = useState<TopicDocType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async (data: EntryFormData, editorBlocks: any[]) => {
    if (!entriesCollection || !blocksCollection || !entry) return;
    setIsSaving(true);
    try {
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
      if (!doc) return;

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

      navigate(-1);
    } catch (e) {
      console.error("Failed to update entry:", e);
    } finally {
      setIsSaving(false);
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
    </PageContainer>
  );
}

export default EntryEditPage;
