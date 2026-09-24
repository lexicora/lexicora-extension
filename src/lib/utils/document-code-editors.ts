/**
 * Code editors embedded in pages — live examples and playgrounds — as the
 * capture parser finds them.
 *
 * Their code is not in a `<pre>`: each line is its own element, beside line
 * numbers, cursors and panels, so it would arrive as loose lines of text, or
 * with the line numbers mixed in. This rewrites each editor into a plain
 * `<pre>` with one line per line, which the parser's code-block step then
 * treats like any other. It must run before that step, and before pruning,
 * which cannot tell an editor's lines from paragraphs.
 *
 * Editors render only the lines in view once a document is long, so a very
 * long one is captured as far as the page had drawn it.
 */

interface CodeEditor {
  /** The editor's outermost element; everything in it is replaced. */
  editor: string;
  /** One element per line of code. */
  line: string;
  /** Where the editor names its language, in `data-language`, if anywhere. */
  language?: string;
}

/** Known editors. Another one is another entry, not new code. */
const codeEditors: readonly CodeEditor[] = [
  // CodeMirror 6: MDN's examples, many docs and framework playgrounds.
  { editor: ".cm-editor", line: ".cm-line", language: ".cm-content" },
  // CodeMirror 5, still common on older sites.
  { editor: ".CodeMirror", line: ".CodeMirror-line" },
];

export function normalizeCodeEditors(root: Document | Element): void {
  const doc = root.ownerDocument ?? root;

  for (const { editor, line, language } of codeEditors) {
    root.querySelectorAll(editor).forEach((element) => {
      // Already gone, replaced along with an editor around it.
      if (!root.contains(element)) return;
      const lines = Array.from(element.querySelectorAll(line));
      if (lines.length === 0) return;

      const pre = doc.createElement("pre");
      pre.textContent = lines.map((el) => el.textContent ?? "").join("\n");
      const name = language
        ? element.querySelector(language)?.getAttribute("data-language")
        : null;
      if (name) pre.setAttribute("data-language", name);
      element.replaceWith(pre);
    });
  }
}
