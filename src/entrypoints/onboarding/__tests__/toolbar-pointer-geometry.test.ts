import { describe, it, expect } from "vitest";

import {
  brokenRise,
  EXTENSIONS_BUTTON_FROM_RIGHT,
  pointerGeometry,
} from "../toolbar-pointer-geometry";

/**
 * The pointer aims at an area of the toolbar it cannot see. These pin down
 * which shape it takes where, and that it never claims the impossible: an
 * arrow drawn across text, or a glow off the page.
 */

const card = { left: 540, right: 920, top: 100, bottom: 160 };

const width = (px: number) => ({
  innerWidth: px,
  outerWidth: px,
  clientWidth: px,
});

function geometry(overrides: Partial<Parameters<typeof pointerGeometry>[0]>) {
  return pointerGeometry({ card, ...width(1000), ...overrides });
}

describe("pointerGeometry", () => {
  it("glows under the Extensions button, measured from the window's right edge", () => {
    expect(geometry({}).glowX).toBe(1000 - EXTENSIONS_BUTTON_FROM_RIGHT);
  });

  it("turns the corner at the glow when the button is well beside the card", () => {
    const { glowX, arrow } = geometry(width(1600));
    expect(glowX).toBe(1600 - EXTENSIONS_BUTTON_FROM_RIGHT);
    expect(arrow?.line).toBe(
      `M ${card.right + 8} 130 H ${glowX - 12} Q ${glowX} 130 ${glowX} 118 V 8`,
    );
  });

  it("leaves from the side even when the glow is above the card's right end", () => {
    // Glow at 990, card ending at 996, with room beyond it: the arrow curves
    // out of the card and rises just past it, still inside the glow.
    const near = { ...card, right: 996 };
    const { arrow } = geometry({ card: near, ...width(1100) });
    const rise = near.right + 8 + 12;
    expect(arrow?.line).toBe(
      `M ${near.right + 8} 130 H ${near.right + 8} Q ${rise} 130 ${rise} 118 V 8`,
    );
  });

  it("goes straight up while the card is too close to the edge for a corner", () => {
    // 80px beside the card: room for a corner, not for one that looks it.
    const { glowX, arrow } = geometry({});
    expect(arrow?.line).toBe(`M ${glowX} ${card.top - 8} V 8`);
  });

  it("goes straight up when the card reaches the page's edge", () => {
    const wide = { ...card, right: 985 };
    const { glowX, arrow } = geometry({ card: wide });
    expect(arrow?.line).toBe(`M ${glowX} ${card.top - 8} V 8`);
  });

  it("moves the glow to the page's corner when a side panel covers the button", () => {
    // A 360px side panel docked on the right: outer is wider than inner.
    const { glowX } = geometry({ outerWidth: 1360 });
    expect(glowX).toBe(1000 - 48);
  });

  it("ignores the few pixels of a window's own frame", () => {
    expect(geometry({ outerWidth: 1016 }).glowX).toBe(
      1000 - EXTENSIONS_BUTTON_FROM_RIGHT,
    );
  });

  it("draws no arrow when there is no room for one", () => {
    const low = { ...card, right: 985, top: 30, bottom: 50 };
    expect(geometry({ card: low }).arrow).toBeNull();
  });
});

describe("pointerGeometry in one column", () => {
  // The card below the welcome text, the full width of the page.
  const below = { left: 16, right: 664, top: 420, bottom: 520 };

  it("rises from the card, broken where it passes under the text", () => {
    const line = { left: 16, right: 640, top: 200, bottom: 230 };
    const { glowX, arrow } = geometry({
      card: below,
      occluders: [line],
      ...width(680),
    });
    expect(arrow?.line).toBe(
      `M ${glowX} ${below.top - 8} V 234 M ${glowX} 196 V 8`,
    );
  });
});

describe("brokenRise", () => {
  const x = 500;

  it("is one line when nothing is in the way", () => {
    expect(brokenRise(x, 300, 8, [])).toBe("M 500 300 V 8");
  });

  it("ignores text that ends clear of the arrow", () => {
    const short = { left: 16, right: 480, top: 100, bottom: 120 };
    expect(brokenRise(x, 300, 8, [short])).toBe("M 500 300 V 8");
  });

  it("hides the arrow completely under text that ends just short of it", () => {
    // Ends 4px before the arrow: close enough to shave it, so it hides it.
    const near = { left: 16, right: 496, top: 100, bottom: 120 };
    expect(brokenRise(x, 300, 8, [near])).toBe("M 500 300 V 124 M 500 96 V 8");
  });

  it("merges lines too close together to show the arrow between them", () => {
    const lines = [
      { left: 16, right: 640, top: 100, bottom: 120 },
      { left: 16, right: 640, top: 122, bottom: 142 },
    ];
    expect(brokenRise(x, 300, 8, lines)).toBe("M 500 300 V 146 M 500 96 V 8");
  });
});
