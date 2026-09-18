import { ChevronsLeftRightIcon, ChevronsRightLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Switches the entry content editor between the page's content column and the
 * wide layout (see `useEditorWideMode`). Hidden below 46rem, where the viewport
 * is already narrower than the content column plus the page padding and the
 * toggle would change nothing.
 */
export function EditorWidthToggle({
  isWide,
  onToggle,
  disabled = false,
  className,
}: {
  isWide: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const Icon = isWide ? ChevronsRightLeftIcon : ChevronsLeftRightIcon;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={isWide ? "Narrow editor" : "Widen editor"}
      aria-pressed={isWide}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "hidden min-[46rem]:inline-flex text-muted-foreground hover:bg-gray-300/75 dark:hover:bg-gray-800",
        className,
      )}
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {isWide ? "Narrow editor" : "Widen editor"}
      </span>
    </Button>
  );
}
