import { ChevronsLeftRightIcon, ChevronsRightLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditorWideAvailable } from "@/hooks/use-editor-wide-mode";

/**
 * Switches the entry content editor between the page's content column and the
 * wide layout (see `useEditorWideMode`). Not rendered while the viewport is
 * too narrow for wide mode to apply, so the toggle and the layout it controls
 * always agree on the same threshold.
 */
export function EditorWidthToggle({
  isWide,
  onToggle,
  disabled = false,
  titleWide = "Narrow editor",
  titleNarrow = "Widen editor",
  className,
}: {
  isWide: boolean;
  onToggle: () => void;
  disabled?: boolean;
  titleWide?: string;
  titleNarrow?: string;
  className?: string;
}) {
  const isAvailable = useEditorWideAvailable();
  if (!isAvailable) return null;

  const Icon = isWide ? ChevronsRightLeftIcon : ChevronsLeftRightIcon;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={isWide ? titleWide : titleNarrow}
      aria-pressed={isWide}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "text-muted-foreground hover:bg-gray-300/75 dark:hover:bg-gray-800",
        className,
      )}
    >
      <Icon className="size-4" />
      <span className="sr-only">{isWide ? titleWide : titleNarrow}</span>
    </Button>
  );
}
