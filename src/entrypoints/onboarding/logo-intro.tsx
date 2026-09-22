import lexicoraLightThemeLogoNoBg from "@/assets/logos/lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/lexicora_standard_no-bg.svg";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

/** The logo and the name, as the page's header shows them. */
export function LogoLockup({
  ref,
}: {
  ref?: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span ref={ref} className="flex gap-1.5 items-baseline">
      <img
        src={lexicoraLightThemeLogoNoBg}
        className="h-[1.1rem] lc-display-light rounded-xs"
        alt=""
        aria-hidden
        draggable="false"
      />
      <img
        src={lexicoraDarkThemeLogoNoBg}
        className="h-[1.1rem] lc-display-dark rounded-xs"
        alt=""
        aria-hidden
        draggable="false"
      />
      {/*#00143d is the Lexicora color */}
      <span className="text-2xl font-bold text-[#00143d] dark:text-foreground leading-0">
        Lexicora
      </span>
    </span>
  );
}

type Phase = "measuring" | "playing" | "done";

/** How large the lockup starts, relative to where it lands. */
const START_SCALE = 1.75;
/**
 * An empty page first. The first frames after load are the busiest — React
 * mounting, the stylesheet applying — and a fade started in them loses its
 * beginning, so the lockup appears to pop in rather than fade.
 */
const START_DELAY = 250;
/** The lockup fades in fully, in place, before anything else moves. */
const FADE_IN = 700;
const HOLD = 400;
const MOVE = 1000;
/** The content starts appearing this far into the move. */
const CONTENT_LAG = 350;
const CONTENT_FADE = MOVE - CONTENT_LAG;

// Symmetric, so the lockup leaves the centre as gently as it lands.
const MOVE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const CONTENT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The page's entrance: the lockup alone in the middle of an empty page, which
 * then travels to its place in the header while the rest fades in beneath it.
 *
 * It is a FLIP animation. The real lockup is laid out where it belongs from
 * the start, hidden; a copy is placed exactly over it and transformed back to
 * the centre, so the move is one transform animated to none, and the copy is
 * swapped for the real one where the two coincide. A click or key skips to
 * the end. With reduced motion there is no intro at all.
 *
 * `lockupRef` is the real lockup, `contentRef` everything else on the page.
 */
export function useLogoIntro(
  lockupRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  const [phase, setPhase] = useState<Phase>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "done"
      : "measuring",
  );
  const [rect, setRect] = useState<DOMRect | null>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Measure only once the font and the logo are in: either one arriving later
  // would move the real lockup away from where the copy lands.
  useEffect(() => {
    if (phase !== "measuring") return;
    const lockup = lockupRef.current;
    if (!lockup) return;
    let cancelled = false;

    const images = [...lockup.querySelectorAll("img")].map((img) =>
      img.decode().catch(() => undefined),
    );
    void Promise.all([document.fonts.ready, ...images]).then(() => {
      if (cancelled) return;
      setRect(lockup.getBoundingClientRect());
      setPhase("playing");
    });
    return () => {
      cancelled = true;
    };
  }, [phase, lockupRef]);

  useEffect(() => {
    if (phase !== "playing" || !rect) return;
    const copy = copyRef.current;
    const content = contentRef.current;
    if (!copy || !content) return;

    // From the middle of the window, as the page's column is centred on it.
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const centred = `translate(${dx}px, ${dy}px) scale(${START_SCALE})`;
    const total = START_DELAY + FADE_IN + HOLD + MOVE;
    const fadeStart = START_DELAY / total;
    const fadeEnd = (START_DELAY + FADE_IN) / total;
    const moveStart = (START_DELAY + FADE_IN + HOLD) / total;

    const animations = [
      copy.animate(
        [
          { offset: 0, opacity: 0, transform: centred },
          {
            offset: fadeStart,
            opacity: 0,
            transform: centred,
            easing: "ease-in-out",
          },
          { offset: fadeEnd, opacity: 1, transform: centred },
          {
            offset: moveStart,
            opacity: 1,
            transform: centred,
            easing: MOVE_EASING,
          },
          { offset: 1, opacity: 1, transform: "none" },
        ],
        { duration: total, fill: "both" },
      ),
      content.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          delay: START_DELAY + FADE_IN + HOLD + CONTENT_LAG,
          duration: CONTENT_FADE,
          easing: CONTENT_EASING,
          fill: "both",
        },
      ),
    ];

    const skip = () => animations.forEach((animation) => animation.finish());
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    Promise.all(animations.map((animation) => animation.finished))
      .then(() => setPhase("done"))
      .catch(() => undefined);

    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      // Runs as "done" commits, when the real lockup and the content are
      // shown by their own styles again, so letting go of the final frames
      // changes nothing on screen.
      animations.forEach((animation) => animation.cancel());
    };
  }, [phase, rect, contentRef]);

  // The copy sits in the document rather than the viewport, so a scroll
  // during the intro carries it along with the header it is heading for.
  const copy =
    phase === "playing" && rect
      ? createPortal(
          <div
            ref={copyRef}
            aria-hidden
            className="pointer-events-none select-none"
            style={{
              position: "absolute",
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              zIndex: 50,
              opacity: 0,
            }}
          >
            <LogoLockup />
          </div>,
          document.body,
        )
      : null;

  return {
    /** Until then, the real lockup and the content stay hidden. */
    isDone: phase === "done",
    copy,
  };
}
