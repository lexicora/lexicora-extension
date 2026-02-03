import { sendMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import ReactDOM from "react-dom/client";
import {
  createShadowRootUi,
  type ShadowRootContentScriptUi,
} from "wxt/utils/content-script-ui/shadow-root";
import "@fontsource/wix-madefor-text/400.css";
import "@fontsource/wix-madefor-text/500.css";
import "@fontsource/wix-madefor-text/600.css";
//import "@/assets/styles/global.css"; // Essential for Tailwind
// TODO: Rename file to capture-notification.ts maybe add handle to name too
// TODO: Also rename exporting method to something like setupCaptureNotificationHandler

// const TIMER_DURATION_MS = import.meta.env.DEV ? 1000 : 60000; // 1 Minute // TODO: Get from settings later

export async function setupAutoCaptureTimer(ctx: any) {
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
        --lc-fg: #ffffff;
        --lc-bg: oklch(0.21 0.034 264.665);
        --lc-border: oklch(1 0 0 / 0.14);
        --lc-bg-diff-hover: rgba(255, 255, 255, 0.1);
        --lc-surface-hover: oklch(0.245 0.033 256.848);
        --lc-text-primary: oklch(0.985 0.002 247.839);
        --lc-text-secondary: oklch(0.707 0.022 261.325);
        --lc-icon-bg: rgba(255, 255, 255, 0.05);
        --lc-shadow-color: rgba(0, 0, 0, 0.5);
        --lc-shadow-subtle: rgba(0, 0, 0, 0.3);

        --lc-radius: 0.625rem;
        --lc-font-sans: "Wix Madefor Text", system-ui, -apple-system, sans-serif;
      }

      /* LIGHT MODE OVERRIDES - Matches :root in global.css */
      @media (prefers-color-scheme: light) {
        :host {
          --lc-fg: #00143d;
          --lc-bg: oklch(1 0 0); /* White */
          --lc-border: oklch(0.900 0.006 264.531); /* Zinc 200 */
          --lc-bg-diff-hover: rgba(0, 0, 0, 0.1);
          --lc-surface-hover: oklch(0.985 0.003 264.542); /* Zinc 100 */
          --lc-text-primary: oklch(0.13 0.028 261.692); /* Zinc 900 */
          --lc-text-secondary: oklch(0.551 0.027 264.364); /* Zinc 500 */
          --lc-icon-bg: rgba(0, 0, 0, 0.04); /* Subtle dark tint for white bg */
          --lc-shadow-color: rgba(0, 0, 0, 0.1); /* Much lighter shadow for light mode */
          --lc-shadow-subtle: rgba(0, 0, 0, 0.05);
        }
      }

      .lex-toast-wrapper {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 2147483647;
        font-family: var(--lc-font-sans);
        perspective: 1000px;
      }

      .lex-toast {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 340px;
        padding: 12px;
        background-color: var(--lc-bg);
        border: 1px solid var(--lc-border);
        border-radius: var(--lc-radius);

        /* Deep bluish shadow */
        box-shadow:
          0 8px 13px -4px rgba(0, 0, 0, 0.3),
          0 4px 6px -5px rgba(0, 0, 0, 0.1),
          0 -2px 10px -4px rgba(0, 0, 0, 0.1);

        cursor: pointer;
        user-select: none;

        /* Animation Base State */
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
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
        transform: translateY(0) scale(1);
      }

      /* Dragging State */
      .lex-toast.dragging {
        transition: none;
        /*cursor: grabbing;*/
      }

      /* Icon Box - Using Surface Hover color */
      .lex-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 2px;
        flex-shrink: 0;
        border-radius: 8px;
        /*background-color: rgba(255, 255, 255, 0.05);*/
        /*color: var(--lc-text-primary);*/
        color: var(--lc-fg);
        /*border: 1px solid var(--lc-border);*/
        pointer-events: none;
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
        /*color: var(--lc-text-primary);*/
        color: var(--lc-fg);
        margin: 0;
        line-height: 1.2;
      }

      .lex-desc {
        font-size: 13px;
        color: var(--lc-text-secondary);
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
        color: var(--lc-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        margin-left: -4px;
      }

      .lex-btn-close:hover {
        /*background-color: rgba(255, 255, 255, 0.1);*/
        background-color: var(--lc-bg-diff-hover);
        color: var(--lc-text-primary);
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
            <div id="lexicora-toast" class="lex-toast" tabindex="0" aria-label="Lexicora Capture Notification">
              <!--<div class="lex-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>-->
              <div class="lex-icon-box lc-d-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><g transform="translate(-6143 -16217)"><path d="M457.142,0V124.571a45.714,45.714,0,0,1-45.714,45.714H0Z" transform="translate(6197.857 16558.715)" fill="currentColor"/><path d="M457.142,170.286V45.714A45.714,45.714,0,0,0,411.428,0H0Z" transform="translate(6143 16674.143) rotate(-90)" fill="currentColor"/><path d="M27.731,0H152.188a45.672,45.672,0,0,1,45.672,45.672V170.13l-393.4,223.688Z" transform="translate(6457.139 16217)" fill="currentColor"/></g></svg>
              </div>
              <div class="lex-content">
                <h4 class="lex-title">Capture with Lexicora?</h4>
                <p class="lex-desc">Click to open the side panel.</p>
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
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let wasDragging = false;
        let dragAxis: "x" | "y" | null = null;

        // --- ACTIONS ---
        const destroy = () => {
          ui?.remove(); // Triggers onRemove
          ui = null;
        };

        const close = () => {
          if (!toastEl) return;

          clearTimeout(autoHideTimeout);

          toastEl.style.transform = "translateY(-20px) scale(0.95)"; //was on the X axis
          toastEl.style.opacity = "0";

          setTimeout(destroy, 400);
        };

        const capture = () => {
          sendMessage(MSG.OPEN_SIDEPANEL, {}, "background");
          close();
        };

        // --- AUTO HIDE ---
        autoHideTimeout = setTimeout(close, 15000);

        // --- DRAG LOGIC ---
        // Assigned to outer scope vars
        onDragMove = (e: MouseEvent) => {
          const diffX = e.clientX - startX;
          const diffY = e.clientY - startY;

          if (!dragAxis) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
              dragAxis = "x";
            } else if (
              Math.abs(diffY) > Math.abs(diffX) &&
              Math.abs(diffY) > 5
            ) {
              dragAxis = "y";
            }
          }

          switch (dragAxis) {
            case "x":
              currentX = diffX;
              // Resistance logic for left drag (unchanged)
              //const translateX = diffX > 0 ? diffX : diffX * 0.02;
              const translateX =
                diffX > 0 ? diffX : diffX < -800 ? -16 : diffX * 0.02;
              toastEl.style.transform = `translateX(${translateX}px)`;
              break;
            case "y":
              currentY = diffY;
              // Allow dragging UP (negative), add resistance for dragging DOWN (positive)
              //const translateY = diffY < 0 ? diffY : diffY * 0.05;
              const translateY =
                diffY < 0 ? diffY : diffY > 800 ? 16 : diffY * 0.02;
              toastEl.style.transform = `translateY(${translateY}px)`;
              break;
          }

          if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) wasDragging = true;
        };

        onDragEnd = () => {
          if (onDragMove) window.removeEventListener("mousemove", onDragMove);
          if (onDragEnd) window.removeEventListener("mouseup", onDragEnd);

          toastEl.classList.remove("dragging");

          // DISMISS LOGIC
          // 1. Swipe Right (> 100px)
          if (dragAxis === "x" && currentX > 100) {
            toastEl.style.transition =
              "transform 0.3s ease-out, opacity 0.3s ease";
            toastEl.style.transform = `translateX(400px)`;
            toastEl.style.opacity = "0";
            finishDismiss();
          }
          // 2. Swipe Up (< -50px) - Note: UP is negative Y
          else if (dragAxis === "y" && currentY < -50) {
            toastEl.style.transition =
              "transform 0.3s ease-out, opacity 0.3s ease";
            toastEl.style.transform = `translateY(-100px)`; // Fly up
            toastEl.style.opacity = "0";
            finishDismiss();
          }
          // 3. Reset (Snap back)
          else {
            toastEl.style.transition = "";
            toastEl.style.transform = "";
            toastEl.style.opacity = "";
            // Restart timer only if we cancelled a drag
            autoHideTimeout = setTimeout(close, 15000);
          }

          // Reset internal state
          dragAxis = null;
          currentX = 0;
          currentY = 0;
        };

        const finishDismiss = () => {
          clearTimeout(autoHideTimeout);
          setTimeout(destroy, 300);
        };

        const onMouseDown = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest("#lex-btn-close")) return;

          wasDragging = false;
          startX = e.clientX;
          startY = e.clientY;
          dragAxis = null;

          toastEl.classList.add("dragging");
          clearTimeout(autoHideTimeout);

          if (onDragMove && onDragEnd) {
            window.addEventListener("mousemove", onDragMove);
            window.addEventListener("mouseup", onDragEnd);
          }
        };

        // --- LISTENERS ---
        toastEl.addEventListener("mousedown", onMouseDown);

        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          close();
        });

        toastEl.addEventListener("click", () => {
          if (!wasDragging) capture();
        });
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
  };

  // --- TIMER LOGIC ---
  const startTimer = async () => {
    clearTimeout(timer);
    const isOpen = await sendMessage<boolean>(
      MSG.CHECK_SIDEPANEL_OPEN,
      {},
      "background",
    ).catch(() => false);
    if (isOpen) return; // Do not show if side panel is open
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
