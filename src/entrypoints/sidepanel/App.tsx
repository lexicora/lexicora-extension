import "./App.css";
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

// Hooks, Providers and Components
import { RouterListener } from "./hooks/router-listener";
import { SidePanelMessagingProvider } from "./providers/messaging";
import { ScrollObserverProvider } from "./providers/scroll-observer";
import { ThemeProvider } from "@/components/theme-provider";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";
import { TopBar } from "./components/ui/top-bar";
import { BottomNavigation } from "./components/ui/bottom-navigation";

// Pages
import HomePage from "./pages/home";
import NotFoundPage from "./pages/not-found";

// Entries Pages
import EntriesPage from "./pages/entries";
import NewEntryPage from "./pages/entries/new";
import EntryDetailPage from "./pages/entries/[id]";
import EntryEditPage from "./pages/entries/edit/[id]";

// Settings Pages
import SettingsPage from "./pages/settings";
// Sub-settings pages
// import ThemePersonalizationSettingsPage from "./pages/settings/personalization/theme";
// import NotificationsSettingsPage from "./pages/settings/notifications";

function RootLayout() {
  useMouseNavigation();

  return (
    <SidePanelMessagingProvider>
      <RouterListener />
      <ScrollRestoration style={{ scrollBehavior: "auto" }} />
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
      { path: "*", element: <NotFoundPage /> },
      // Add fallback page for error display
      // Entries
      { path: "entries", element: <EntriesPage /> },
      { path: "entries/new", element: <NewEntryPage /> },
      { path: "entries/:id", element: <EntryDetailPage /> },
      { path: "entries/:id/edit", element: <EntryEditPage /> },
      // Settings
      { path: "settings", element: <SettingsPage /> },
      // {
      //   path: "settings/personalization/theme",
      //   element: <ThemePersonalizationSettingsPage />,
      // },
      // {
      //   path: "settings/notifications",
      //   element: <NotificationsSettingsPage />,
      // },
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
