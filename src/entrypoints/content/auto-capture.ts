import { sendMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import ReactDOM from "react-dom/client";
import {
  createShadowRootUi,
  type ShadowRootContentScriptUi,
} from "wxt/utils/content-script-ui/shadow-root";
//import "@/assets/styles/global.css"; // Essential for Tailwind
import { Toaster } from "@/components/ui/sonner"; // Import your component
import { toast } from "sonner"; // Import the trigger

// TODO: Rename file to capture-notification.ts maybe add handle to name too
// TODO: Also rename exporting method to something like setupCaptureNotificationHandler

// const TIMER_DURATION_MS = import.meta.env.DEV ? 1000 : 60000; // 1 Minute // TODO: Get from settings later

export function setupAutoCaptureTimer(ctx: any) {
  const TIMER_MS = import.meta.env.DEV ? 1000 : 60000;
  //let ui: ReturnType<typeof createShadowRootUi> | null = null;
  let ui: ShadowRootContentScriptUi<void> | null = null;
  //let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null;
  let timer: ReturnType<typeof setTimeout>;

  // --- SHARED STATE (Must be outer scope for cleanup) ---
  let autoHideTimeout: ReturnType<typeof setTimeout>;
  let onDragMove: ((e: MouseEvent) => void) | null = null;
  let onDragEnd: (() => void) | null = null;

  const mountUi = async () => {
    // 1. SAFETY: If UI exists, remove it first to trigger cleanup
    if (ui) {
      ui.remove();
      ui = null;
    }
    const styles = `
      :host {
              /* DEFAULT (DARK MODE) - Matches .dark in global.css */
              --bg: oklch(0.21 0.034 264.665);
              --border: oklch(1 0 0 / 0.14);
              --surface-hover: oklch(0.278 0.033 256.848);
              --text-primary: oklch(0.985 0.002 247.839);
              --text-secondary: oklch(0.707 0.022 261.325);
              --icon-bg: rgba(255, 255, 255, 0.05);
              --shadow-color: rgba(0, 0, 0, 0.5);
              --shadow-subtle: rgba(0, 0, 0, 0.3);

              --radius: 0.625rem;
              --font-sans: "Wix Madefor Text", system-ui, -apple-system, sans-serif;
            }

            /* LIGHT MODE OVERRIDES - Matches :root in global.css */
            @media (prefers-color-scheme: light) {
              :host {
                --bg: oklch(1 0 0); /* White */
                --border: oklch(0.928 0.006 264.531); /* Zinc 200 */
                --surface-hover: oklch(0.967 0.003 264.542); /* Zinc 100 */
                --text-primary: oklch(0.13 0.028 261.692); /* Zinc 900 */
                --text-secondary: oklch(0.551 0.027 264.364); /* Zinc 500 */
                --icon-bg: rgba(0, 0, 0, 0.04); /* Subtle dark tint for white bg */
                --shadow-color: rgba(0, 0, 0, 0.1); /* Much lighter shadow for light mode */
                --shadow-subtle: rgba(0, 0, 0, 0.05);
              }
            }

      .lex-toast-wrapper {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 2147483647;
        font-family: var(--font-sans);
        perspective: 1000px;
      }

      .lex-toast {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 340px;
        padding: 16px;
        background-color: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius);

        /* Deep bluish shadow */
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.5),
          0 4px 6px -4px rgba(0, 0, 0, 0.3);

        cursor: pointer;
        user-select: none;

        /* Animation Base State */
        opacity: 0;
        transform: translateX(20px) scale(0.95);
        transition:
          transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.4s ease-out,
          box-shadow 0.2s ease,
          border-color 0.2s ease,
          background-color 0.2s ease;
      }

      /* Visible State */
      .lex-toast.visible {
        opacity: 1;
        transform: translateX(0) scale(1);
      }

      /* Hover State */
      .lex-toast:hover {
        background-color: var(--surface-hover);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.6),
          0 0 0 1px rgba(255, 255, 255, 0.1);
      }

      /* Dragging State */
      .lex-toast.dragging {
        transition: none;
        cursor: grabbing;
        background-color: var(--surface-hover);
      }

      /* Icon Box - Using Surface Hover color */
      .lex-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }

      .lex-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .lex-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.2;
      }

      .lex-desc {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.4;
      }

      /* Close Button */
      .lex-btn-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        margin-left: -4px;
      }

      .lex-btn-close:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .lex-btn-close:active {
        background-color: rgba(255, 255, 255, 0.15);
      }
    `;

    ui = await createShadowRootUi(ctx, {
      name: "lexicora-ui-host",
      position: "inline",
      anchor: "body",
      css: styles, // was: Max Z-Index z-index: 2147483647;
      onMount: (uiContainer) => {
        // 1. DEFINE RAW CSS
        // This style block is scoped strictly to the Shadow Root.

        // 2. INJECT HTML + CSS
        uiContainer.innerHTML = `
          <div class="lex-toast-wrapper">
            <div id="lexicora-toast" class="lex-toast">

              <div class="lex-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>

              <div class="lex-content">
                <h4 class="lex-title">Save to Lexicora?</h4>
                <p class="lex-desc">Click to capture this page.</p>
              </div>

              <button id="lex-btn-close" class="lex-btn-close" aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

            </div>
          </div>
        `;

        const toastEl = uiContainer.querySelector(
          "#lexicora-toast",
        ) as HTMLElement;
        const closeBtn = uiContainer.querySelector(
          "#lex-btn-close",
        ) as HTMLButtonElement;

        // Double RAF for animation stability
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (toastEl) toastEl.classList.add("visible");
          });
        });

        // --- INTERNAL VARS ---
        let startX = 0;
        let currentX = 0;
        let wasDragging = false;

        // --- ACTIONS ---
        const destroy = () => {
          ui?.remove(); // Triggers onRemove
          ui = null;
        };

        const close = () => {
          if (!toastEl) return;

          clearTimeout(autoHideTimeout);

          toastEl.style.transform = "translateX(20px) scale(0.95)";
          toastEl.style.opacity = "0";

          setTimeout(destroy, 400);
        };

        const save = () => {
          sendMessage(MSG.OPEN_SIDEPANEL, {}, "background");
          close();
        };

        // --- AUTO HIDE ---
        autoHideTimeout = setTimeout(close, 15000);

        // --- DRAG LOGIC ---
        // Assigned to outer scope vars
        onDragMove = (e: MouseEvent) => {
          const diff = e.clientX - startX;
          currentX = diff;
          const translateX = diff > 0 ? diff : diff * 0.2;

          toastEl.style.transform = `translateX(${translateX}px)`;

          const opacity = Math.max(0, 1 - Math.abs(diff) / 200);
          toastEl.style.opacity = opacity.toString();

          if (Math.abs(diff) > 5) wasDragging = true;
        };

        onDragEnd = () => {
          if (onDragMove) window.removeEventListener("mousemove", onDragMove);
          if (onDragEnd) window.removeEventListener("mouseup", onDragEnd);

          toastEl.classList.remove("dragging");

          if (currentX > 100) {
            // Dismiss
            toastEl.style.transition =
              "transform 0.3s ease-out, opacity 0.3s ease";
            toastEl.style.transform = `translateX(400px)`;
            toastEl.style.opacity = "0";

            clearTimeout(autoHideTimeout);
            //autoHideTimeout = setTimeout(close, 300);
            // TODO: Maybe start new timeout or better reset timeout
            setTimeout(destroy, 300);
          } else {
            // Reset
            toastEl.style.transition = "";
            toastEl.style.transform = "";
            toastEl.style.opacity = "";
          }
        };

        const onMouseDown = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest("#lex-btn-close")) return;

          wasDragging = false;
          startX = e.clientX;
          toastEl.classList.add("dragging");

          clearTimeout(autoHideTimeout);

          if (onDragMove && onDragEnd) {
            window.addEventListener("mousemove", onDragMove);
            window.addEventListener("mouseup", onDragEnd);
          }
        };

        // --- LISTENERS ---
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          close();
        });

        toastEl.addEventListener("click", () => {
          if (!wasDragging) save();
        });

        toastEl.addEventListener("mousedown", onMouseDown);
      },

      onRemove: (uiContainer) => {
        // --- CLEANUP ---
        // This runs automatically when ui.remove() is called
        clearTimeout(autoHideTimeout);

        if (onDragMove) window.removeEventListener("mousemove", onDragMove);
        if (onDragEnd) window.removeEventListener("mouseup", onDragEnd);

        onDragMove = null;
        onDragEnd = null;
      },
    });

    ui.mount();
    //     // 3. TRIGGER ANIMATION
    //     // We use requestAnimationFrame to allow the DOM to paint the initial state (hidden)
    //     // before applying the 'visible' class.
    //     requestAnimationFrame(() => {
    //       const el = uiContainer.querySelector("#lexicora-toast");
    //       if (el) el.classList.add("visible");
    //     });

    //     // 4. LOGIC & LISTENERS
    //     const close = () => {
    //       const el = uiContainer.querySelector("#lexicora-toast");
    //       if (el) {
    //         el.classList.remove("visible"); // Triggers slide-down animation

    //         // Wait for animation (300ms) before destroying UI
    //         setTimeout(() => {
    //           ui?.remove();
    //           ui = null;
    //         }, 300);
    //       }
    //     };

    //     uiContainer
    //       .querySelector("#lex-btn-close")
    //       ?.addEventListener("click", close);
    //     uiContainer
    //       .querySelector("#lex-btn-dismiss")
    //       ?.addEventListener("click", close);

    //     uiContainer
    //       .querySelector("#lex-btn-save")
    //       ?.addEventListener("click", async () => {
    //         // --- OPEN POPUP ---
    //         // const windowId = await browser.windows.getCurrent().then((win) => {
    //         //   return win.id;
    //         // });
    //         // if (!windowId) return;
    //         // browser.sidePanel.open({ windowId: windowId });
    //         sendMessage(MSG.OPEN_SIDEPANEL, {}, "background");
    //         const url = browser.runtime.getURL("/sidepanel.html");
    //         const width = 450;
    //         const height = window.screen.availHeight;
    //         const left = window.screen.availWidth - width;
    //         // window.open(
    //         //   url,
    //         //   "LexicoraCapture",
    //         //   `popup=yes,width=${width},height=${height},left=${left},top=0`,
    //         // );

    //         close();
    //       });
    //   },
    //   onRemove: (uiContainer) => {
    //     //uiContainer.innerHTML = '';
    //   },
    // });

    // ui.mount();
  };

  // --- TIMER LOGIC ---
  const startTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!document.hidden) mountUi();
    }, TIMER_MS);
  };

  startTimer();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(timer);
    else startTimer();
  });
}

