import { useEffect, useRef } from "react";

import type { Shortcut } from "@/constants/shortcuts";
import { resolveShortcut } from "./panel-shortcuts";

/**
 * Keyboard shortcuts owned by one page, active while it is mounted.
 *
 * The page supplies the handler, since the state these change — a tab, a
 * filter — lives there. Keys are resolved by the same rules as the panel-wide
 * shortcuts, so they too stay out of the way while typing in the search box.
 *
 * Pass a list defined outside the component: a new array each render would
 * re-attach the listener every time.
 */
export function usePageShortcuts<A extends string>(
  shortcuts: readonly Shortcut<A>[],
  onAction: (action: A) => void,
) {
  // Read through a ref, so handlers can close over current state without the
  // listener being re-attached on every render.
  const latest = useRef(onAction);
  latest.current = onAction;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = resolveShortcut(event, shortcuts);
      if (!action) return;
      event.preventDefault();
      latest.current(action);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
