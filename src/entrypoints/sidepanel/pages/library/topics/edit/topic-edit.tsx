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
import { SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useRxCollection } from "rxdb/plugins/react";

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
    try {
      setIsSaving(true);
      const doc = await collection.findOne({ selector: { id } }).exec();
      if (!doc) return;

      await doc.incrementalPatch({
        name: data.name,
        description: data.description,
        tags: data.tags,
        isFavorite: data.isFavorite,
        updatedAt: new Date().toISOString(),
      });

      toast("Changes saved");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update topic:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // TopicForm uses its `id` prop both as the <form> element id and as the
  // topic id to exclude from the duplicate-name check, so it must be the real
  // topic id. The header's submit button references that same id via `form`.
  const formId = topic?.id;

  const saveButton = formId
    ? {
        iconSmall: <SaveIcon className="size-4.5" />,
        iconLarge: <SaveIcon className="size-5.5" />,
        isLoading: isSaving,
        variant: "default" as const,
        title: "Save Topic",
        type: "submit" as const,
        form: formId,
      }
    : undefined;

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
      <PageHeader
        title="Edit Topic"
        goBackButton
        //rightActionButton={saveButton}
      />
      <main className="flex-1 px-0.5 max-w-2xl mx-auto w-full">
        <section className="mx-px">
          {topic && (
            <TopicForm
              id={topic.id}
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
        <AlertDialogContent size="sm" className="select-none p-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3.5">
            <AlertDialogCancel variant="outline" onClick={() => blocker.reset?.()}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" className="-mr-px" onClick={() => blocker.proceed?.()}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

export default TopicEditPage;
