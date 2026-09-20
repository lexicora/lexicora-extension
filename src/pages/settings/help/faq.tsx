import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "cn";

const FAQ_ITEMS = [
  {
    question: "What is Lexicora?",
    answer:
      "Lexicora is a browser extension that lets you capture and organize web content. Save pages, highlight text, and write notes — all stored locally in your browser.",
  },
  {
    question: "How do I capture a webpage?",
    answer:
      "Navigate to any webpage and click the Lexicora icon in your browser toolbar to open the side panel. From there you can create a new entry and the page URL and metadata will be pre-filled. You can also use the capture suggestion prompt that appears after spending time on a page.",
  },
  {
    question: "What is the difference between Capture page and Bookmark?",
    answer:
      "Capture page reads the page and fills the entry's editor with its content, so the text is yours to keep, edit and search even if the page changes or disappears. Bookmark saves only what the page says about itself — title, link, site, description, author and date — and leaves the editor empty. Use Bookmark for something you only want to find again, and Capture page for something you want to keep or write about. Both create an ordinary entry in a topic, and you can always add your own notes afterwards.",
  },
  {
    question: "How do I organize my captures?",
    answer:
      "Use topics to group related entries together. Think of topics like folders or projects. Create a topic from the Library tab, then assign entries to it when capturing or editing.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "All data is stored locally in your browser using IndexedDB. Nothing is sent to any server. Your data stays on your device and is private to you.",
  },
  {
    question: "Can I use Lexicora offline?",
    answer:
      "Yes. Lexicora is fully offline-first. All features work without an internet connection. Your captures, notes, and topics are stored locally and always available.",
  },
  {
    question: "How do I search my captures?",
    answer:
      "Use the search bar at the top of the Library tab to search across all your entries and topics. Search works on titles, tags, descriptions, and site names.",
  },
  {
    question: "Can I add images or files to an entry?",
    answer:
      "You can add an image, video, audio or file block and point it at a web address, and it will be shown in the entry. Uploading a file from your computer is not supported: Lexicora stores your library in the browser, and copies of files would quickly fill it. That also means these blocks show what is still online — if the page removes an image, it stops appearing here too, and it is not included in an export.",
  },
  {
    question: "How do I export my data?",
    answer:
      "Go to Settings → Export. \"Export All Data\" downloads a JSON file with all your topics, entries, and notes, for backup or moving to another browser. \"Export as Markdown\" downloads them as Markdown notes instead, a folder per topic, for apps like Obsidian.",
  },
] as const;

function FaqPage() {
  return (
    <PageContainer>
      <PageHeader title="FAQ" goBackButton />
      <main className="flex flex-col gap-4 w-full pt-4.5 px-1 mb-2">
        <Accordion type="single" collapsible className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="not-dark:shadow-xs rounded-2xl border-0!"
            >
              <AccordionTrigger className="flex items-center px-3 py-2.5 bg-card hover:bg-card-hover hover:no-underline rounded-2xl data-[state=open]:rounded-b-none border-0 transition-all duration-150">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div
                  className={cn(
                    "px-3 pb-3 pt-2.5 text-left text-sm text-muted-foreground bg-slate-50/85 dark:bg-muted/30 rounded-b-2xl leading-relaxed text-pretty",
                    //"transition-colors duration-150 data-closed:bg-transparent",
                    "transition-all duration-150 data-closed:bg-transparent",
                  )}
                >
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </PageContainer>
  );
}

export default FaqPage;
