// Runs in each page's <head>, before the first frame: sets the theme class
// and the matching background, so a page never opens in the wrong colours.
//
// The theme itself lives in extension storage (sync:settings-ui-theme), which
// can only be read asynchronously, so it always arrives after the first paint.
// The theme provider keeps a copy in localStorage for this script, which is
// read synchronously and shared by every extension page. Without a copy, as
// on a fresh install, the system preference decides, as the "system" theme
// does. The provider still applies the stored theme once it has loaded.
//
// A file rather than inline code: extension pages forbid inline scripts.
// Plain JavaScript, not a module, so the browser runs it before rendering.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem("lc-theme");
  } catch (e) {
    // Storage blocked: fall back to the system preference.
  }
  var isDark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  root.classList.add(isDark ? "dark" : "light");

  // The background before the stylesheet applies — in development it arrives
  // through JavaScript. Keyed on the class, so it follows the provider's
  // changes afterwards. Keep in step with --background in globals.css.
  var style = document.createElement("style");
  style.textContent =
    "html.light{background-color:oklch(0.955 0.004 264.5)}" +
    "html.dark{background-color:oklch(0.13 0.028 261.692)}";
  document.head.appendChild(style);
})();
