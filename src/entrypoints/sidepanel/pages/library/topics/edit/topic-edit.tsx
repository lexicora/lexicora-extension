import { TopicForm, type TopicFormData } from "@/components/forms/topic-form";
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
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicDocType } from "@/db/schemas/topic";
import { CheckCircle2Icon, CircleCheckIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useRxCollection } from "rxdb/plugins/react";
import { navLock } from "@/lib/navigation-lock";

function TopicEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collection = useRxCollection("topics");
  const [isSaving, setIsSaving] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);

  // undefined = still loading, null = not found, otherwise the topic.
  const [topic, setTopic] = useState<TopicDocType | null | undefined>(
    undefined,
  );

  const blocker = useBlocker(formIsDirty && !isSaving);

  useEffect(() => {
    if (!collection || !id) return;
    let cancelled = false;

    collection
      .findOne({ selector: { id } })
      .exec()
      .then((doc) => {
        if (!cancelled) setTopic(doc ? (doc.toJSON() as TopicDocType) : null);
      })
      .catch((err) => {
        console.error("Error loading topic:", err);
        if (!cancelled) setTopic(null);
      });

    return () => {
      cancelled = true;
    };
  }, [collection, id]);

  const handleUpdate = async (data: TopicFormData) => {
    if (!collection || !id) return;
    setIsSaving(true);
    navLock.lock();

    const promise = (async () => {
      const doc = await collection.findOne({ selector: { id } }).exec();
      if (!doc) throw new Error("Topic not found");
      await doc.incrementalPatch({
        name: data.name,
        description: data.description,
        tags: data.tags,
        isFavorite: data.isFavorite,
        updatedAt: new Date().toISOString(),
      });
    })();

    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved",
      error: "Failed to save changes",
    });

    try {
      await promise;
      navigate(-1);
    } catch (err) {
      console.error("Failed to update topic:", err);
    } finally {
      setIsSaving(false);
      navLock.unlock();
    }
  };

  if (topic === null) {
    return (
      <PageContainer id="lc-edit-topic-page">
        <PageHeader title="Edit Topic" goBackButton />
        <main className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-muted-foreground">
            This topic could not be found.
          </p>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer id="lc-edit-topic-page" className="mb-0!">
      <PageHeader title="Edit Topic" goBackButton />
      <main className="flex-1 px-0.5 max-w-(--lc-content-max-width) mx-auto w-full">
        <section className="mx-px">
          {topic && (
            <TopicForm
              id="topic-edit-form"
              topicId={id}
              initialData={{
                name: topic.name,
                description: topic.description,
                tags: topic.tags,
                isFavorite: topic.isFavorite,
              }}
              onSubmit={handleUpdate}
              isLoading={isSaving}
              onDirtyChange={setFormIsDirty}
            />
          )}
        </section>
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
    </PageContainer>
  );
}

export default TopicEditPage;
