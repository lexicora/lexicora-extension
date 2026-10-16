import type { KeyboardEvent } from "react";

/** Inputs whose Enter press means "activate me", not "type a value". */
const ACTIVATING_INPUT_TYPES = new Set(["submit", "button", "reset", "image"]);

/**
 * A form's `onKeyDown` that stops Enter in a text field from submitting it.
 *
 * Saving is Cmd/Ctrl+S or the Save button; an Enter that saved on its own, from
 * the title or the tags, would be a surprise. Only the browser's implicit
 * submission is cancelled: it runs after the field's own handler, so a combobox
 * still picks its highlighted option, and buttons, the textarea and the editor
 * keep their Enter. A key pressed mid-composition belongs to the input method.
 */
export function preventEnterSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

  const { target } = event;
  if (
    target instanceof HTMLInputElement &&
    !ACTIVATING_INPUT_TYPES.has(target.type)
  ) {
    event.preventDefault();
  }
}
