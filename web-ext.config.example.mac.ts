import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    //chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Chrome is already known to web-ext.
    edge: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    firefox: "/Applications/Firefox.app/Contents/MacOS/firefox",
  },
});
