import type { PublicPath } from "wxt/browser";

import { PROMPT_FONT_PATH } from "@/constants/prompt-font";

/**
 * The capture prompt's font, loaded from the extension's own files.
 *
 * It cannot come from a stylesheet. The prompt lives in a shadow root, where
 * `@font-face` is ignored — a font has to be registered on the page's own
 * document — and a page's `font-src` policy blocks the extension's font once
 * it is there, which is what strict sites such as GitHub do. Reading the file
 * and handing the bytes to `FontFace` loads no URL at all, so there is nothing
 * for a policy to refuse; the content script's own fetch of an extension file
 * is not subject to the page's policy either.
 *
 * Fonts registered on `document.fonts` apply inside the shadow root, so the
 * prompt picks this up through its ordinary `font-family`.
 *
 * Only the Latin subset ships, since the prompt's text is the extension's own.
 * It is the variable font, so one file serves every weight the prompt uses.
 * Anything unexpected falls back to the system stack in the prompt's CSS, so a
 * failure here costs the typeface and nothing else.
 */

const FAMILY = "Wix Madefor Text";

/** Resolves once per page, however many times the prompt is mounted. */
let loaded: Promise<void> | null = null;

async function addFace(): Promise<void> {
  // Copied in by the build rather than kept in public/, so WXT's list of
  // public paths does not know it; see constants/prompt-font.
  const response = await fetch(
    browser.runtime.getURL(`/${PROMPT_FONT_PATH}` as PublicPath),
  );
  const data = await response.arrayBuffer();
  const face = new FontFace(FAMILY, data, {
    weight: "400 800",
    display: "swap",
  });
  await face.load();
  document.fonts.add(face);
}

export function ensurePromptFont(): Promise<void> {
  loaded ??= addFace().catch(() => undefined);
  return loaded;
}
