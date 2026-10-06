import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/wix-madefor-text/wght.css";
import "../../assets/styles/globals.css";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, not for shortcut keys.
installInputModality(); //* Maybe not necessary for the popup.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
