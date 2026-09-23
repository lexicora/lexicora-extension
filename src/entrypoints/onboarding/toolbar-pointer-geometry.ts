/**
 * Where the toolbar pointer goes: a glow at the top of the page under the
 * browser's Extensions button, and an arrow to it from the pin card.
 *
 * The button's exact position is unknowable — users rearrange and add
 * toolbar buttons, and browsers differ — so the glow marks an area rather
 * than a spot. Chrome and Firefox both keep the button about this far from
 * the window's right edge, give or take a button or two either side.
 */
export const EXTENSIONS_BUTTON_FROM_RIGHT = 110;

/** The glow keeps at least this much of itself inside the page. */
const EDGE_MARGIN = 48;
/**
 * More than this between the window's outer and inner width is something
 * docked beside the page — the side panel, or developer tools — rather than
 * the window's own frame. It sits under the toolbar's right end too.
 */
const DOCKED_MIN = 40;
/**
 * How far to the side of the glow's centre a side arrow may still end: well
 * inside the 280px glow, so it points into the light rather than at its end.
 */
const GLOW_REACH = 60;

/** How far below the page's top edge the arrow's tip stops. */
const TIP_Y = 8;
/** Space between the card and where the arrow starts. */
const GAP = 8;
/** A straight arrow starts at least this far inside the card's edges. */
const INSET = 28;
const RADIUS = 12;
/**
 * Room a side arrow keeps from the page's right edge. Less, and the arrow
 * looks squeezed in beside the card: where the card sits that close to the
 * edge, the glow is above the card anyway, and straight up is the shorter,
 * clearer way there.
 */
const SIDE_MARGIN = 80;
/**
 * Shorter than this and the arrow is not worth drawing. Low enough for the
 * straight arrow above a card that sits close under the toolbar.
 */
const MIN_RISE = 28;
const HEAD = 7;

/**
 * Around text the arrow passes under: a line of text this close to the arrow
 * hides it completely, and the break extends this far above and below the
 * line, so the arrow is either drawn or not, never shaved by a line's end.
 */
const OCCLUDE_X = 6;
const OCCLUDE_Y = 4;
/** Pieces of arrow shorter than this between two lines are left out. */
const MIN_PIECE = 4;

export interface PageRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PointerGeometry {
  /** The glow's centre, in page coordinates, at the top edge. */
  glowX: number;
  arrow: { line: string; head: string } | null;
}

/**
 * A vertical line from `fromY` up to `toY` at `x`, broken wherever it passes
 * under one of `occluders`, so that it reads as going beneath them.
 */
export function brokenRise(
  x: number,
  fromY: number,
  toY: number,
  occluders: readonly PageRect[],
): string {
  const hidden = occluders
    .filter((rect) => x >= rect.left - OCCLUDE_X && x <= rect.right + OCCLUDE_X)
    .map((rect) => [rect.top - OCCLUDE_Y, rect.bottom + OCCLUDE_Y] as const)
    .sort((a, b) => b[1] - a[1]); // lowest first, as the line rises

  const pieces: string[] = [];
  let y = fromY;
  for (const [top, bottom] of hidden) {
    if (bottom < toY || top > y) continue; // not on this stretch of the line
    if (y - bottom >= MIN_PIECE) pieces.push(`M ${x} ${y} V ${bottom}`);
    y = Math.min(y, top);
  }
  if (y - toY >= MIN_PIECE) pieces.push(`M ${x} ${y} V ${toY}`);
  return pieces.join(" ");
}

export function pointerGeometry({
  card,
  occluders = [],
  innerWidth,
  outerWidth,
  clientWidth,
}: {
  /** The pin card, in page coordinates. */
  card: PageRect;
  /**
   * Lines of text, and the button, that a straight arrow may pass under: in
   * one column the welcome sits between the card and the top.
   */
  occluders?: readonly PageRect[];
  innerWidth: number;
  outerWidth: number;
  /** The page's width without its scrollbar. */
  clientWidth: number;
}): PointerGeometry {
  const docked = outerWidth - innerWidth;
  const target =
    innerWidth -
    EXTENSIONS_BUTTON_FROM_RIGHT +
    (docked > DOCKED_MIN ? docked : 0);
  // With a side panel open the button is past the page's own edge, so the
  // glow waits in the page's top-right corner, as near as it can get.
  const glowX = Math.max(
    EDGE_MARGIN,
    Math.min(target, clientWidth - EDGE_MARGIN),
  );

  const head = (x: number) =>
    `M ${x - HEAD} ${TIP_Y + HEAD} L ${x} ${TIP_Y} L ${x + HEAD} ${TIP_Y + HEAD}`;

  // Beside the card whenever there is room: out from its right edge and up,
  // through open space. The rise is under the glow's centre, or as close to
  // the card as the corner allows when the glow is above the card's right
  // end, which is still well inside the glow.
  const sideX = Math.max(glowX, card.right + GAP + RADIUS);
  if (sideX <= clientWidth - SIDE_MARGIN && sideX - glowX <= GLOW_REACH) {
    const y = (card.top + card.bottom) / 2;
    if (y - RADIUS - TIP_Y < MIN_RISE) return { glowX, arrow: null };
    const line =
      `M ${card.right + GAP} ${y} H ${sideX - RADIUS} ` +
      `Q ${sideX} ${y} ${sideX} ${y - RADIUS} V ${TIP_Y}`;
    return { glowX, arrow: { line, head: head(sideX) } };
  }

  // No room beside it, as when the card spans the page in one column:
  // straight up from its top, beneath any text on the way.
  const x = Math.max(card.left + INSET, Math.min(glowX, card.right - INSET));
  const startY = card.top - GAP;
  if (startY - TIP_Y < MIN_RISE) return { glowX, arrow: null };
  return {
    glowX,
    arrow: { line: brokenRise(x, startY, TIP_Y, occluders), head: head(x) },
  };
}
