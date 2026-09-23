import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import {
  pointerGeometry,
  type PointerGeometry,
} from "./toolbar-pointer-geometry";

/**
 * Points from the pin card up to the toolbar, where the Extensions button is.
 * The arrow draws itself once `visible` turns on, and the area it points at
 * glows. See `toolbar-pointer-geometry.ts` for why it is an area.
 *
 * Text marked `data-lc-occlude` is measured line by line, and the arrow
 * breaks where it would cross it, so it seems to pass beneath.
 *
 * It lives in the page rather than the viewport, so it scrolls away with the
 * header, and is recomputed whenever the card or the window changes size.
 */
export function ToolbarPointer({
  anchorRef,
  visible,
}: {
  /** The pin card. */
  anchorRef: RefObject<HTMLElement | null>;
  visible: boolean;
}) {
  const [geometry, setGeometry] = useState<PointerGeometry | null>(null);
  const [bottom, setBottom] = useState(0);

  // Drawn once and then kept: hiding it again, once the user has pinned
  // Lexicora, fades it out rather than unwinding the arrow.
  const [drawn, setDrawn] = useState(false);
  if (visible && !drawn) setDrawn(true);
  // Once the entrance has finished. An arrow that disappears while the window
  // is resized, for want of room, then comes back without drawing itself in
  // again, which flickered.
  const [settled, setSettled] = useState(false);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const toPage = (rect: DOMRect) => ({
      left: rect.left + window.scrollX,
      right: rect.right + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
    });

    const measure = () => {
      const card = toPage(anchor.getBoundingClientRect());
      // One rect per rendered line for text, so the arrow breaks only where
      // a line actually is, not across a whole paragraph's box.
      const occluders = [
        ...document.querySelectorAll("[data-lc-occlude]"),
      ].flatMap((element) => [...element.getClientRects()].map(toPage));
      setBottom(card.bottom);
      setGeometry(
        pointerGeometry({
          card,
          occluders,
          innerWidth: window.innerWidth,
          outerWidth: window.outerWidth,
          clientWidth: document.documentElement.clientWidth,
        }),
      );
    };

    measure();
    // The page's own width changes without a resize when the scrollbar comes
    // and goes, as it does after the intro.
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // `visible` too: the card is measured again once the intro has let go of
    // the content's transform.
  }, [anchorRef, visible]);

  if (!geometry) return null;

  return createPortal(
    <div
      aria-hidden
      className="lc-toolbar-pointer"
      data-drawn={drawn || undefined}
      data-settled={settled || undefined}
      data-visible={visible || undefined}
      style={{ height: bottom }}
      onAnimationEnd={(event) => {
        // The glow's fade-in is the entrance's last step.
        if (
          event.target instanceof Element &&
          event.target.matches(".lc-toolbar-pointer-glow")
        ) {
          setSettled(true);
        }
      }}
    >
      <div className="lc-toolbar-pointer-glow-layer">
        <div
          className="lc-toolbar-pointer-glow"
          style={{ left: geometry.glowX }}
        >
          <div className="lc-toolbar-pointer-glow-wave" />
        </div>
      </div>
      {geometry.arrow && (
        <svg className="lc-toolbar-pointer-arrow" width="100%" height="100%">
          <path
            className="lc-toolbar-pointer-line"
            d={geometry.arrow.line}
            pathLength={1}
          />
          <path className="lc-toolbar-pointer-head" d={geometry.arrow.head} />
        </svg>
      )}
    </div>,
    document.body,
  );
}
