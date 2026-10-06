import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/wix-madefor-text/wght.css";
import "@fontsource-variable/wix-madefor-text/wght-italic.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "../../assets/styles/globals.css";
import App from "./App.tsx";
import { WindowUnavailable } from "./window-unavailable";
import { FEATURES } from "@/constants/features";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, not for shortcut keys.
installInputModality();

// The dev server keeps the app reachable so work on it can continue.
const enabled = FEATURES.WINDOWED_APP || import.meta.env.DEV;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {enabled ? <App /> : <WindowUnavailable />}
  </React.StrictMode>,
);
