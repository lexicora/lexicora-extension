import lexicoraLightThemeLogoNoBg from "@/assets/logos/Lexicora_inverted_no-bg.svg";
import lexicoraDarkThemeLogoNoBg from "@/assets/logos/Lexicora_standard_no-bg.svg";
import { cn } from "cn";

interface LexicoraLogoProps {
  /** Size, rounding and layout, applied to both images. */
  className?: string;
  /**
   * Hidden from screen readers, for where the name "Lexicora" is written right
   * beside the logo and announcing both would repeat it.
   */
  decorative?: boolean;
}

/**
 * The Lexicora logo in the current theme's colors.
 *
 * Both versions are rendered and the theme classes show one of them, so the
 * right one is there from the first frame, before the theme is known in
 * JavaScript. A fragment rather than a wrapper, so the two images sit
 * directly in the caller's flex layout.
 */
export function LexicoraLogo({ className, decorative }: LexicoraLogoProps) {
  const label = decorative
    ? ({ alt: "", "aria-hidden": true } as const)
    : ({ alt: "Lexicora logo" } as const);

  return (
    <>
      <img
        src={lexicoraLightThemeLogoNoBg}
        className={cn("lc-display-light", className)}
        draggable="false"
        {...label}
      />
      <img
        src={lexicoraDarkThemeLogoNoBg}
        className={cn("lc-display-dark", className)}
        draggable="false"
        {...label}
      />
    </>
  );
}
