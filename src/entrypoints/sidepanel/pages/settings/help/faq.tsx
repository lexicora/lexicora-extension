import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    question: "How do I export my data?",
    answer:
      "Go to Settings → Data Management → Export All Data. This downloads a JSON file containing all your topics, entries, and notes that you can use for backup or migration.",
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "w-full text-left flex items-center justify-between gap-2.5 px-3 py-2.5",
          "bg-slate-200/75 hover:bg-slate-300/75 dark:bg-muted/50 dark:hover:bg-muted",
          "transition-colors duration-150",
          open ? "rounded-t-2xl" : "rounded-2xl",
        )}
      >
        <span className="text-sm font-medium">{question}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-2.5 text-sm text-muted-foreground bg-slate-100/75 dark:bg-muted/30 rounded-b-2xl leading-relaxed text-pretty">
          {answer}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FaqPage() {
  return (
    <PageContainer>
      <PageHeader title="FAQ" goBackButton />
      <main className="flex flex-col gap-3.5 w-full pt-4.5 px-1 mb-1.75">
        {FAQ_ITEMS.map((item) => (
          <FaqItem
            key={item.question}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </main>
    </PageContainer>
  );
}

export default FaqPage;
