import "./App.css";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";

// Pages
import HomePage from "./pages/home";

// Entries Pages
import EntriesPage from "./pages/entries";
import NewEntryPage from "./pages/entries/new";
import EntryDetailPage from "./pages/entries/[id]";
import EntryEditPage from "./pages/entries/edit/[id]";
import { RouterListener } from "./components/RouterListener";
import { SidePanelMessagingProvider } from "./components/SidePanelMessagingProvider";

function RootLayout() {
  useMouseNavigation();

  return (
    <SidePanelMessagingProvider>
      {/*TODO: Add top bar */}
      <RouterListener />
      <Outlet />
      {/*TODO: Add bottom bar */}
    </SidePanelMessagingProvider>
  );
}

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      //{ path: "settings", element: <SettingsPage /> },
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
