import "./NewEntryPage.css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
// TODO: Add useBlocker from react-router or similar to prevent navigation with unsaved changes
// TODO: Add loading state while waiting for content (also use a skeleton loader for BlockNote.js editor)

function NewEntryPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>(navigator.language || "en");
  const editor = useCreateBlockNote(defaultBlockNoteConfig);
  const { sendMessage, onMessage } = useSidePanelMessaging();

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
  }, [editor]);

  return (
    <div className="p-4">
      <header className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
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
    </div>
  );
}

export default NewEntryPage;
