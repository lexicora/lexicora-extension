import "./App.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "./pages/home";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lexicora-ui-theme">
      <HashRouter>
        {/*<RouterListener />*/}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/*MAYBE: Add (if not logged in pages here) */}
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
