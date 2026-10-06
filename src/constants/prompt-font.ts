/**
 * The capture prompt's font file, in the package and in the built extension.
 *
 * `wxt.config.ts` copies it from the package into the build at this path and
 * makes it web-accessible; `prompt-font.ts` in the content script reads it.
 * It cannot be imported like other assets: content scripts are built as a
 * single bundle, which would inline the font into a script that runs on every
 * page.
 */

/** The Latin subset of the variable font: one file for every weight. */
export const PROMPT_FONT_SOURCE =
  "node_modules/@fontsource-variable/wix-madefor-text/files/wix-madefor-text-latin-wght-normal.woff2";

/** Where the build puts it, relative to the extension's root. */
export const PROMPT_FONT_PATH = "fonts/wix-madefor-text-latin-wght-normal.woff2";
