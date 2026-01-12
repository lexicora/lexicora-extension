import "./NewEntryPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, House } from "lucide-react";
import { useSidePanelMessaging } from "@/entrypoints/sidepanel/components/SidePanelMessagingProvider";
import { useEffect, useState } from "react";
import { pageData } from "@/types/page-selection-data.types";
import { MSG } from "@/types/messaging";
import { defaultBlockNoteConfig } from "@/types/block-note.types";

// App BlockNote.js imports
// INFO: Make sure to only import the BlockNoteView from our wrapper, not directly from @blocknote/shadcn
import { BlockNoteView } from "@/editor/BlockNoteView";
import { useCreateBlockNote } from "@blocknote/react";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes
// TODO: Add loading state while waiting for content (also use a skeleton loader for BlockNote.js editor)

function NewEntryPage() {
  const location = useLocation(); // This is used in order to trigger useEffect on location change
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>(navigator.language || "en");
  const editor = useCreateBlockNote(defaultBlockNoteConfig);
  const { sendMessage, onMessage } = useSidePanelMessaging();
  const [promptText, setPromptText] = useState("");

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

  return (
    <div className="p-2.25">
      <header className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/", { viewTransition: true })}
        >
          <ArrowLeft />
        </Button>
        {/*<Link to="/entries">
          <Button variant="ghost" size="icon" title="Go to Entries Home">
            <House />
          </Button>
        </Link>*/}
        <h1 className="text-xl font-bold">New Entry</h1>
      </header>
      <main>
        <section>
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
              //editable={false}
            />
          </div>
        </section>
      </main>
      <footer className="mt-43.5">
        <section
          className="fixed bottom-0 left-0 min-h-15 w-full p-3 z-1000
                lc-bottom-bar-styled-bg"
        >
          <div className="pb-3">
            <Textarea
              id="ai-prompt-textarea"
              //rows={4}
              maxLength={500}
              placeholder="Type your desired AI prompt here."
              className={`field-sizing-content resize-none max-h-100 min-h-10.5 focus-visible:ring-0 backdrop-blur-lg dark:bg-[#121212dd] bg-[#fefefedd] scrollbar-thin ${
                import.meta.env.FIREFOX ? "resize-y h-10.5" : ""
              }`}
              value={promptText} // 3. Bind the state to the value prop
              onChange={(e) => setPromptText(e.target.value)} // 4. Update state on every keystroke
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // TODO: Also check editor content, if empty
                  if (promptText.trim() === "") return;
                  // Submit AI prompt logic here
                  alert("Submitted AI request successfully!");
                }
              }}
              // onBlur={() => {}}
            />
          </div>
          <div className="flex gap-0 items-center justify-between w-full">
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
                title="Revise Entry with AI"
                className="w-full hover:bg-primary hover:brightness-90 /*active:brightness-80*/"
              >
                Revise with AI
              </Button>
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
}

export default NewEntryPage;
