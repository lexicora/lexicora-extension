import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { IS_MAC } from "@/hooks/sidepanel/panel-shortcuts";
import { findMatches, MAX_MATCHES, revealRange } from "@/lib/find-in-page";
import { cn } from "cn";

import "./find-bar.css";

/** Marks what find leaves out: the bar itself. */
const IGNORE_ATTRIBUTE = "data-lc-find-ignore";

/**
 * Room kept clear when scrolling a match into view: the bar and the compact
 * header at the top, the bottom navigation at the bottom.
 */
const REVEAL_MARGIN = { top: 64, bottom: 72 };

const HIGHLIGHT_ALL = "lc-find";
const HIGHLIGHT_CURRENT = "lc-find-current";

type OpenListener = (selectedText: string) => void;
const openListeners = new Set<OpenListener>();

/**
 * Opens the find bar, or focuses it again when open (⌘/Ctrl+F, see
 * `PANEL_SHORTCUTS`). Selected text, if it is short and on one line, becomes
 * the query, as it does in a browser.
 */
export function openFindBar() {
  // Read now: focusing the bar's field moves the selection into it.
  const selected = window.getSelection()?.toString().trim() ?? "";
  const usable = selected.length <= 100 && !/[\n\r]/.test(selected);
  for (const listener of openListeners) listener(usable ? selected : "");
}

/** The page being searched: the routed page, not the navigation around it. */
function searchRoot(): Element {
  return document.querySelector(".lc-page-container") ?? document.body;
}

const isIgnored = (element: Element) => element.hasAttribute(IGNORE_ATTRIBUTE);

function supportsHighlights(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

/**
 * Find in the side panel: a bar at the top that highlights every match of
 * its query on the current page, steps through them and scrolls each into
 * view. Mounted once in the side panel's layout; it searches whichever page
 * is shown, the editor included, and follows the page as it changes.
 *
 * Text in form fields, such as an entry's title while editing it, is not
 * searched: it is not part of the page's text, and highlights cannot reach
 * inside a field.
 */
export function FindBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Range[]>([]);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set when the current match should be scrolled to: on a new query and on
  // stepping, but not when the page changes underneath, so typing in the
  // editor with the bar open does not pull the page around.
  const shouldReveal = useRef(false);

  // The query as of the last change, for the open listener, which is
  // attached once.
  const queryRef = useRef(query);

  /**
   * Searches for a new query, or on opening: from the part of the page in
   * view, as a browser does, rather than from the top.
   */
  const search = useCallback((next: string) => {
    queryRef.current = next;
    setQuery(next);
    const found = findMatches(searchRoot(), next, { isIgnored });
    const firstInView = found.findIndex(
      (range) => range.getBoundingClientRect().bottom >= REVEAL_MARGIN.top,
    );
    shouldReveal.current = true;
    setMatches(found);
    setIndex(Math.max(firstInView, 0));
  }, []);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const listener: OpenListener = (selectedText) => {
      // Pressed again while open: back to the field, keeping the place.
      if (!openRef.current || selectedText) {
        setOpen(true);
        search(selectedText || queryRef.current);
      }
      // After the bar renders, when it was closed.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    };
    openListeners.add(listener);
    return () => {
      openListeners.delete(listener);
    };
  }, [search]);

  // The page changed: another route, an edit, a section opened. Searched
  // again after it settles, keeping the place in the list.
  useEffect(() => {
    if (!open || !query.trim()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((records) => {
      const fromPage = records.some((record) => {
        const target =
          record.target instanceof Element
            ? record.target
            : record.target.parentElement;
        return !target?.closest(`[${IGNORE_ATTRIBUTE}]`);
      });
      if (!fromPage) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const found = findMatches(searchRoot(), query, { isIgnored });
        setMatches(found);
        setIndex((current) => Math.min(current, Math.max(found.length - 1, 0)));
      }, 150);
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [open, query]);

  // Paint the matches, the current one on top.
  useEffect(() => {
    if (!open || !supportsHighlights()) return;
    const current = matches[index];
    CSS.highlights.set(HIGHLIGHT_ALL, new Highlight(...matches));
    if (current) {
      const highlight = new Highlight(current);
      highlight.priority = 1;
      CSS.highlights.set(HIGHLIGHT_CURRENT, highlight);
    }
    return () => {
      CSS.highlights.delete(HIGHLIGHT_ALL);
      CSS.highlights.delete(HIGHLIGHT_CURRENT);
    };
  }, [open, matches, index]);

  useEffect(() => {
    const current = matches[index];
    if (!open || !current || !shouldReveal.current) return;
    shouldReveal.current = false;
    revealRange(current, REVEAL_MARGIN);
  }, [open, matches, index]);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (matches.length === 0) return;
      shouldReveal.current = true;
      setIndex(
        (current) => (current + direction + matches.length) % matches.length,
      );
    },
    [matches.length],
  );

  /**
   * Closes the bar and leaves the current match selected, as a browser does,
   * so it can be copied, or typed over in the editor.
   */
  const close = useCallback(() => {
    const current = matches[index];
    setOpen(false);
    setMatches([]);
    if (!current) {
      inputRef.current?.blur();
      return;
    }
    const editable = current.startContainer.parentElement?.closest<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (editable) editable.focus({ preventScroll: true });
    else inputRef.current?.blur();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(current);
  }, [matches, index]);

  // ⌘G / Ctrl+G and F3 step through the matches from anywhere in the panel
  // while the bar is open, as in a browser; Shift goes back.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = IS_MAC ? event.metaKey : event.ctrlKey;
      const isFindNext =
        (mod && event.key.toLowerCase() === "g") || event.key === "F3";
      if (!isFindNext) return;
      event.preventDefault();
      step(event.shiftKey ? -1 : 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, step]);

  if (!open) return null;

  const count = matches.length;
  const status =
    count > 0
      ? `${index + 1} of ${count}${count >= MAX_MATCHES ? "+" : ""}`
      : query.trim()
        ? "No results"
        : "";

  return (
    <div
      {...{ [IGNORE_ATTRIBUTE]: "" }}
      role="search"
      className="fixed top-3 left-3 right-[calc(var(--lc-scrollbar-offset)+0.125rem)] z-110 flex justify-end pointer-events-none"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-0.5 w-full max-w-90 h-10 pl-3 pr-1",
          "rounded-lg border bg-popover/95 backdrop-blur-md text-popover-foreground shadow-lg",
        )}
      >
        <SearchIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Find on page"
          aria-label="Find on page"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 h-full ml-1.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          onChange={(event) => search(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              step(event.shiftKey ? -1 : 1);
            } else if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
        />
        <span
          aria-live="polite"
          className={cn(
            "shrink-0 px-1 text-xs tabular-nums select-none",
            count === 0 && query.trim()
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {status}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Previous match (Shift+Enter)"
          disabled={count === 0}
          onClick={() => step(-1)}
        >
          <ChevronUpIcon className="size-4" />
          <span className="sr-only">Previous match</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Next match (Enter)"
          disabled={count === 0}
          onClick={() => step(1)}
        >
          <ChevronDownIcon className="size-4" />
          <span className="sr-only">Next match</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Close (Esc)"
          onClick={close}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
}
