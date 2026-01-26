import "./App.css";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";

// Pages
import HomePage from "./pages/home";
import SettingsPage from "./pages/settings";

// Entries Pages
import EntriesPage from "./pages/entries";
import NewEntryPage from "./pages/entries/new";
import EntryDetailPage from "./pages/entries/[id]";
import EntryEditPage from "./pages/entries/edit/[id]";
import { RouterListener } from "./hooks/router-listener";
import { SidePanelMessagingProvider } from "./providers/messaging";
import { ScrollObserverProvider } from "./providers/scroll-observer";
import { TopBar } from "./components/ui/top-bar";
import { BottomNavigation } from "./components/ui/bottom-navigation";

function RootLayout() {
  useMouseNavigation();

  return (
    <SidePanelMessagingProvider>
      <RouterListener />
      <ScrollObserverProvider>
        <TopBar />
        <Outlet />
        <BottomNavigation />
      </ScrollObserverProvider>
    </SidePanelMessagingProvider>
  );
}

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "settings", element: <SettingsPage /> },
      // Entries
      { path: "entries", element: <EntriesPage /> },
      { path: "entries/new", element: <NewEntryPage /> },
      { path: "entries/:id", element: <EntryDetailPage /> },
      { path: "entries/:id/edit", element: <EntryEditPage /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lexicora-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
