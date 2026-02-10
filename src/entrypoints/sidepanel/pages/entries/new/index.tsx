import "./NewEntryPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, House } from "lucide-react";
import { useSidePanelMessaging } from "@/providers/sidepanel-messaging";
import { useEffect, useState } from "react";
import { PageData } from "@/types/page-selection-data.types";
import { MSG } from "@/types/messaging";
import { defaultBlockNoteConfig } from "@/types/block-note.types";

// App BlockNote.js imports
// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { BlockNoteView } from "@/components/editor/BlockNoteView";
import { useCreateBlockNote } from "@blocknote/react";
import { useScrollPos } from "@/providers/scroll-observer";
import { PageHeader } from "@/entrypoints/sidepanel/components/ui/page-header";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes
// TODO: Add loading state while waiting for content (also use a skeleton loader for BlockNote.js editor)

function NewEntryPage() {
  const location = useLocation(); // This is used in order to trigger useEffect on location change
  const navigate = useNavigate();
  const editor = useCreateBlockNote(defaultBlockNoteConfig); // Works also like this (if necessary): {...defaultBlockNoteConfig}
  const { sendMessage, onMessage } = useSidePanelMessaging();
  const { isAtBottom, isAtTop } = useScrollPos();
  const [language, setLanguage] = useState(navigator.language || "en");
  const [promptText, setPromptText] = useState("");
  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLElement>(null);

  //const pushEnabledRef = useRef(false); //* NOTE: This should not be necessary here

  const updateEditorContent = (data: PageData) => {
    if (data.HTML) {
      setLanguage(data.language || navigator.language || "en");
      const blocks = editor.tryParseHTMLToBlocks(data.HTML);
      editor.replaceBlocks(editor.document, blocks);
    }
  };

  useEffect(() => {
    const unsubscribe = onMessage(MSG.SEND_PAGE_SELECTION_DATA, (msg) => {
      if (!msg.data) return null;

      updateEditorContent(msg.data);
      return true; //* NOTE: To signal to clear the pending capture data in the background or other scripts.
    });

    return () => unsubscribe();
  }, [location]);

  useEffect(() => {
    const pullData = async () => {
      const data = await sendMessage(
        MSG.REQUEST_PENDING_DATA,
        null,
        "background",
      );
      if (data) {
        updateEditorContent(data);
      }
    };

    pullData();
  }, []);

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
    <div
      id="lc-new-entry-page"
      className="lc-page-container select-none mb-0! /*pr-3!*/"
    >
      {/*Make the inner container as tall (min-height) as the vh (but not overflowing) to prevent issues with editor*/}
      <div className="lc-page-container-inner">
        <PageHeader title="New Entry" goBackButton />
        <main>
          <section className="mx-px">
            {/*TODO: Maybe add relative and overflow-x-hidden later, when it is guaranteed to fill the entire page (height wise) */}
            <div className="text-start">
              <Label
                htmlFor="lc-blocknote-view-new-entry"
                onClick={() => {
                  editor.focus();
                }}
                className="text-sm ml-2 mb-0.5"
              >
                Captured Content
              </Label>
              <BlockNoteView
                editor={editor}
                className=""
                lang={language}
                id="lc-blocknote-view-new-entry"
                //ref={editorContainerRef.current}
                //editable={false}
              />
            </div>
          </section>
        </main>
        <footer
          id="lc-new-entry-bottom-footer"
          className="mt-10.5"
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
                  title="Save Entry"
                  className="w-full overflow-hidden hover:bg-secondary hover:brightness-90 /*active:brightness-80*/"
                  disabled={promptText.trimEnd() !== ""}
                >
                  Save Entry
                </Button>
              </div>
              <div className="flex justify-end flex-1">
                <Button
                  title="Refine Entry with AI"
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

export default NewEntryPage;
