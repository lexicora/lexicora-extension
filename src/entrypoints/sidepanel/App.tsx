import "./App.css";
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";

// Hooks, Providers and Components
import { RouterListener } from "@/hooks/sidepanel/router-listener";
//import { MessageListener } from "@/hooks/sidepanel/message-listener";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";
import { useSidePanelConnection } from "@/hooks/sidepanel/use-sidepanel-connection";
import { SidePanelMessagingProvider } from "@/providers/sidepanel-messaging";
import { ScrollObserverProvider } from "@/providers/scroll-observer";
import { ThemeProvider } from "@/providers/theme-provider";
import RxDBProvider from "@/providers/rxdb-provider";
import { TopBar } from "@/components/top-bar";
import { BottomNavigation } from "@/components/bottom-navigation";

// Pages
import HomePage from "./pages/home/home";
import ErrorPage from "./pages/error";
import NotFoundPage from "./pages/not-found";
import NotSupportedPage from "./pages/not-supported";

// (Content) Library
import LibraryPage from "./pages/library/library";

// Entries Pages
import EntryCreatePage from "./pages/library/entries/create/entry-create";
import EntryDetailPage from "./pages/library/entries/detail/entry-detail";
import EntryEditPage from "./pages/library/entries/edit/entry-edit";

// Topic Pages
//* INFO: TopicsPage not necessary right now
import TopicCreatePage from "./pages/library/topics/create/topic-create";
import TopicDetailPage from "./pages/library/topics/detail/topic-detail";
import TopicEditPage from "./pages/library/topics/edit/topic-edit";
import TopicEntriesPage from "./pages/library/topics/entries/topic-entries";

// Settings Pages
import SettingsPage from "./pages/settings/settings";
// Sub-settings pages
import ThemePersonalizationSettingsPage from "./pages/settings/personalization/theme";
import CaptureSuggestionsSettingsPage from "./pages/settings/features/capture-suggestions";
// import NotificationsSettingsPage from "./pages/settings/notifications";

function RootLayout() {
  useMouseNavigation();
  const location = useLocation();
  //* NOTE: Feature parity discrepancy: Firefox does not support stuff related to the unsupported capture suggestions feature.
  // Also Firefox natively handles state of the side-panel already being open or closed.
  if (!import.meta.env.FIREFOX) {
    useSidePanelConnection();
  }

  // Disable React Router scroll restoration only on pages with virtualized lists,
  // which manage their own scroll via Virtuoso + sessionStorage.
  // const disableScrollRestoration =
  //   location.pathname === "/library" ||
  //   /^\/library\/topics\/[^/]+\/entries$/.test(location.pathname); //* NOTE: Doesn't seem to work.

  const disableScrollRestoration = location.pathname.startsWith("/library");

  return (
    <SidePanelMessagingProvider>
      <RouterListener />
      {disableScrollRestoration || <ScrollRestoration />}
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
      { path: "library", element: <LibraryPage /> },
      { path: "library/entries/new", element: <EntryCreatePage /> },
      { path: "library/entries/:id", element: <EntryDetailPage /> },
      { path: "library/entries/:id/edit", element: <EntryEditPage /> },
      // Topics
      { path: "library/topics/new", element: <TopicCreatePage /> },
      { path: "library/topics/:id", element: <TopicDetailPage /> },
      { path: "library/topics/:id/entries", element: <TopicEntriesPage /> },
      { path: "library/topics/:id/edit", element: <TopicEditPage /> },
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
      <RxDBProvider>
        <RouterProvider router={router} />
      </RxDBProvider>
    </ThemeProvider>
  );
}

export default App;
