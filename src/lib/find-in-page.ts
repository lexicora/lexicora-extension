/**
 * Find in the side panel (⌘/Ctrl+F): the text matching, kept apart from the
 * find bar so it can be tested.
 *
 * The browser's own find bar searches the web page beside the panel, never
 * the panel itself, so the panel brings its own. Matches are painted with the
 * CSS Custom Highlight API rather than wrapped in <mark> elements: it leaves
 * the DOM alone, which matters inside the editor, where ProseMirror owns every
 * node and would undo or trip over anything inserted.
 */

/**
 * Leaves an element and everything inside it out of find: the find bar
 * itself, and the page header, which the bar covers.
 */
export const FIND_IGNORE_ATTRIBUTE = "data-lc-find-ignore";

/** Find's mark, ready to spread onto an element: `{...findIgnoreProps}`. */
export const findIgnoreProps = { [FIND_IGNORE_ATTRIBUTE]: "" };

/** Elements whose text is never searched, along with everything inside them. */
const SKIPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "TEXTAREA",
  "SELECT",
  "OPTION",
]);

/**
 * Elements that sit inside a line of text by default. Text in two of them, or
 * in one and around it, is one run that a match may span ("Hello **wor**ld"
 * matches "world"). Anything else breaks the run, so a match never joins the
 * end of one paragraph to the start of the next.
 */
const INLINE_TAGS = new Set([
  "A",
  "ABBR",
  "B",
  "BDI",
  "BDO",
  "CITE",
  "CODE",
  "DATA",
  "DEL",
  "DFN",
  "EM",
  "I",
  "INS",
  "KBD",
  "MARK",
  "Q",
  "S",
  "SAMP",
  "SMALL",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "TIME",
  "U",
  "VAR",
]);

/** Between two runs of text: matches nothing a query can contain. */
const RUN_BREAK = "\u0000";

/** More than this and the rest are not looked for; the count shows "1000+". */
export const MAX_MATCHES = 1000;

export interface FindOptions {
  /** Leaves an element and everything in it out, such as the find bar. */
  isIgnored?: (element: Element) => boolean;
}

/**
 * The query as a pattern: case-insensitive, and any run of whitespace in it
 * matches any run in the text, so a line break or a non-breaking space in the
 * page does not stop a phrase from matching.
 */
export function queryPattern(query: string): RegExp | null {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const escaped = words.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(escaped.join("\\s+"), "giu");
}

function isVisible(element: Element): boolean {
  // Visually hidden text for screen readers is not on the page to be found.
  if (element.closest(".sr-only")) return false;
  if (typeof element.checkVisibility !== "function") return true;
  if (element.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
    return true;
  // An element with display: contents has no box of its own, so it reports
  // itself hidden even when its text is shown.
  return getComputedStyle(element).display === "contents";
}

function isInlineBox(element: Element): boolean {
  if (!INLINE_TAGS.has(element.tagName)) return false;
  // A span laid out as a flex item or a block breaks the line all the same.
  const display = getComputedStyle(element).display;
  return !display || display.startsWith("inline");
}

/** The element whose line of text a node belongs to. */
function lineOf(element: Element, cache: Map<Element, Element>): Element {
  const cached = cache.get(element);
  if (cached) return cached;
  let line = element;
  while (line.parentElement && isInlineBox(line)) line = line.parentElement;
  cache.set(element, line);
  return line;
}

interface TextIndex {
  text: string;
  nodes: Text[];
  /** Where each node's text starts in `text`. */
  starts: number[];
}

/** The searchable text under `root`, with where each node's part of it lies. */
function indexText(root: Element, options: FindOptions): TextIndex {
  const visibility = new Map<Element, boolean>();
  const lines = new Map<Element, Element>();
  const nodes: Text[] = [];
  const starts: number[] = [];
  let text = "";
  let previousLine: Element | null = null;

  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (SKIPPED_TAGS.has(element.tagName)) return NodeFilter.FILTER_REJECT;
          if (options.isIgnored?.(element)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_SKIP;
        }
        const parent = node.parentElement;
        // Whitespace-only nodes count: the space in "<b>a</b> <i>b</i>" is
        // what lets "a b" match.
        if (!parent || !(node as Text).data) return NodeFilter.FILTER_SKIP;
        let shown = visibility.get(parent);
        if (shown === undefined) {
          shown = isVisible(parent);
          visibility.set(parent, shown);
        }
        return shown ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    },
  );

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const textNode = node as Text;
    const line = lineOf(textNode.parentElement!, lines);
    if (previousLine && line !== previousLine) text += RUN_BREAK;
    previousLine = line;
    nodes.push(textNode);
    starts.push(text.length);
    text += textNode.data;
  }

  return { text, nodes, starts };
}

/** The node holding the character at `offset`, and the offset within it. */
function locate(index: TextIndex, offset: number): [Text, number] {
  let low = 0;
  let high = index.starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (index.starts[mid]! <= offset) low = mid;
    else high = mid - 1;
  }
  return [index.nodes[low]!, offset - index.starts[low]!];
}

/** Every match of `query` in the visible text under `root`, in page order. */
export function findMatches(
  root: Element,
  query: string,
  options: FindOptions = {},
): Range[] {
  const pattern = queryPattern(query);
  if (!pattern) return [];

  const index = indexText(root, options);
  const ranges: Range[] = [];
  for (const match of index.text.matchAll(pattern)) {
    if (match[0].length === 0) continue;
    const [startNode, startOffset] = locate(index, match.index);
    // The last character's node, not the one after it: a match ending a
    // node would otherwise end at the start of the next one.
    const [endNode, endOffset] = locate(index, match.index + match[0].length - 1);
    const range = root.ownerDocument.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset + 1);
    ranges.push(range);
    if (ranges.length >= MAX_MATCHES) break;
  }
  return ranges;
}

/**
 * Brings a match into view: first inside any box that scrolls on its own, such
 * as a wide code block or table, then the page, leaving `margin` clear at the
 * top and bottom for the panel's fixed bars.
 */
export function revealRange(
  range: Range,
  margin: { top: number; bottom: number },
) {
  const startElement =
    range.startContainer instanceof Element
      ? range.startContainer
      : range.startContainer.parentElement;

  for (
    let box = startElement?.parentElement;
    box && box !== document.body && box !== document.documentElement;
    box = box.parentElement
  ) {
    const scrollsX = box.scrollWidth > box.clientWidth;
    const scrollsY = box.scrollHeight > box.clientHeight;
    if (!scrollsX && !scrollsY) continue;
    const style = getComputedStyle(box);
    const rect = range.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const pad = 16;
    if (scrollsX && /auto|scroll/.test(style.overflowX)) {
      if (rect.left < boxRect.left) box.scrollLeft -= boxRect.left - rect.left + pad;
      else if (rect.right > boxRect.right)
        box.scrollLeft += rect.right - boxRect.right + pad;
    }
    if (scrollsY && /auto|scroll/.test(style.overflowY)) {
      if (rect.top < boxRect.top) box.scrollTop -= boxRect.top - rect.top + pad;
      else if (rect.bottom > boxRect.bottom)
        box.scrollTop += rect.bottom - boxRect.bottom + pad;
    }
  }

  const rect = range.getBoundingClientRect();
  if (rect.top >= margin.top && rect.bottom <= window.innerHeight - margin.bottom)
    return;
  // Centred, as the browsers' own find does, so the lines around it show too.
  window.scrollTo({
    top: window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2,
    behavior: "instant",
  });
}
