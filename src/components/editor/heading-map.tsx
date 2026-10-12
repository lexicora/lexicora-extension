import { useEffect, useRef, useState } from "react";
import { TableOfContentsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ENTRY_SHORTCUTS, type EntryShortcut } from "@/constants/shortcuts";
import { usePageShortcuts } from "@/hooks/sidepanel/use-page-shortcuts";
import { cn } from "cn";

import type { AppBlockNoteEditor } from "./config";
import { collectHeadings, headingDepths, type HeadingItem } from "./headings";

/** Fewer headings than this and there is nowhere worth jumping to. */
const MIN_HEADINGS = 2;

/**
 * How far below the viewport's top a heading may sit and still count as the
 * section being read: the compact header (the html element's
 * scroll-padding-top, 44px) plus a little slack.
 */
const READING_LINE = 64;

const HEADING_MAP_SHORTCUTS = ENTRY_SHORTCUTS.filter(
  (shortcut) => shortcut.action === "openHeadingMap",
);

/** The rendered block for a block id; BlockNote sets `data-id` on it. */
function blockElement(
  editor: AppBlockNoteEditor,
  id: string,
): HTMLElement | null {
  return (
    editor.domElement?.querySelector<HTMLElement>(
      `.bn-block-outer[data-id="${CSS.escape(id)}"]`,
    ) ?? null
  );
}

/** Whether the block is on the page, not inside a collapsed toggle. */
function isShown(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

/** The editor's headings, kept current while it is edited. */
function useHeadings(editor: AppBlockNoteEditor): HeadingItem[] {
  const [headings, setHeadings] = useState(() =>
    collectHeadings(editor.document),
  );

  // A page creates its editor once, so the initial state stays right for it.
  useEffect(() => {
    return editor.onChange(() => {
      const next = collectHeadings(editor.document);
      // Most edits are not to headings; keep the same array so nothing
      // re-renders for them.
      setHeadings((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      );
    });
  }, [editor]);

  return headings;
}

/**
 * A floating button that lists the content's headings and scrolls to the one
 * chosen, as GitHub's outline and Notion's table of contents do. Opened with
 * `O` as well (see `ENTRY_SHORTCUTS`). Only there while the content has a few
 * headings.
 *
 * It floats rather than sitting beside the width toggle: by the time a long
 * note needs it, the toggle has scrolled away. It lines up with the content
 * column like the library's + button.
 */
export function HeadingMap({
  editor,
  aboveBottomBar = false,
  isWide = false,
}: {
  editor: AppBlockNoteEditor;
  /**
   * Whether a bar runs along the bottom of this page, to sit above it: the
   * bottom navigation, or the AI prompt on the create and edit pages.
   */
  aboveBottomBar?: boolean;
  /** Whether the editor is in its wide layout, to line up with its edge. */
  isWide?: boolean;
}) {
  const headings = useHeadings(editor);
  const [open, setOpen] = useState(false);
  // The headings as of opening: those not hidden in a collapsed toggle, and
  // the one being read.
  const [shown, setShown] = useState<HeadingItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isAvailable = headings.length >= MIN_HEADINGS;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const visible: HeadingItem[] = [];
      let current: string | null = null;
      for (const heading of headings) {
        const element = blockElement(editor, heading.id);
        if (!element || !isShown(element)) continue;
        visible.push(heading);
        if (element.getBoundingClientRect().top <= READING_LINE)
          current = heading.id;
      }
      setShown(visible);
      setCurrentId(current);
      targetRef.current = null;
    }
    setOpen(next);
  };

  usePageShortcuts<EntryShortcut["action"]>(HEADING_MAP_SHORTCUTS, () => {
    if (isAvailable) handleOpenChange(!open);
  });

  if (!isAvailable) return null;

  const depths = headingDepths(shown);

  return (
    <div
      className={cn(
        "fixed left-(--lc-host-inset-left,0px) right-0 px-3 pr-[calc(var(--lc-scrollbar-offset)+2px)] z-20 pointer-events-none",
        aboveBottomBar ? "bottom-15.5" : "bottom-3",
      )}
    >
      <div
        className={cn(
          "flex justify-end mx-auto",
          isWide
            ? "max-w-[calc(62.5rem+2.5rem)]"
            : "max-w-[calc(var(--lc-content-max-width)+0.25rem)]",
        )}
      >
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={triggerRef}
              variant="secondary"
              size="icon"
              title="Jump to a heading"
              draggable={false}
              className={cn(
                "pointer-events-auto rounded-full shadow-md backdrop-blur-md",
                "bg-secondary/85 text-muted-foreground hover:text-foreground",
                "ring-1 ring-inset ring-gray-400/30 dark:ring-gray-700/50",
                "aria-expanded:text-foreground",
              )}
            >
              <TableOfContentsIcon className="size-4.5" />
              <span className="sr-only">Jump to a heading</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-72 max-w-[calc(100vw-1.5rem)] max-h-[min(60vh,28rem)] overflow-y-auto"
            onCloseAutoFocus={(event) => {
              const target = targetRef.current;
              if (!target) return;
              // Focus goes back to the button without moving the page, and
              // only then does the page scroll: a focus change while scrolling
              // smoothly can stop the scroll short.
              event.preventDefault();
              triggerRef.current?.focus({ preventScroll: true });
              target.scrollIntoView({ block: "start" });
            }}
          >
            <DropdownMenuLabel className="text-xs font-medium select-none text-muted-foreground py-1">
              On this page
            </DropdownMenuLabel>
            {shown.map((heading, index) => {
              const isCurrent = heading.id === currentId;
              return (
                <DropdownMenuItem
                  key={heading.id}
                  aria-current={isCurrent ? "location" : undefined}
                  title={heading.text}
                  // Indented by level, a step of 0.75rem each.
                  style={{ paddingInlineStart: `${0.5 + depths[index]! * 0.75}rem` }}
                  className={cn(
                    "cursor-pointer",
                    isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                  ref={
                    isCurrent
                      ? (element) => {
                          if (element) revealInMenu(element);
                        }
                      : undefined
                  }
                  onSelect={() => {
                    targetRef.current = blockElement(editor, heading.id);
                  }}
                >
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      isCurrent ? "bg-primary" : "bg-transparent",
                    )}
                    aria-hidden
                  />
                  <span className="truncate">{heading.text}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/**
 * Scrolls the menu, not the page, so the current heading is in view when a
 * long list opens. `scrollIntoView` would move the page underneath as well.
 */
function revealInMenu(item: HTMLElement) {
  requestAnimationFrame(() => {
    const menu = item.closest<HTMLElement>("[role='menu']");
    if (!menu) return;
    const menuRect = menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top >= menuRect.top && itemRect.bottom <= menuRect.bottom)
      return;
    menu.scrollTop += itemRect.top - menuRect.top - menuRect.height / 3;
  });
}
