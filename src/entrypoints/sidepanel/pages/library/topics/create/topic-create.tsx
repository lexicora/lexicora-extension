import { useState } from "react";
//import styles from "./topic-create.module.css";
import "./topic-create.module.css";

// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
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
import { useRxCollection } from "rxdb/plugins/react";
import { useBlocker, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";

function TopicCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const collection = useRxCollection("topics");

  const blocker = useBlocker(formIsDirty && !isCreating);

  const handleCreateTopic = async (data: TopicFormData) => {
    if (!collection) return;
    setIsCreating(true);

    const promise = collection.insert({
      id: uuidv7(),
      name: data.name,
      description: data.description,
      tags: data.tags,
      isFavorite: data.isFavorite,
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast.promise(promise, {
      loading: "Creating topic...",
      success: "Topic created",
      error: "Failed to create topic",
    });

    try {
      const newDoc = await promise;
      navigate(`/library/topics/${newDoc.id}`, {
        replace: true,
        viewTransition: true,
      });
    } catch (err) {
      console.error("Failed to create topic:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageContainer id="lc-new-topic-page" className="mb-0! /*pr-3!*/">
      {/*Make the inner container as tall (min-height) as the vh (but not overflowing) to prevent issues with editor*/}
      <PageHeader title="New Topic" goBackButton />
      <main className="flex-1 px-0.5 max-w-2xl mx-auto w-full">
        <section className="mx-px">
          <TopicForm
            id="topic-create-form"
            initialData={{ name: searchParams.get("name") || "" }}
            onSubmit={handleCreateTopic}
            isLoading={isCreating}
            onDirtyChange={setFormIsDirty}
          />
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

export default TopicCreatePage;
