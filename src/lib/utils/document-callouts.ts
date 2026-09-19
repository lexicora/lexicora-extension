import type { AlertType } from "@/components/editor/blocks/alert/alert-types";

/**
 * Callouts (notes, tips, warnings) as docs and notes sites render them.
 *
 * The capture parser rewrites each into the one shape the editor's Alert block
 * reads, `<blockquote data-alert-type="…">`, so it arrives as an alert rather
 * than as a loose "Note" paragraph followed by the message. It must run before
 * the parser prunes and sanitizes: Starlight renders callouts as `<aside>`,
 * which pruning drops as page furniture, and the sanitizer unwraps every
 * `<div>` and drops the classes the other shapes are recognised by.
 */

/** Callout containers, by the generator that renders them. */
const calloutSelector = [
  ".markdown-alert", // GitHub
  "[data-callout]", // Obsidian Publish, Quartz
  ".theme-admonition", // Docusaurus
  ".admonition", // MkDocs, Sphinx, Docusaurus v2
  ".starlight-aside", // Astro Starlight
  ".custom-block", // VitePress
  ".notecard", // MDN
].join(", ");

/**
 * Containers that are callouts whatever their type says: a custom Obsidian
 * callout or a titled Sphinx admonition becomes a note. The looser class
 * names (`.custom-block`, `.notecard`) count only with a known type.
 */
const alwaysCalloutSelector = "[data-callout], .admonition";

/**
 * Sources that use GitHub's own names, where `caution` is the red alert.
 * Obsidian is one: the editor's clipboard export writes `[!CAUTION]` for it.
 */
const githubNamedSelector = ".markdown-alert, .github-alert, [data-callout]";

/** The heading each generator renders above the message, as a direct child. */
const titleSelector = [
  ".markdown-alert-title",
  ".callout-title",
  ".admonition-title",
  ".admonition-heading",
  '[class*="admonitionHeading"]', // Docusaurus CSS module: admonitionHeading_Gvgb
  ".starlight-aside__title",
  ".custom-block-title",
].join(", ");

/** Class prefixes in front of the type: `markdown-alert-note`, `starlight-aside--tip`. */
const typeClassPrefix =
  /^(?:markdown-alert-|theme-admonition-|admonition-|starlight-aside--)/;

const githubTypes = new Set<string>([
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] satisfies AlertType[]);

/**
 * Other generators' type names, mapped to the closest of GitHub's five.
 * Outside GitHub, `caution` is the yellow heads-up and `danger` the red one.
 */
const calloutTypes = new Map<string, AlertType>([
  ["note", "note"],
  ["info", "note"],
  ["abstract", "note"],
  ["summary", "note"],
  ["tldr", "note"],
  ["todo", "note"],
  ["seealso", "note"],
  ["example", "note"],
  ["question", "note"],
  ["faq", "note"],
  ["tip", "tip"],
  ["hint", "tip"],
  ["success", "tip"],
  ["check", "tip"],
  ["done", "tip"],
  ["important", "important"],
  ["warning", "warning"],
  ["caution", "warning"],
  ["attention", "warning"],
  ["deprecated", "warning"],
  ["danger", "caution"],
  ["error", "caution"],
  ["failure", "caution"],
  ["bug", "caution"],
]);

/**
 * Rewrites every recognised callout under `root` into an alert blockquote.
 * A default title ("Note", "Warning:") is dropped, because the Alert block
 * shows its type in its own header; a custom one leads the message in bold.
 */
export function normalizeCallouts(root: Document | Element): void {
  const doc = root.ownerDocument ?? (root as Document);

  root.querySelectorAll(calloutSelector).forEach((callout) => {
    const resolved = readCalloutType(callout);
    if (!resolved) return;
    const { type, keyword } = resolved;
    const isDefaultTitle = (text: string) => {
      const name = lettersOf(text);
      return name === "" || name === lettersOf(keyword) || name === type;
    };

    const quote = doc.createElement("blockquote");
    quote.setAttribute("data-alert-type", type);

    const title = takeTitle(callout);
    if (title === null) {
      dropLeadingLabel(callout, isDefaultTitle);
    } else if (!isDefaultTitle(title)) {
      const heading = doc.createElement("p");
      heading.appendChild(doc.createElement("strong")).textContent = title;
      quote.append(heading);
    }

    quote.append(...Array.from(callout.childNodes));
    callout.replaceWith(quote);
  });
}

/** The alert type, plus the source's own name for it, which titles repeat. */
function readCalloutType(
  callout: Element,
): { type: AlertType; keyword: string } | null {
  const githubNames = callout.matches(githubNamedSelector);
  const declared = callout.getAttribute("data-callout")?.toLowerCase() ?? "";
  const keywords = [
    declared,
    ...Array.from(callout.classList, (name) =>
      name.toLowerCase().replace(typeClassPrefix, ""),
    ),
  ];

  for (const keyword of keywords) {
    if (githubNames && githubTypes.has(keyword)) {
      return { type: keyword as AlertType, keyword };
    }
    const type = calloutTypes.get(keyword);
    if (type) return { type, keyword };
  }

  return callout.matches(alwaysCalloutSelector)
    ? { type: "note", keyword: declared }
    : null;
}

/** Removes the callout's title element and returns its text, if it has one. */
function takeTitle(callout: Element): string | null {
  const title = Array.from(callout.children).find((child) =>
    child.matches(titleSelector),
  );
  if (!title) return null;
  title.remove();
  return title.textContent?.trim() ?? "";
}

/**
 * MDN has no title element; each message opens with `<strong>Note:</strong>`
 * instead, which would repeat the alert's header.
 */
function dropLeadingLabel(
  callout: Element,
  isDefaultTitle: (text: string) => boolean,
): void {
  const paragraph = callout.firstElementChild;
  const label = paragraph?.tagName === "P" ? paragraph.firstElementChild : null;
  if (
    !label ||
    (label.tagName !== "STRONG" && label.tagName !== "B") ||
    label.previousSibling?.textContent?.trim() ||
    !isDefaultTitle(label.textContent ?? "")
  ) {
    return;
  }

  const rest = label.nextSibling;
  label.remove();
  if (rest?.nodeType === Node.TEXT_NODE) {
    rest.textContent = (rest.textContent ?? "").replace(/^\s*:?\s*/, "");
  }
}

/** Letters only, so `Note:`, `NOTE` and `See also` match `note` and `seealso`. */
function lettersOf(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}]/gu, "");
}
