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
      "Lexicora is a browser extension for keeping what you read. Capture a page's content or bookmark it, sort it into topics, add your own notes, and search all of it later. Everything stays in your browser, on this device.",
  },
  {
    question: "How do I capture a webpage?",
    answer:
      "Open the side panel on the page you want to keep and press \"Capture page\", or \"Bookmark\" for the link alone. The same two are in the right-click menu, along with capturing just the text you have selected, and both have a keyboard shortcut — see Settings → Keyboard Shortcuts. However you start it, the entry opens with the page's title, link and details already filled in, ready for you to pick a topic and save. The prompt that appears after a while on a page does the same thing.",
  },
  {
    question: "What is the difference between Capture page and Bookmark?",
    answer:
      "Capture page reads the page and fills the entry's editor with its content, so the text is yours to keep, edit and search even if the page changes or disappears. Bookmark saves only what the page says about itself — title, link, site, description, author and date — and leaves the editor empty. Use Bookmark for something you only want to find again, and Capture page for something you want to keep or write about. Both create an ordinary entry in a topic, and you can always add your own notes afterwards.",
  },
  {
    question: "Why did a capture come out empty or incomplete?",
    answer:
      "Capture page keeps what a page is about — the article, the documentation, the post — and leaves out the menus, sidebars, link lists and buttons around it. A page made mostly of those, such as a product's landing page or a web app, can have little or nothing it recognises as content, and the entry's editor stays empty. Then select what you want on the page and choose \"Capture Selection\" from the right-click menu, or press the capture shortcut, which takes the selection whenever there is one: a selection is kept as you chose it. No capture is perfect, either. Every site is built differently, so the result is usually close to the best that can be read from the page, but it can miss a piece or keep a stray one — which is what the editor is for.",
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
      "The search bar at the top of the Library searches titles, tags, descriptions, site names and dates, for entries and topics alike. A date matches the way the list shows it, as in 20.05.26, or by month and year, as in may 2026. To narrow it to one website, put site: in front of a domain — site:react.dev — on its own or together with words, as in site:react.dev hooks. The \"Total\" link on the home page opens exactly that search for the site you are on.",
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
  {
    question: "How do I bring a backup back in?",
    answer:
      "Settings → Import takes a JSON file that Export wrote. It shows what the file holds before anything changes, and asks how to treat things you already have: keep yours, take the file's, or add only what is missing. Whichever you pick, nothing already in your library is deleted. Markdown cannot be imported — it is for reading elsewhere, not for coming back.",
  },
  {
    question: "Are there keyboard shortcuts?",
    answer:
      "Yes, and Settings → Keyboard Shortcuts lists all of them with the keys for your platform. Some work anywhere in the browser — opening the panel, capturing, bookmarking — and you can change those in the browser's own settings. The rest work while the side panel is focused: single keys for moving around, searching, creating and editing. They are ignored while you type.",
  },
  {
    question: "What does cleaning up the database do?",
    answer:
      "Deleting something hides it immediately, but the browser only reclaims the space once the old rows are purged. That happens on its own, after deletions and periodically, so you should not have to think about it. Settings → Storage → \"Clean Up Database\" does it on the spot if you want the space back now. It never touches anything you can still see in your library.",
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
