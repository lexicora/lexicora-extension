import "./NewEntryPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, House } from "lucide-react";
import { useSidePanelMessaging } from "@/entrypoints/sidepanel/providers/messaging";
import { useEffect, useState } from "react";
import { pageData } from "@/types/page-selection-data.types";
import { MSG } from "@/types/messaging";
import { defaultBlockNoteConfig } from "@/types/block-note.types";

// App BlockNote.js imports
// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { BlockNoteView } from "@/editor/BlockNoteView";
import { useCreateBlockNote } from "@blocknote/react";
import { useScrollPos } from "@/entrypoints/sidepanel/providers/scroll-observer";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes
// TODO: Add loading state while waiting for content (also use a skeleton loader for BlockNote.js editor)

function NewEntryPage() {
  const location = useLocation(); // This is used in order to trigger useEffect on location change
  const navigate = useNavigate();
  const editor = useCreateBlockNote(defaultBlockNoteConfig); // Works also like this (if necessary): {...defaultBlockNoteConfig}
  const { sendMessage, onMessage } = useSidePanelMessaging();
  const [language, setLanguage] = useState<string>(navigator.language || "en");
  const [promptText, setPromptText] = useState("");
  //const [isAtBottom, setIsAtBottom] = useState(true);
  const { isAtBottom } = useScrollPos();
  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLElement>(null);

  const updateEditorContent = (data: pageData) => {
    if (data.HTML) {
      setLanguage(data.language || navigator.language || "en");
      const blocks = editor.tryParseHTMLToBlocks(data.HTML);
      editor.replaceBlocks(editor.document, blocks);
    }
  };

  useEffect(() => {
    const pullData = async () => {
      const data = await sendMessage<pageData | null>(
        MSG.REQUEST_PENDING_DATA,
        {},
        "background",
      );
      if (data) {
        updateEditorContent(data);
      }
    };
    pullData();

    const unsubscribe = onMessage<pageData>(
      MSG.GET_PAGE_SELECTION_DATA,
      (msg) => {
        if (msg.data) {
          updateEditorContent(msg.data);
        }
      },
    );

    return () => unsubscribe();
  }, [editor, location]);

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
    //* NOTE: temporarily opt out of scrollbar offset padding until figured out if this page is suitable for it (content spacing wise (seems a bit tight with it))
    <div className="lc-page-container pr-3! mb-0!">
      <header className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          title="Go back"
          onClick={() => navigate(-1)} // was "/", { viewTransition: true }
        >
          <ArrowLeftIcon />
        </Button>
        {/*<Link to="/entries">
          <Button variant="ghost" size="icon" title="Go to Entries Home">
            <House />
          </Button>
        </Link>*/}
        <h1 className="text-xl font-bold">New Entry</h1>
      </header>
      <main>
        <section className="mx-px">
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
      <footer className="mt-10.5" ref={footerRef}>
        <section
          ref={footerContentRef}
          //* NOTE: temporarily opt out of scrollbar offset padding until figured out if this page is suitable for it (content spacing wise (seems a bit tight with it))
          className="fixed bottom-0 left-0 min-h-15 w-full max-w-7xl mx-auto inset-x-0 p-3 /*pr-[calc(var(--lc-scrollbar-offset)+2px)]*/ z-30
                lc-bottom-bar-styled-bg"
        >
          <div className="pb-3 mx-px /*mt-1*/">
            <Textarea
              id="ai-prompt-textarea"
              //rows={4}
              maxLength={500}
              placeholder="Type your desired AI prompt here."
              className={`transition-all duration-150
                text-base! field-sizing-content resize-none max-h-88.5 min-h-10.5 focus-visible:ring-0 backdrop-blur-lg
                dark:bg-[#121724dd] dark:focus-visible:bg-[#121724] bg-[#fdfdfddd] focus-visible:bg-[#fdfdfd] scrollbar-thin scrollbar-bg-transparent
                ${isAtBottom ? "shadow-none" : "shadow-[0_-6px_6px_0px_var(--color-gray-300)]/25 dark:shadow-[0_-6px_6px_0px_#000010]/25"}
                ${import.meta.env.FIREFOX ? "resize-y h-10.5" : ""}`} // NOTE (feature parity discrepancy): No support fo field sizing content in Firefox and also different behavior compared to Chrome
              value={promptText} // 3. Bind the state to the value prop
              onChange={(e) => setPromptText(e.target.value)} // 4. Update state on every keystroke
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
          <div className="flex gap-0 items-center justify-between w-full">
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
  );
}

export default NewEntryPage;
