import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { FEATURES } from "@/constants/features";

// Applied before the first paint so the layout never renders with a gap where
// the top bar would have been. See FEATURES.SIDE_PANEL_TOP_BAR.
if (!FEATURES.SIDE_PANEL_TOP_BAR) {
  document.documentElement.classList.add("lc-no-top-bar");
}
import "@fontsource-variable/wix-madefor-text/wght.css";
import "@fontsource-variable/wix-madefor-text/wght-italic.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "../../assets/styles/globals.css";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, not for shortcut keys.
installInputModality();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
