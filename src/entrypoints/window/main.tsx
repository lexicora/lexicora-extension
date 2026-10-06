import React from "react";
import ReactDOM from "react-dom/client";
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
import App from "./App.tsx";
import { WindowUnavailable } from "./window-unavailable";
import { FEATURES } from "@/constants/features";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, not for shortcut keys.
installInputModality();

// The dev server keeps the app reachable so work on it can continue.
const enabled = FEATURES.WINDOWED_APP || import.meta.env.PROD;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {enabled ? <App /> : <WindowUnavailable />}
  </React.StrictMode>,
);
