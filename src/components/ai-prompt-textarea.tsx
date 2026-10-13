import type React from "react";

import { Textarea } from "@/components/ui/textarea";
import { useIsAtBottom } from "@/providers/scroll-observer";
import { cn } from "cn";

/**
 * The AI prompt field at the bottom of the create and edit pages, with a
 * shadow over the content scrolling beneath it that goes once the page is at
 * its bottom. It reads the scroll position itself, so only the field
 * re-renders when that changes, not the page and its editor around it.
 */
export function AiPromptTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const isAtBottom = useIsAtBottom();

  return (
    <Textarea
      className={cn(
        className,
        isAtBottom
          ? "shadow-none"
          : "shadow-[0_-6px_6px_1px_var(--color-gray-300)]/25 dark:shadow-[0_-6px_6px_1px_#000010]/25",
      )}
      {...props}
    />
  );
}
