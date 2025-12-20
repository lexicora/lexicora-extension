import "./NewEntryPage.css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, House } from "lucide-react";
import { onMessage } from "webext-bridge/popup"; //* NOTE: popup is temporary but works for sidepanel as well (maybe not optimal)
import { useEffect, useState } from "react";
import { pageData } from "@/types/page-selection-data.types";
import { MSG } from "@/types/messaging";

function NewEntryPage() {
  const navigate = useNavigate();
  const [contentHtml, setContentHtml] = useState<string | null>(null);

  useEffect(() => {
    // Listen only for the data message
    const unsubscribe = onMessage<pageData>(
      MSG.SEND_PAGE_SELECTION_DATA,
      (msg) => {
        console.log("HTML Data: \n" + msg.data.HTML);
        if (msg.data.HTML) {
          if (import.meta.env.DEV)
            console.log("NewEntryPage: Received HTML content.");
          setContentHtml(msg.data.HTML);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

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
        {/* TODO: Implement BlockNote.js editor here. */}
        <h2 className="text-lg font-semibold mb-2">Scraped Content (RAW):</h2>
        {/*{contentHtml ? (
          <div
            className="prose prose-sm dark:prose-invert mt-2 border p-2 rounded"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-gray-500">Waiting for selected content...</p>
        )}*/}
        <div className="p-1 dark:bg-white/10 bg-black/10 rounded-sm min-h-20 wrap-break-word">
          {contentHtml}
        </div>
      </main>
    </div>
  );
}

export default NewEntryPage;
