import { useState } from "react";
//import styles from "./topic-create.module.css";
import "./topic-create.module.css";

// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { TopicForm, type TopicFormData } from "@/components/forms/topic-form";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useRxCollection } from "rxdb/plugins/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uuidv7 } from "uuidv7";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes

function TopicCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const collection = useRxCollection("topics");

  const handleCreateTopic = async (data: TopicFormData) => {
    if (!collection) return;
    try {
      setIsCreating(true);
      const newDoc = await collection.insert({
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
      // Navigate to the newly created topic, or topics list
      navigate(`/library/topics/${newDoc.id}`, {
        replace: true,
        viewTransition: true,
      });
    } catch (err) {
      console.error("Failed to create topic:", err);
      // TODO: toast notification
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
          />
        </section>
      </main>
      {/* Footer */}
    </PageContainer>
  );
}

export default TopicCreatePage;
