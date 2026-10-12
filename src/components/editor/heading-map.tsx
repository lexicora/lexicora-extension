import { useCallback, useEffect, useRef, useState } from "react";
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

export const HEADING_MAP_TITLE = "Jump to a heading";

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

function headingsOf(editor: AppBlockNoteEditor | null): HeadingItem[] {
  return editor ? collectHeadings(editor.document) : [];
}

/** The editor's headings, kept current while it is edited. */
function useHeadings(editor: AppBlockNoteEditor | null): HeadingItem[] {
  const [state, setState] = useState(() => ({
    editor,
    headings: headingsOf(editor),
  }));

  // The detail page hands its editor over once the viewer has created it.
  if (state.editor !== editor) {
    setState({ editor, headings: headingsOf(editor) });
  }

  useEffect(() => {
    if (!editor) return;
    return editor.onChange(() => {
      const next = collectHeadings(editor.document);
      // Most edits are not to headings; keep the same array so nothing
      // re-renders for them.
      setState((prev) =>
        prev.editor === editor &&
        JSON.stringify(prev.headings) === JSON.stringify(next)
          ? prev
          : { editor, headings: next },
      );
    });
  }, [editor]);

  return state.headings;
}

/** Where the menu opens from: the opening button's box on screen. */
interface Anchor {
  top: number;
  left: number;
  width: number;
  height: number;
}

function anchorOf(element: Element): Anchor {
  const { top, left, width, height } = element.getBoundingClientRect();
  return { top, left, width, height };
}

/**
 * The heading map's state, apart from the button that opens it: a floating
 * one on the create and edit pages (`HeadingMap`), the page header's action
 * button on the detail page. Render `HeadingMapMenu` with the result, and
 * have the button call `toggle` with itself.
 */
export function useHeadingMap(
  editor: AppBlockNoteEditor | null,
  {
    findOpener,
  }: {
    /** The button `O` opens the menu from, as no click names one. */
    findOpener: () => HTMLElement | null;
  },
) {
  const headings = useHeadings(editor);
  const [open, setOpen] = useState(false);
  // The headings as of opening: those not hidden in a collapsed toggle, and
  // the one being read.
  const [shown, setShown] = useState<HeadingItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const isAvailable = editor !== null && headings.length >= MIN_HEADINGS;

  const openFrom = (opener: HTMLElement | null) => {
    if (!editor) return;
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
    openerRef.current = opener;
    targetRef.current = null;
    // With no button on screen: at the right, below the compact header.
    setAnchor(
      opener
        ? anchorOf(opener)
        : { top: 44, left: window.innerWidth - 12, width: 0, height: 0 },
    );
    setOpen(true);
  };

  /** Opens the menu from `opener`, or closes it when it is open. */
  const toggle = (opener: HTMLElement | null) => {
    if (open) setOpen(false);
    else openFrom(opener);
  };

  usePageShortcuts<EntryShortcut["action"]>(HEADING_MAP_SHORTCUTS, () => {
    if (isAvailable) toggle(findOpener());
  });

  const onOpenChange = useCallback((next: boolean) => {
    // The menu only ever asks to close: its own trigger cannot be reached.
    if (!next) setOpen(false);
  }, []);

  /** Remembers the heading to scroll to once the menu has closed. */
  const choose = (id: string) => {
    targetRef.current = editor ? blockElement(editor, id) : null;
  };

  return {
    isAvailable,
    open,
    toggle,
    onOpenChange,
    shown,
    currentId,
    anchor,
    openerRef,
    targetRef,
    choose,
  };
}

export type HeadingMapState = ReturnType<typeof useHeadingMap>;

/**
 * The list of headings, opened by whichever button the page gives it.
 *
 * The page header renders its action button twice — large at the top of the
 * page, compact once scrolled — and neither can be a menu trigger itself. So
 * the menu's trigger is an invisible box laid over the button that was
 * pressed, and the menu drops from (or rises above) that one.
 */
export function HeadingMapMenu({
  map,
  side,
}: {
  map: HeadingMapState;
  /** Below a button at the top of the page, above one at the bottom. */
  side: "top" | "bottom";
}) {
  if (!map.isAvailable) return null;

  const depths = headingDepths(map.shown);

  return (
    <DropdownMenu open={map.open} onOpenChange={map.onOpenChange}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          tabIndex={-1}
          className="fixed pointer-events-none"
          style={map.anchor ?? { top: 0, left: 0, width: 0, height: 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="end"
        sideOffset={8}
        className="w-72 max-w-[calc(100vw-1.5rem)] max-h-[min(60vh,28rem)] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          // Focus goes back to the button that opened the menu rather than
          // the invisible trigger, and without moving the page. Only then
          // does the page scroll: a focus change while scrolling smoothly can
          // stop the scroll short.
          event.preventDefault();
          map.openerRef.current?.focus({ preventScroll: true });
          const target = map.targetRef.current;
          if (target)
            requestAnimationFrame(() =>
              target.scrollIntoView({ block: "start" }),
            );
        }}
      >
        <DropdownMenuLabel className="text-xs font-medium select-none text-muted-foreground py-1">
          On this page
        </DropdownMenuLabel>
        {map.shown.map((heading, index) => {
          const isCurrent = heading.id === map.currentId;
          return (
            <DropdownMenuItem
              key={heading.id}
              aria-current={isCurrent ? "location" : undefined}
              title={heading.text}
              // Indented by level, a step of 0.75rem each.
              style={{
                paddingInlineStart: `${0.5 + depths[index]! * 0.75}rem`,
              }}
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
              onSelect={() => map.choose(heading.id)}
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
  );
}

/** The heading map's icon, at the page header's two button sizes. */
export function HeadingMapIcon({ size }: { size: "small" | "large" }) {
  return (
    <TableOfContentsIcon
      className={size === "small" ? "size-4.5" : "size-5.5"}
    />
  );
}

/**
 * The heading map with a floating button of its own, for the create and edit
 * pages, whose header action is the save button. Styled like the library's +
 * button and lined up with the content column the same way. The detail page
 * puts its button in the header instead (see `useHeadingMap`).
 *
 * Lists the content's headings and scrolls to the one chosen, as GitHub's
 * outline and Notion's table of contents do. Opened with `O` as well (see
 * `ENTRY_SHORTCUTS`). Only there while the content has a few headings.
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const map = useHeadingMap(editor, { findOpener: () => buttonRef.current });

  if (!map.isAvailable) return null;

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
        <Button
          ref={buttonRef}
          size="icon"
          title={HEADING_MAP_TITLE}
          aria-haspopup="menu"
          aria-expanded={map.open}
          draggable={false}
          className="pointer-events-auto button-create"
          onClick={(event) => map.toggle(event.currentTarget)}
        >
          <HeadingMapIcon size="small" />
          <span className="sr-only">{HEADING_MAP_TITLE}</span>
        </Button>
        <HeadingMapMenu map={map} side="top" />
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
