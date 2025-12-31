import "./App.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "./pages/home";

// Entries Pages
import EntriesPage from "./pages/entries";
import NewEntryPage from "./pages/entries/new";
import EntryDetailPage from "./pages/entries/[id]";
import EntryEditPage from "./pages/entries/edit/[id]";
import { RouterListener } from "./components/RouterListener";

// Messaging
import { MSG } from "@/types/messaging";
import { onMessage } from "webext-bridge/popup"; //* NOTE: popup is temporary but works for sidepanel as well (maybe not optimal)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lexicora-ui-theme">
      <HashRouter>
        <RouterListener />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/*Entries */}
          <Route path="/entries" element={<EntriesPage />} />
          <Route
            path="/entries/new"
            element={<NewEntryPage />}
            //key={}
          />
          <Route path="/entries/:id" element={<EntryDetailPage />} />
          <Route path="/entries/:id/edit" element={<EntryEditPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
