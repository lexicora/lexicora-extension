import {
  COLORS_DEFAULT,
  defaultProps,
  parseDefaultProps,
} from "@blocknote/core";
import {
  createReactBlockSpec,
  useEditorState,
  type ReactCustomBlockRenderProps,
} from "@blocknote/react";
import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  alertTypes,
  alertTypeValues,
  defaultAlertType,
  getAlertType,
  isAlertType,
  readAlertType,
  stripAlertMarker,
} from "./alert-types";

/**
 * Alert block: a callout with a type (note, tip, important, warning, caution)
 * that the user switches from a menu in the block's header.
 *
 * Modelled on BlockNote's alert example, with the Mantine menu replaced by the
 * app's shadcn dropdown, and with export and paste tuned to GitHub's alert
 * Markdown — see `alert-types.ts` for the shape and why.
 */

const alertBlockConfig = {
  type: "alert",
  propSchema: {
    textAlignment: defaultProps.textAlignment,
    textColor: defaultProps.textColor,
    type: { default: defaultAlertType, values: alertTypeValues },
  },
  content: "inline",
} as const;

type AlertRenderProps = ReactCustomBlockRenderProps<typeof alertBlockConfig>;

function AlertBlockContent({ block, editor, contentRef }: AlertRenderProps) {
  const alertType = getAlertType(block.props.type);
  const Icon = alertType.icon;
  const isEditable = useEditorState({
    editor,
    selector: ({ editor }) => editor.isEditable,
  });

  // Read-only (the entry detail page): the header is plain text, so the
  // title can be selected and copied along with the message.
  if (!isEditable) {
    return (
      <div className="lc-alert" data-alert-type={alertType.value}>
        <div className="lc-alert-header">
          <span className="lc-alert-type lc-alert-type-static">
            <Icon className="lc-alert-icon" aria-hidden />
            <span>{alertType.title}</span>
          </span>
        </div>
        <div className="lc-alert-content" ref={contentRef} />
      </div>
    );
  }

  return (
    <div className="lc-alert" data-alert-type={alertType.value}>
      <div className="lc-alert-header" contentEditable={false}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="lc-alert-type"
              aria-label={`${alertType.title} alert. Change alert type`}
            >
              <Icon className="lc-alert-icon" aria-hidden />
              <span>{alertType.title}</span>
              <ChevronDown className="lc-alert-chevron" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            // Radix would hand focus back to the trigger; the caret belongs in
            // the editor, which restores the selection it had before the menu.
            onCloseAutoFocus={(event) => event.preventDefault()}
            onEscapeKeyDown={() => editor.focus()}
          >
            <DropdownMenuLabel>Alert type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={alertType.value}
              onValueChange={(value) => {
                if (!isAlertType(value)) return;
                editor.updateBlock(block, {
                  type: "alert",
                  props: { type: value },
                });
                editor.focus();
              }}
            >
              {alertTypes.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    <OptionIcon
                      className="lc-alert-icon"
                      data-alert-type={option.value}
                      aria-hidden
                    />
                    {option.title}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="lc-alert-content" ref={contentRef} />
    </div>
  );
}

/**
 * What leaves the editor: on copy and in the app's Markdown/HTML exports.
 *
 * A blockquote whose first line is the GitHub marker, then the message.
 * BlockNote's Markdown step prefixes every line with `> `, and the literal
 * newline after the marker (no `<br>`, which would become a `\` hard break)
 * keeps the marker on a line of its own:
 *
 * ```md
 * > [!WARNING]
 * > Mind the gap.
 * ```
 *
 * Rich-text targets show the same marker line above the message, which is
 * how GitHub shows an alert in a plain blockquote, too.
 */
function AlertExternalHTML({ block, contentRef }: AlertRenderProps) {
  const alertType = getAlertType(block.props.type);

  return (
    <blockquote
      data-alert-type={alertType.value}
      style={externalStyle(block.props)}
    >
      <span>{`${alertType.marker}\n`}</span>
      <div ref={contentRef} />
    </blockquote>
  );
}

/** Mirrors `addDefaultPropsExternalHTML` from BlockNote core for React output. */
function externalStyle(
  props: AlertRenderProps["block"]["props"],
): CSSProperties {
  const style: CSSProperties = {};
  if (props.textAlignment !== defaultProps.textAlignment.default) {
    style.textAlign = props.textAlignment;
  }
  if (props.textColor !== defaultProps.textColor.default) {
    style.color =
      COLORS_DEFAULT[props.textColor as keyof typeof COLORS_DEFAULT]?.text ??
      props.textColor;
  }
  return style;
}

export const createAlertBlockSpec = createReactBlockSpec(alertBlockConfig, {
  // The quote block claims every <blockquote>; this must look first so a
  // pasted quote that opens with a GitHub marker becomes an alert instead.
  runsBefore: ["quote"],
  parse: (element) => {
    const type = readAlertType(element);
    if (!type) return undefined;
    return { ...parseDefaultProps(element), type };
  },
  // Only the marker needs custom handling. Returning `undefined` hands the
  // rest to BlockNote's default inline parsing (paragraph merging included).
  parseContent: ({ el }) => {
    stripAlertMarker(el);
    return undefined;
  },
  render: AlertBlockContent,
  toExternalHTML: AlertExternalHTML,
});
