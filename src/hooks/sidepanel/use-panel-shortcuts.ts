import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { PanelShortcutAction } from "@/constants/shortcuts";
import { navLock } from "@/lib/navigation-lock";
import { resolvePanelShortcut } from "./panel-shortcuts";
import { useCaptureActiveTab } from "./use-capture-active-tab";

const NEW_ENTRY_PATH = "/library/entries/new";
const NEW_TOPIC_PATH = "/library/topics/new";

/** The topic id when the panel is on one of a topic's pages, so a new entry lands in it. */
function currentTopicId(pathname: string): string | null {
  const id = pathname.match(/^\/library\/topics\/([^/]+)/)?.[1];
  return id && id !== "new" ? id : null;
}

/**
 * The edit page for whatever detail page is open, or null elsewhere. Matches
 * an entry's detail page, and a topic's detail and entries pages.
 */
function editPathFor(pathname: string): string | null {
  const entry = pathname.match(/^\/library\/entries\/([^/]+)$/)?.[1];
  if (entry && entry !== "new") return `/library/entries/${entry}/edit`;

  const topic = pathname.match(/^\/library\/topics\/([^/]+)(?:\/entries)?$/)?.[1];
  if (topic && topic !== "new") return `/library/topics/${topic}/edit`;

  return null;
}

/**
 * In-panel keyboard shortcuts (see `constants/shortcuts.ts`). Mounted once in
 * the side panel's root layout.
 *
 * Listens on the panel's own window, so it only ever sees keys pressed while
 * the panel has focus; a key pressed on the web page never reaches it.
 */
export function usePanelShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { capture } = useCaptureActiveTab();

  // Read through a ref so the listener is attached once, not on every render.
  const latest = useRef({ navigate, location, capture });
  latest.current = { navigate, location, capture };

  useEffect(() => {
    const run = async (action: PanelShortcutAction) => {
      const { navigate, location, capture } = latest.current;

      switch (action) {
        case "save": {
          // The page's header save button: clicking it rather than submitting
          // the form directly means a save already in progress, which disables
          // the button, cannot be started twice.
          document
            .querySelector<HTMLButtonElement>(
              'button[type="submit"][form]:not(:disabled)',
            )
            ?.click();
          return;
        }
        case "search": {
          const input = document.querySelector<HTMLInputElement>(
            "[data-shortcut-search]",
          );
          if (input) {
            input.focus();
            input.select();
          } else {
            navigate("/library", {
              viewTransition: true,
              state: { focusSearch: true },
            });
          }
          return;
        }
        case "newEntry": {
          if (location.pathname === NEW_ENTRY_PATH) return;
          const topicId = currentTopicId(location.pathname);
          navigate(
            topicId
              ? `${NEW_ENTRY_PATH}?topicId=${encodeURIComponent(topicId)}`
              : NEW_ENTRY_PATH,
            { viewTransition: true },
          );
          return;
        }
        case "capture":
        case "bookmark": {
          const captured = await capture(
            action === "capture" ? "auto" : "bookmark",
          );
          if (!captured) toast.error("This page can't be captured");
          return;
        }
        case "home":
        case "library":
        case "settings": {
          const path =
            action === "home"
              ? "/"
              : action === "library"
                ? "/library"
                : "/settings";
          if (location.pathname !== path) navigate(path, { viewTransition: true });
          return;
        }
        case "scrollToTop": {
          // Same as clicking the page title in the header.
          window.scrollTo({ top: 0 });
          return;
        }
        case "edit": {
          const editPath = editPathFor(location.pathname);
          if (editPath) navigate(editPath, { viewTransition: true });
          return;
        }
        case "newTopic": {
          if (location.pathname !== NEW_TOPIC_PATH) {
            navigate(NEW_TOPIC_PATH, { viewTransition: true });
          }
          return;
        }
        case "back": {
          navigate(-1);
          return;
        }
        case "forward": {
          navigate(1);
          return;
        }
        case "showShortcuts": {
          navigate("/settings/keyboard-shortcuts", { viewTransition: true });
          return;
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const action = resolvePanelShortcut(event);
      if (!action) return;

      // Swallowed even when the action turns out to have nothing to do: ⌘/Ctrl+S
      // would otherwise open "Save page as" for the panel itself, and the
      // browser's own back and forward keys would act on its history rather
      // than the panel's.
      event.preventDefault();
      if (action !== "save" && navLock.isLocked()) return;
      run(action);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
