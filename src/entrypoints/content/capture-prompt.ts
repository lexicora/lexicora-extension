import { sendMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import {
  createShadowRootUi,
  type ShadowRootContentScriptUi,
} from "wxt/utils/content-script-ui/shadow-root";
import "@fontsource/wix-madefor-text/400.css";
import "@fontsource/wix-madefor-text/500.css";

export async function setupCapturePrompt(ctx: any) {
  // TODO: Let user enable/disable via extension settings
  // TODO: Make timing configurable via extension settings
  const TIMER_MS = import.meta.env.DEV ? 2000 : 120_000; // 2 minutes in production, 2 seconds in dev
  let ui: ShadowRootContentScriptUi<void> | null = null;
  let timer: ReturnType<typeof setTimeout>;

  let autoHideTimeout: ReturnType<typeof setTimeout>;
  let onDragMove: ((e: MouseEvent) => void) | null = null;
  let onDragEnd: (() => void) | null = null;

  const mountUi = async () => {
    // Initial cleanup
    if (ui) {
      ui.remove();
      ui = null;
    }
    const styles = `
      :host {
        /* DEFAULT (DARK MODE) - Matches .dark in global.css */
        --lexicora-fg: #ffffff;
        --lexicora-bg: oklch(0.19 0.034 264.665); /*was:(0.21) oklch(0.1296 0.0274 261.69)*/
        --lexicora-border: oklch(1 0 0 / 0.15);
        --lexicora-bg-diff-hover: rgba(255, 255, 255, 0.1);
        --lexicora-surface-hover: oklch(0.245 0.033 256.848);
        --lexicora-text-primary: oklch(0.985 0.002 247.839);
        --lexicora-text-secondary: oklch(0.707 0.022 261.325);

        --lexicora-radius: 0.625rem;
        --lexicora-font-sans: "Wix Madefor Text", system-ui, "Segoe UI", -apple-system, Avenir, Helvetica, Arial, sans-serif
      }

      /* LIGHT MODE OVERRIDES - Matches :root in global.css */
      @media (prefers-color-scheme: light) {
        :host {
          --lexicora-fg: #00143d;
          --lexicora-bg: oklch(1 0 0);
          --lexicora-border: oklch(0.850 0.006 264.531);
          --lexicora-bg-diff-hover: rgba(0, 0, 0, 0.1);
          --lexicora-surface-hover: oklch(0.985 0.003 264.542);
          --lexicora-text-primary: oklch(0.13 0.028 261.692);
          --lexicora-text-secondary: oklch(0.551 0.027 264.364);
        }
      }

      .lexicora-toast-wrapper {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 2147483647;
        font-family: var(--lexicora-font-sans);
        perspective: 1000px;
      }

      .lexicora-toast {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 340px;
        padding-top: 12px;
        padding-bottom: 10px;
        padding-inline: 14px;
        background-color: var(--lexicora-bg);
        border: 1px solid var(--lexicora-border);
        border-radius: var(--lexicora-radius);
        box-shadow:
          0 8px 13px -4px rgba(0, 0, 0, 0.3),
          0 4px 6px -5px rgba(0, 0, 0, 0.1),
          0 -4px 11px -4px rgba(0, 0, 0, 0.2);
        cursor: default;
        user-select: none;
        opacity: 0;
        transform: translateY(-90px) scale(0.95);
        will-change: transform, opacity, box-shadow, border-color, background-color;
        transition:
          transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.3s ease-out,
          box-shadow 0.2s ease,
          border-color 0.2s ease,
          background-color 0.2s ease;
      }

      .lexicora-toast.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      .lexicora-toast.dragging {
        transition: none;
      }

      .lexicora-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        flex-shrink: 0;
        border-radius: 8px;
        color: var(--lexicora-fg);
        pointer-events: none;
      }

      .lexicora-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .lexicora-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--lexicora-fg);
        margin: 0;
        line-height: 1.2;
        letter-spacing: 0.01rem;
      }

      .lexicora-desc {
        font-size: 13px;
        color: var(--lexicora-text-secondary);
        margin: 0;
        line-height: 1.4;
      }

      .lexicora-btn-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background-color: transparent;
        border: none;
        border-radius: 6px;
        color: var(--lexicora-text-secondary);
        cursor: pointer;
        will-change: color, background-color;
        transition: color 0.2s ease, background-color 0.2s ease;
      }

      .lexicora-btn-close:hover {
        background-color: var(--lexicora-bg-diff-hover);
        color: var(--lexicora-text-primary);
      }
    `;

    ui = await createShadowRootUi(ctx, {
      name: "lexicora-ui-host",
      position: "inline",
      anchor: "body",
      css: styles,
      onMount: (uiContainer) => {
        uiContainer.innerHTML = `
          <div class="lexicora-toast-wrapper">
            <div id="lexicora-toast" class="lexicora-toast" tabindex="0" aria-label="Lexicora Capture prompt">
              <div class="lexicora-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" style="border-radius: 4px;"><g transform="translate(-6143 -16217)"><path d="M457.142,0V124.571a45.714,45.714,0,0,1-45.714,45.714H0Z" transform="translate(6197.857 16558.715)" fill="currentColor"/><path d="M457.142,170.286V45.714A45.714,45.714,0,0,0,411.428,0H0Z" transform="translate(6143 16674.143) rotate(-90)" fill="currentColor"/><path d="M27.731,0H152.188a45.672,45.672,0,0,1,45.672,45.672V170.13l-393.4,223.688Z" transform="translate(6457.139 16217)" fill="currentColor"/></g></svg>
              </div>
              <div class="lexicora-content">
                <h4 class="lexicora-title">Capture with Lexicora?</h4>
                <p class="lexicora-desc">Click to open the side panel.</p>
              </div>
              <button id="lexicora-btn-close" class="lexicora-btn-close" aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        `;

        const toastEl = uiContainer.querySelector(
          "#lexicora-toast",
        ) as HTMLElement;
        const closeBtn = uiContainer.querySelector(
          "#lexicora-btn-close",
        ) as HTMLButtonElement;

        // Double RAF for animation stability
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (toastEl) toastEl.classList.add("visible");
          });
        });

        // Internal variables
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let wasDragging = false;
        let dragAxis: "x" | "y" | null = null;

        // Velocity Tracking
        let lastTime = 0;
        let lastX = 0;
        let lastY = 0;
        let velocityX = 0;
        let velocityY = 0;

        // Actions
        const destroy = () => {
          ui?.remove(); // Triggers onRemove
          ui = null;
        };

        const close = () => {
          if (!toastEl) return;

          clearTimeout(autoHideTimeout);

          toastEl.style.transform = "translateY(-90px) scale(0.95)";
          toastEl.style.opacity = "0";

          setTimeout(destroy, 400); // maybe change to 300 or 350
        };

        const capture = () => {
          sendMessage(MSG.OPEN_SIDEPANEL, {}, "background");
          close();
        };

        // Auto-hide timer
        // if (import.meta.env.PROD) {
        //   autoHideTimeout = setTimeout(close, 15000);
        // }
        autoHideTimeout = setTimeout(close, 15000);

        // Drag logic
        onDragMove = (e: MouseEvent) => {
          const now = Date.now();
          const diffX = e.clientX - startX;
          const diffY = e.clientY - startY;

          // Velocity Calculation
          const dt = now - lastTime;
          if (dt > 0) {
            velocityX = (e.clientX - lastX) / dt; // pixels per ms
            velocityY = (e.clientY - lastY) / dt;
          }
          lastX = e.clientX;
          lastY = e.clientY;
          lastTime = now;

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
              // Resistance logic for left drag
              const translateX =
                diffX > 0 ? diffX : -Math.pow(Math.abs(diffX), 0.25);
              toastEl.style.transform = `translateX(${translateX}px)`;
              break;
            case "y":
              currentY = diffY;
              // Resistance logic for down drag
              const translateY = diffY < 0 ? diffY : Math.pow(diffY, 0.25);
              toastEl.style.transform = `translateY(${translateY}px)`;
              break;
          }

          if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) wasDragging = true;
        };

        onDragEnd = () => {
          if (onDragMove) window.removeEventListener("mousemove", onDragMove);
          if (onDragEnd) window.removeEventListener("mouseup", onDragEnd);

          toastEl.classList.remove("dragging");

          // Dismissal Logic
          // Swipe Right (> 100px)
          if (
            (dragAxis === "x" && currentX > 100) ||
            (dragAxis === "x" && currentX > 0 && velocityX > 0.5)
          ) {
            toastEl.style.transition =
              "transform 0.3s ease-out, opacity 0.3s ease";
            toastEl.style.transform = `translateX(400px)`;
            toastEl.style.opacity = "0";
            finishDismiss();
          }
          // Swipe Up (< -50px) - Note: UP is negative Y
          else if (
            (dragAxis === "y" && currentY < -40) ||
            (dragAxis === "y" && currentY < 0 && velocityY < -0.5)
          ) {
            toastEl.style.transition =
              "transform 0.3s ease-out, opacity 0.3s ease";
            toastEl.style.transform = `translateY(-100px)`; // Fly up
            toastEl.style.opacity = "0";
            finishDismiss();
          }
          // Reset (Snap back)
          else {
            toastEl.style.transition = "";
            toastEl.style.transform = "";
            toastEl.style.opacity = "";
            // Restart timer only if we cancelled a drag
            // if (import.meta.env.PROD) {
            //   autoHideTimeout = setTimeout(close, 15000);
            // }
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

          // Reset Velocity State
          lastX = e.clientX;
          lastY = e.clientY;
          lastTime = Date.now();
          velocityX = 0;
          velocityY = 0;

          toastEl.classList.add("dragging");
          clearTimeout(autoHideTimeout);

          if (onDragMove && onDragEnd) {
            window.addEventListener("mousemove", onDragMove);
            window.addEventListener("mouseup", onDragEnd);
          }
        };

        // Listeners
        toastEl.addEventListener("mousedown", onMouseDown);

        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          close();
        });

        toastEl.addEventListener("click", () => {
          if (!wasDragging) capture();
        });

        toastEl.addEventListener("keydown", (e) => {
          if (!toastEl.matches(":focus")) return;
          if (e.key === "Enter") capture();
        });
      },

      // Cleanup
      onRemove: (uiContainer) => {
        clearTimeout(autoHideTimeout);

        if (onDragMove) window.removeEventListener("mousemove", onDragMove);
        if (onDragEnd) window.removeEventListener("mouseup", onDragEnd);

        onDragMove = null;
        onDragEnd = null;
      },
    });

    ui.mount();
  };

  // Timer logic
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
