import { useRef } from "react";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface AiPromptSectionProps {
  /** False on browser and extension pages, which cannot be captured. */
  isSupported: boolean;
  promptText: string;
  onPromptTextChange: (value: string) => void;
}

/**
 * The AI prompt block on the side-panel home page, preserved verbatim from the
 * pre-flag design so turning `FEATURES.AI` back on restores the original layout
 * rather than a reconstruction of it.
 *
 * Only rendered when `FEATURES.AI` is on, as the alternative to
 * `RecentEntries` / `LibraryEmptyState`. The three are mutually exclusive: they
 * all claim the same flexible space in the home page's `main`.
 *
 * The prompt text is owned by `home.tsx` because the capture footer reads it
 * too: an in-progress prompt collapses the plain "Capture" button in favour of
 * "Capture with AI".
 */
export function AiPromptSection({
  isSupported,
  promptText,
  onPromptTextChange,
}: AiPromptSectionProps) {
  const aiPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <Separator className="mt-4 mx-auto max-w-[calc(100%-8px)] shrink-0 [@media(min-height:950px)]:hidden" />
      <section className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-end text-center py-5">
          <h2 className="text-lg font-medium mb-1 text-[#00143d] dark:text-foreground">
            Describe what you want AI to do
          </h2>
          <p className="text-sm text-muted-foreground">
            Optional — leave blank to capture the page as-is.
          </p>
        </div>
        <div className="pb-12">
          <Textarea
            id="ai-prompt-textarea"
            ref={aiPromptTextareaRef}
            placeholder="Type your desired AI prompt here."
            className="text-base! max-h-75 field-sizing-content resize-y w-[calc(100%-2px)] mx-auto scrollbar-thin transition-colors duration-150 focus-visible:ring-0"
            maxLength={1000}
            disabled={!isSupported}
            title={
              isSupported
                ? ""
                : "You are currently on a unsupported page for capturing."
            }
            value={promptText}
            onChange={(e) => {
              onPromptTextChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                aiPromptTextareaRef.current?.blur();
              }
              // NOTE (feature parity discrepancy): Firefox for some reason does not seem to support this
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                if (promptText.trim() === "") return;
                // TODO: Submit the AI capture request once an AI backend exists (#52).
              }
            }}
          />
        </div>
      </section>
    </>
  );
}
