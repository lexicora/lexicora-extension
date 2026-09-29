import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    //chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Chrome is already known to web-ext.
    edge: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    //firefox: "C:\\Program Files\\Mozilla Firefox\\firefox.exe", // Firefox might already be known to web-ext.
    firefox: "firefoxdeveloperedition",
  },
});

//* For real usage the file containing this code must be web-ext.config.ts, this file is only an example of how to configure web-ext for Windows.
