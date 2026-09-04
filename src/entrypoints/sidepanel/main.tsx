import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { FEATURES } from "@/constants/features";

// Applied before the first paint so the layout never renders with a gap where
// the top bar would have been. See FEATURES.SIDE_PANEL_TOP_BAR.
if (!FEATURES.SIDE_PANEL_TOP_BAR) {
  document.documentElement.classList.add("lc-no-top-bar");
}
import "@fontsource/wix-madefor-text/400.css";
import "@fontsource/wix-madefor-text/400-italic.css";
import "@fontsource/wix-madefor-text/500.css";
import "@fontsource/wix-madefor-text/500-italic.css";
import "@fontsource/wix-madefor-text/600.css";
import "@fontsource/wix-madefor-text/600-italic.css";
import "@fontsource/wix-madefor-text/700.css";
import "@fontsource/wix-madefor-text/700-italic.css";
import "@fontsource/wix-madefor-text/800.css";
import "@fontsource/wix-madefor-text/800-italic.css";
//import "@fontsource/jetbrains-mono/200.css";
import "@fontsource/jetbrains-mono/300.css";
import "@fontsource/jetbrains-mono/400.css";
import "../../assets/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
