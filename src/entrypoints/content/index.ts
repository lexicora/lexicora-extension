import { setupMessagingHandlers } from "./message-handler";
import { setupCaptureSuggestion } from "./capture/suggestion";

export default defineContentScript({
  //matches: ['*://*.google.com/*'],
  // The pages a capture can actually read. <all_urls> would also cover
  // schemes nothing here can parse, and a narrower list is one less thing for
  // a store reviewer to weigh.
  matches: ["http://*/*", "https://*/*", "file:///*"],
  excludeMatches: import.meta.env.FIREFOX
    ? ["about:*", "https://addons.mozilla.org/*"]
    : [
        "https://chromewebstore.google.com/*",
        "https://microsoftedge.microsoft.com/*",
      ], // Add more browser-specific excluded URLs if needed (like extensions own pages)
  main(ctx) {
    //console.log("Hello content.");

    // Messaging handlers
    setupMessagingHandlers();

    //* NOTE (feature parity discrepancy): Not supported on Firefox due to quicker loss of the direct user context action.
    //* NOTE: The messaging in Firefox does not support opening the sidebar from here due to context loss.
    if (!import.meta.env.FIREFOX) {
      setupCaptureSuggestion(ctx);
    }
  },
});
