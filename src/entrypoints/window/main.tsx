import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/wix-madefor-text/wght.css";
import "@fontsource-variable/wix-madefor-text/wght-italic.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "../../assets/styles/globals.css";
import App from "./App.tsx";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, not for shortcut keys.
installInputModality();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
