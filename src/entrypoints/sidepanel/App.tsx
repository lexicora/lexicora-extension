import "./App.css";
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

// Hooks, Providers and Components
import { RouterListener } from "@/hooks/sidepanel/router-listener";
//import { MessageListener } from "@/hooks/sidepanel/message-listener";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";
import { SidePanelMessagingProvider } from "@/providers/sidepanel-messaging";
import { ScrollObserverProvider } from "@/providers/scroll-observer";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/top-bar";
import { BottomNavigation } from "@/components/bottom-navigation";

// Pages
import HomePage from "./pages/home";
import ErrorPage from "./pages/error";
import NotFoundPage from "./pages/not-found";
import NotSupportedPage from "./pages/not-supported";

// Entries Pages
import EntriesPage from "./pages/entries";
import EntryCreatePage from "./pages/entries/new";
import EntryDetailPage from "./pages/entries/[id]";
import EntryEditPage from "./pages/entries/edit/[id]";

// Settings Pages
import SettingsPage from "./pages/settings";
// Sub-settings pages
import ThemePersonalizationSettingsPage from "./pages/settings/personalization/theme";
import CaptureSuggestionsSettingsPage from "./pages/settings/features/capture-suggestions";
// import NotificationsSettingsPage from "./pages/settings/notifications";

function RootLayout() {
  useMouseNavigation();

  return (
    <SidePanelMessagingProvider>
      <RouterListener />
      <ScrollRestoration />
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
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "not-supported", element: <NotSupportedPage /> },
      // Add fallback page for error display
      // Entries
      { path: "entries", element: <EntriesPage /> },
      { path: "entries/new", element: <EntryCreatePage /> },
      { path: "entries/:id", element: <EntryDetailPage /> },
      { path: "entries/:id/edit", element: <EntryEditPage /> },
      // Settings
      { path: "settings", element: <SettingsPage /> },
      {
        path: "settings/personalization/theme",
        element: <ThemePersonalizationSettingsPage />,
      },
      {
        path: "settings/capture-suggestions",
        element: <CaptureSuggestionsSettingsPage />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
