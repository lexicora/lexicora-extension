import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    //chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Chrome is already known to web-ext.
    edge: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    firefox: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
  },
});
