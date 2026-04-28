import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import styles from "./topic-create.module.css";

// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { PageHeader } from "@/components/page-header";
import { TopicForm, type TopicFormData } from "@/components/topic-form";
import { getDb } from "@/db";
import { useNavigate } from "react-router-dom";
import { uuidv7 } from "uuidv7";
import { cn } from "@/lib/utils";
import { useScrollPos } from "@/providers/scroll-observer";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes

function TopicCreatePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTopic = async (data: TopicFormData) => {
    try {
      setIsCreating(true);
      const db = await getDb();
      const newDoc = await db.topics.insert({
        id: uuidv7(),
        name: data.name,
        description: data.description,
        tags: data.tags,
        isFavorite: data.isFavorite,
        createdAt: new Date().toISOString(),
      });
      // Navigate to the newly created topic, or topics list
      navigate(`/topics/${newDoc.id}`);
    } catch (err) {
      console.error("Failed to create topic:", err);
      // TODO: toast notification
    } finally {
      setIsCreating(false);
    }
  };

  //const [isEditorReady, setIsEditorReady] = useState(false); // other approach with requestAnimation frame contrary to useLayoutEffect
  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footerElement = footerRef.current;
    const footerContentElement = footerContentRef.current;

    if (!footerElement || !footerContentElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      footerElement.style.height = `${footerContentElement.offsetHeight}px`;
    });

    resizeObserver.observe(footerContentElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    //* NOTE: Opt in for now, because of editor styles being changed
    <div id="lc-new-topic-page" className="lc-page-container mb-0! /*pr-3!*/">
      {/*Make the inner container as tall (min-height) as the vh (but not overflowing) to prevent issues with editor*/}
      <div className="lc-page-container-inner">
        <PageHeader title="New Topic" goBackButton />
        <main className="flex-1 px-0.5 max-w-2xl mx-auto w-full">
          <section className="mx-px">
            <TopicForm
              id="topic-create-form"
              onSubmit={handleCreateTopic}
              isLoading={isCreating}
            />
          </section>
        </main>
        <footer className={cn(styles.bottomFooter, "mt-10.5")} ref={footerRef}>
          <section
            ref={footerContentRef}
            className="fixed bottom-0 left-0 min-h-15 w-full p-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-30 lc-bottom-bar-styled-bg"
          >
            <div className="flex items-center justify-center w-full max-w-2xl mx-auto inset-x-0">
              <Button
                type="submit"
                form="topic-create-form"
                title="Save Topic"
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? "Saving Topic..." : "Save Topic"}
              </Button>
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
}

export default TopicCreatePage;
