import { useIsAtBottom } from "@/providers/scroll-observer";
import { cn } from "cn";

/**
 * How much of the fade's strength is left at each point, from the bottom edge
 * up: an eased ("scrim") curve. A straight ramp from colour to transparent
 * stops abruptly, which reads as a line where it ends; this one tails off, as
 * a blurred shadow does.
 */
const SCRIM: readonly (readonly [strength: number, at: number])[] = [
  [1, 0],
  [0.738, 19],
  [0.541, 34],
  [0.382, 47],
  [0.278, 56.5],
  [0.194, 65],
  [0.126, 73],
  [0.075, 80.2],
  [0.042, 86.1],
  [0.021, 91],
  [0.008, 95.2],
  [0.002, 98.2],
  [0, 100],
];

const SCRIM_GRADIENT = `linear-gradient(to top, ${SCRIM.map(
  ([strength, at]) =>
    `color-mix(in oklab, var(--color-background) calc(var(--lc-edge-fade-strength) * ${strength}), transparent) ${at}%`,
).join(", ")})`;

/**
 * A short fade into the background along the bottom edge, so the content
 * scrolling out of view meets the edge softly rather than being cut off, and
 * the heading map's button floats over it. The counterpart of the compact
 * header's strip at the top, for pages with nothing else at the bottom (the
 * create and edit pages without the AI prompt).
 *
 * Gone once the page is at its bottom, so it never covers the last line.
 * Below the heading map's button (z-20), above the content.
 */
export function BottomEdgeFade() {
  const isAtBottom = useIsAtBottom();

  return (
    <div
      aria-hidden
      className={cn(
        "fixed bottom-0 left-(--lc-host-inset-left,0px) right-0 h-10 z-10 pointer-events-none",
        // How strong it is at the very edge.
        "[--lc-edge-fade-strength:80%] dark:[--lc-edge-fade-strength:80%]",
        "transition-opacity duration-150",
        isAtBottom && "opacity-0",
      )}
      style={{ backgroundImage: SCRIM_GRADIENT }}
    />
  );
}
