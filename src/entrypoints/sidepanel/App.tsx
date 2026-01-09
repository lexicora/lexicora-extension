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
import { SidePanelMessagingProvider } from "./components/SidePanelMessagingProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lexicora-ui-theme">
      <HashRouter>
        <SidePanelMessagingProvider>
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
        </SidePanelMessagingProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
