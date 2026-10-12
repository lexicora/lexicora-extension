/**
 * The headings of an entry's content, for the heading map.
 *
 * Read from the editor's document rather than the page: it is the same tree
 * the editor renders, it already carries a stable id per block, and BlockNote
 * puts that id on the block's element as `data-id`. So nothing has to be
 * added to the DOM to jump to a heading — the map looks the element up by the
 * id it already has.
 */

export interface HeadingItem {
  /** The block id; the rendered block carries it as `data-id`. */
  id: string;
  level: number;
  text: string;
}

/** The parts of a block this needs; BlockNote's own types are generic. */
interface BlockLike {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: readonly BlockLike[];
}

/** The plain text of a block's inline content: text and link runs. */
export function inlineText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return "";
      const node = item as { type?: string; text?: unknown; content?: unknown };
      if (node.type === "text" && typeof node.text === "string")
        return node.text;
      if (node.type === "link") return inlineText(node.content);
      return "";
    })
    .join("");
}

/**
 * Every heading with text, in document order, including headings nested
 * inside other blocks. Empty headings are left out: there is nothing to show
 * for them in the map.
 */
export function collectHeadings(blocks: readonly BlockLike[]): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const visit = (block: BlockLike) => {
    if (block.type === "heading") {
      const text = inlineText(block.content).replace(/\s+/g, " ").trim();
      const level = Number(block.props?.level) || 1;
      if (text) headings.push({ id: block.id, level, text });
    }
    block.children?.forEach(visit);
  };
  blocks.forEach(visit);
  return headings;
}

/**
 * How far each heading is indented in the map: by level, counted from the
 * highest level present, so a note that starts at H2 is not indented
 * throughout. A skipped level (H1 straight to H4) indents one step, not three.
 */
export function headingDepths(headings: readonly HeadingItem[]): number[] {
  const depths: number[] = [];
  // The levels of the headings still "open" above the current one.
  const stack: number[] = [];
  for (const { level } of headings) {
    while (stack.length > 0 && stack[stack.length - 1]! >= level) stack.pop();
    depths.push(stack.length);
    stack.push(level);
  }
  return depths;
}
