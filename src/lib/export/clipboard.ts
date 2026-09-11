/**
 * Writes one clipboard item carrying both HTML and plain text.
 *
 * The receiving app picks the flavour it understands: rich editors (Notion,
 * Google Docs, mail) take the HTML and keep the formatting, while plain-text
 * targets — including Obsidian's editor — take the text, which is Markdown. One
 * copy therefore pastes correctly in both, with no format to choose.
 *
 * Falls back to plain text where `ClipboardItem` is unavailable.
 */
export async function writeRichClipboard({
  html,
  text,
}: {
  html: string;
  text: string;
}): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(text);
}
