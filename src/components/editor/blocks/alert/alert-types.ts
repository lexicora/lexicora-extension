import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

/**
 * The alert kinds are exactly the five GitHub understands, so an exported
 * alert renders as an alert wherever GitHub-flavoured Markdown is read:
 *
 * ```md
 * > [!WARNING]
 * > Mind the gap.
 * ```
 *
 * Obsidian reads the same lines as a callout, which is what the clipboard
 * export targets, so one Markdown shape serves both.
 */
export const alertTypeValues = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] as const;

export type AlertType = (typeof alertTypeValues)[number];

export const defaultAlertType = "note" satisfies AlertType;

export interface AlertTypeDefinition {
  value: AlertType;
  /** Shown in the block header and the type menu. */
  title: string;
  /** The first line of the exported blockquote, as GitHub spells it. */
  marker: `[!${Uppercase<AlertType>}]`;
  icon: LucideIcon;
}

export const alertTypes: readonly AlertTypeDefinition[] = [
  { value: "note", title: "Note", marker: "[!NOTE]", icon: Info },
  { value: "tip", title: "Tip", marker: "[!TIP]", icon: Lightbulb },
  {
    value: "important",
    title: "Important",
    marker: "[!IMPORTANT]",
    icon: MessageSquareWarning,
  },
  {
    value: "warning",
    title: "Warning",
    marker: "[!WARNING]",
    icon: TriangleAlert,
  },
  {
    value: "caution",
    title: "Caution",
    marker: "[!CAUTION]",
    icon: OctagonAlert,
  },
];

export function isAlertType(value: string): value is AlertType {
  return (alertTypeValues as readonly string[]).includes(value);
}

/** Falls back to the default type, so a stale or foreign value still renders. */
export function getAlertType(value: string): AlertTypeDefinition {
  return (
    alertTypes.find((alertType) => alertType.value === value) ?? alertTypes[0]!
  );
}

/**
 * A GitHub alert marker at the start of a blockquote's text, plus the line
 * break that follows it. Case-insensitive because Obsidian writes `[!warning]`.
 */
const alertMarkerPattern =
  /^\s*\[!(note|tip|important|warning|caution)\][ \t]*\r?\n?/i;

/**
 * Reads the alert type off an element pasted from outside the editor, or
 * `undefined` when the element is not an alert.
 *
 * Recognised shapes:
 * - a `<blockquote>` whose text starts with `[!NOTE]` — GitHub or Obsidian
 *   Markdown that went through BlockNote's Markdown-to-HTML step, and the
 *   editor's own external HTML;
 * - GitHub's rendered `<div class="markdown-alert markdown-alert-note">`.
 */
export function readAlertType(element: HTMLElement): AlertType | undefined {
  if (element.tagName === "BLOCKQUOTE") {
    const exported = element.getAttribute("data-alert-type");
    if (exported && isAlertType(exported)) return exported;

    const match = alertMarkerPattern.exec(element.textContent ?? "");
    return match ? (match[1]!.toLowerCase() as AlertType) : undefined;
  }

  if (
    element.tagName === "DIV" &&
    element.classList.contains("markdown-alert")
  ) {
    return alertTypeValues.find((value) =>
      element.classList.contains(`markdown-alert-${value}`),
    );
  }

  return undefined;
}

/**
 * Removes the type marker from an alert element so only the message is left
 * to parse as the block's content. Mutates the element, which is fine: the
 * parser hands over a throwaway copy of the pasted HTML.
 */
export function stripAlertMarker(element: HTMLElement): void {
  if (element.classList.contains("markdown-alert")) {
    element.querySelector(".markdown-alert-title")?.remove();
    return;
  }

  const textNode = firstNonBlankTextNode(element);
  if (!textNode) return;

  textNode.data = textNode.data.replace(alertMarkerPattern, "");
  let next = textNode.nextSibling;
  if (textNode.data.trim() === "") textNode.remove();

  // BlockNote's Markdown-to-HTML step turns the line break after the marker
  // into a <br> (plus the newline it keeps for whitespace); drop both so the
  // message does not start with an empty line.
  if (next instanceof HTMLBRElement) {
    const afterBreak = next.nextSibling;
    next.remove();
    next = afterBreak;
  }
  if (next?.nodeType === Node.TEXT_NODE) {
    (next as Text).data = (next as Text).data.replace(/^\s+/, "");
  }
}

function firstNonBlankTextNode(node: Node): Text | null {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child as Text).data.trim() !== "") return child as Text;
      continue;
    }
    const found = firstNonBlankTextNode(child);
    if (found) return found;
  }
  return null;
}
