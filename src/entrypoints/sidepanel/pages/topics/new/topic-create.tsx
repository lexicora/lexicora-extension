import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const { isAtBottom } = useScrollPos();
  const [promptText, setPromptText] = useState("");
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
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

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
            <TopicForm onSubmit={handleCreateTopic} isLoading={isCreating} />
          </section>
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
            <div className="pb-3 px-px /*mx-px*/ max-w-314 mx-auto inset-x-0 /*mt-1*/">
              <Textarea
                id="ai-prompt-textarea"
                ref={aiPromptTextareaRef}
                //rows={4}
                maxLength={500}
                placeholder="Type your desired AI prompt here."
                // TODO: Adjust dark mode shadow
                className={`transition-all duration-150
                text-base! field-sizing-content resize-none max-h-[35vh] min-h-10.5 focus-visible:ring-0 backdrop-blur-lg
                dark:bg-[#121724dd] dark:focus-visible:bg-[#121724] bg-[#fdfdfddd] focus-visible:bg-[#fdfdfd] scrollbar-thin scrollbar-bg-transparent
                ${isAtBottom ? "shadow-none" : "shadow-[0_-6px_6px_0px_var(--color-gray-300)]/25 dark:shadow-[0_-6px_6px_0px_#000010]/25"}
                ${import.meta.env.FIREFOX ? "resize-y h-10.5" : ""}`} // NOTE (feature parity discrepancy): No support fo field sizing content in Firefox and also different behavior compared to Chrome
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
                // onBlur={() => {}}
              />
            </div>
            <div className="flex gap-0 items-center justify-between w-full max-w-314 mx-auto inset-x-0">
              {/*MAYBE: Remove the animation disabling motion-reduce, because it is a very noticeable and maybe not optimal for accessibility*/}
              <div
                className={`flex justify-start transition-all motion-reduce:transition-none duration-300 ease-in-out /*overflow-visible*/ ${
                  promptText.trimEnd() === ""
                    ? "flex-1 max-w-[50%] mr-3"
                    : "flex-0 max-w-0 opacity-0 mr-0 blur-[6px]"
                }`}
              >
                <Button
                  variant="secondary"
                  title="Save Topic"
                  className="w-full overflow-hidden hover:bg-secondary hover:brightness-90 /*active:brightness-80*/"
                  disabled={promptText.trimEnd() !== ""}
                >
                  Save Topic
                </Button>
              </div>
              <div className="flex justify-end flex-1">
                <Button
                  title="Refine Topic with AI"
                  className="w-full hover:bg-primary hover:brightness-90 /*active:brightness-80*/"
                >
                  Refine with AI
                </Button>
              </div>
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
}

export default TopicCreatePage;
