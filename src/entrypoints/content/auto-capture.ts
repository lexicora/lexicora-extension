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

// const TIMER_DURATION_MS = import.meta.env.DEV ? 1000 : 60000; // 1 Minute // TODO: Get from settings later

export function setupAutoCaptureTimer(ctx: any) {
  const TIMER_MS = import.meta.env.DEV ? 1000 : 60000;
  //let ui: ReturnType<typeof createShadowRootUi> | null = null;
  let ui: ShadowRootContentScriptUi<void> | null = null;
  //let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null;
  let timer: ReturnType<typeof setTimeout>;

  const mountUi = async () => {
    if (ui) return; // Already visible

    ui = await createShadowRootUi(ctx, {
      name: "lexicora-ui-host",
      position: "inline",
      anchor: "body",
      css: "z-index: 2147483647;", // Max Z-Index
      onMount: (uiContainer) => {
        // 1. DEFINE RAW CSS
        // This style block is scoped strictly to the Shadow Root.
        const styles = `
                  .lex-toast {
                    position: fixed;
                    /*top: 24px;*/
                    bottom: 24px;
                    right: 24px;
                    z-index: 50;
                    display: flex;
                    width: 100%;
                    max-width: 400px;
                    flex-direction: column;
                    gap: 12px;
                    border-radius: 12px;
                    border: 1px solid #27272a; /* zinc-800 */
                    background-color: #09090b; /* zinc-950 */
                    padding: 16px;
                    color: #fafafa; /* zinc-50 */
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    font-family: system-ui, -apple-system, sans-serif;

                    /* Animation States */
                    transition: all 300ms ease-out;
                    transform: translateY(40px);
                    opacity: 0;
                  }

                  .lex-toast.visible {
                    transform: translateY(0);
                    opacity: 1;
                  }

                  .lex-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                  }

                  .lex-icon-box {
                    display: flex;
                    height: 36px;
                    width: 36px;
                    flex-shrink: 0;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    background-color: rgba(99, 102, 241, 0.1); /* indigo-500/10 */
                    color: #818cf8; /* indigo-400 */
                  }

                  .lex-content {
                    flex: 1;
                  }

                  .lex-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                    line-height: 1.2;
                  }

                  .lex-desc {
                    font-size: 12px;
                    color: #a1a1aa; /* zinc-400 */
                    margin: 4px 0 0 0;
                    line-height: 1.4;
                  }

                  .lex-btn-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #71717a; /* zinc-500 */
                    padding: 4px;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .lex-btn-close:hover {
                    color: white;
                  }

                  .lex-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 4px;
                  }

                  .lex-btn-dismiss {
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #d4d4d8; /* zinc-300 */
                    background: transparent;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  .lex-btn-dismiss:hover {
                    background-color: #27272a; /* zinc-900 */
                  }

                  .lex-btn-save {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                    background-color: #4f46e5; /* indigo-600 */
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    transition: background 0.2s;
                  }
                  .lex-btn-save:hover {
                    background-color: #4338ca; /* indigo-700 */
                  }
                `;

        // 2. INJECT HTML + CSS
        uiContainer.innerHTML = `
                  <style>${styles}</style>
                  <div id="lexicora-toast" class="lex-toast">

                    <div class="lex-row">
                      <div class="lex-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>

                      <div class="lex-content">
                        <h4 class="lex-title">Capture this page?</h4>
                        <p class="lex-desc">You've been reading for a while. Save to Lexicora?</p>
                      </div>

                      <button id="lex-btn-close" class="lex-btn-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    <div class="lex-actions">
                      <button id="lex-btn-dismiss" class="lex-btn-dismiss">
                        Dismiss
                      </button>
                      <button id="lex-btn-save" class="lex-btn-save">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Save Page
                      </button>
                    </div>

                  </div>
                `;

        // 3. TRIGGER ANIMATION
        // We use requestAnimationFrame to allow the DOM to paint the initial state (hidden)
        // before applying the 'visible' class.
        requestAnimationFrame(() => {
          const el = uiContainer.querySelector("#lexicora-toast");
          if (el) el.classList.add("visible");
        });

        // 4. LOGIC & LISTENERS
        const close = () => {
          const el = uiContainer.querySelector("#lexicora-toast");
          if (el) {
            el.classList.remove("visible"); // Triggers slide-down animation

            // Wait for animation (300ms) before destroying UI
            setTimeout(() => {
              ui?.remove();
              ui = null;
            }, 300);
          }
        };

        uiContainer
          .querySelector("#lex-btn-close")
          ?.addEventListener("click", close);
        uiContainer
          .querySelector("#lex-btn-dismiss")
          ?.addEventListener("click", close);

        uiContainer
          .querySelector("#lex-btn-save")
          ?.addEventListener("click", async () => {
            // --- OPEN POPUP ---
            // const windowId = await browser.windows.getCurrent().then((win) => {
            //   return win.id;
            // });
            // if (!windowId) return;
            // browser.sidePanel.open({ windowId: windowId });
            sendMessage(MSG.OPEN_SIDEPANEL, {}, "background");
            const url = browser.runtime.getURL("/sidepanel.html");
            const width = 450;
            const height = window.screen.availHeight;
            const left = window.screen.availWidth - width;
            // window.open(
            //   url,
            //   "LexicoraCapture",
            //   `popup=yes,width=${width},height=${height},left=${left},top=0`,
            // );

            close();
          });
      },
      onRemove: (uiContainer) => {
        //uiContainer.innerHTML = '';
      },
    });

    ui.mount();
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
