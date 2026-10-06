import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/wix-madefor-text/wght.css";
import "../../assets/styles/globals.css";
import "./onboarding.css";
import { installInputModality } from "@/lib/input-modality";

// Focus rings for keyboard navigation only, as in the other pages.
installInputModality();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
