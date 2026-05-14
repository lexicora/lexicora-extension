import { defineConfig, UserManifest } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  // vite: () => ({
  //   plugins: [
  //     {
  //       name: "remove-zod-eval",
  //       transform(code: string, id: string) {
  //         if (id.includes("zod")) {
  //           return code.replace(
  //             /new Function\(""\)/g,
  //             '(() => { throw new Error("eval not allowed") })()',
  //           );
  //         }
  //       },
  //     },
  //   ],
  //   resolve: {
  //     dedupe: ["react", "react-dom"],
  //   },
  // }),
  //vite
  manifest: ({ browser, manifestVersion, mode, command }) => {
    const manifestBase: UserManifest = {
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
      //host_permissions: ["<all_urls>"], //* NOTE: Not needed, activeTab should be enough
    };

    let userManifest: UserManifest = manifestBase;

    // Firefox-specific settings
    if (browser === "firefox") {
      userManifest = {
        ...manifestBase,
        browser_specific_settings: {
          gecko: {
            id: "{d7fed14a-3919-4383-892e-dcc1a7b53988}",
          },
        },
      };
    }

    return userManifest;
  },
});