// export function setupAutoCaptureTimer() {
//   let captureTimer: ReturnType<typeof setTimeout> | null = null;

//   // State to track if we already notified for this specific URL
//   let hasTriggered = false;
//   let lastUrl = window.location.href;

//   const startTimer = () => {
//     // 1. SPA Check: If the URL changed since we last looked, reset the trigger flag
//     if (window.location.href !== lastUrl) {
//       hasTriggered = false;
//       lastUrl = window.location.href;
//     }

//     // 2. "Once per lifetime" Check: If we already fired for this URL, do nothing
//     if (hasTriggered) return;

//     // 3. Reset Check: Clear any existing timer so we don't have duplicates
//     if (captureTimer) clearTimeout(captureTimer);

//     captureTimer = setTimeout(() => {
//       // Double-check visibility and trigger status before sending
//       if (document.visibilityState === "visible" && !hasTriggered) {
//         hasTriggered = true; // Mark as done so it doesn't fire again for this URL
//         sendMessage(MSG.TRIGGER_AUTO_CAPTURE_NOTIFICATION, {}, "background");
//       }
//     }, TIMER_DURATION_MS);
//   };

//   const stopTimer = () => {
//     if (captureTimer) {
//       clearTimeout(captureTimer);
//       captureTimer = null;
//     }
//   };

//   // --- Listeners ---

//   // Start immediately
//   startTimer();

//   // Handle Tab Switching (Reset logic)
//   document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "hidden") {
//       stopTimer(); // Kills the timer (reset)
//     } else {
//       startTimer(); // Starts a fresh 60s timer
//     }
//   });

//   // Optional: Handle SPA navigation (History API) to reset logic immediately
//   // This helps if the user navigates without switching tabs
//   window.addEventListener("popstate", startTimer);

//   // Cleanup
//   window.addEventListener("beforeunload", stopTimer);
// }
