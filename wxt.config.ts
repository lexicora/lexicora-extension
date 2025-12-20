import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      name: "Lexicora Extension",
      description:
        "A browser extension for the Lexicora platform and services.",
      version: "0.1.0",
      permissions: [
        "storage",
        "tabs",
        "activeTab",
        "scripting",
        "contextMenus",
        "clipboardRead",
        "alarms",
        "notifications",
        "sidePanel",
      ],
      host_permissions: ["<all_urls>"],
    };
  },
});
