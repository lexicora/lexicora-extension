import "./App.css";
import { useLayoutEffect, useRef } from "react";
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

// Hooks, Providers and Components
import { RouterListener } from "@/hooks/sidepanel/router-listener";
import { useMouseNavigation } from "@/hooks/use-mouse-navigation";
import { AppHostProvider } from "@/providers/app-host";
import { AppMessagingProvider } from "@/providers/app-messaging";
import {
  ScrollObserverProvider,
  useScrollPos,
} from "@/providers/scroll-observer";
import { ThemeProvider } from "@/providers/theme-provider";
import RxDBProvider from "@/providers/rxdb-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

// Pages
import WindowHomePage from "./pages/home/home";
import ErrorPage from "@/pages/error";
import NotFoundPage from "@/pages/not-found";
import NotSupportedPage from "@/pages/not-supported";

// (Content) Library
import LibraryPage from "@/pages/library/library";

// Entries Pages
import EntryCreatePage from "@/pages/library/entries/create/entry-create";
import EntryDetailPage from "@/pages/library/entries/detail/entry-detail";
import EntryEditPage from "@/pages/library/entries/edit/entry-edit";

// Topic Pages
import TopicCreatePage from "@/pages/library/topics/create/topic-create";
import TopicDetailPage from "@/pages/library/topics/detail/topic-detail";
import TopicEditPage from "@/pages/library/topics/edit/topic-edit";
import TopicEntriesPage from "@/pages/library/topics/entries/topic-entries";

// Settings Pages
import SettingsPage from "@/pages/settings/settings";
// Sub-settings pages
import ThemePersonalizationSettingsPage from "@/pages/settings/personalization/theme";
import CaptureSuggestionsSettingsPage from "@/pages/settings/features/capture-suggestions";
import DataSettingsPage from "@/pages/settings/data/data";
import FaqPage from "@/pages/settings/help/faq";
import TipsAndTricksPage from "@/pages/settings/help/tips-and-tricks";
import AboutPage from "@/pages/settings/about/about";
import LicensesPage from "@/pages/settings/about/licenses";
import { cn } from "@/lib/utils";

function SidebarTransitionGuard() {
  const { open } = useSidebar();
  const mountedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    document.documentElement.classList.add("sidebar-transitioning");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      document.documentElement.classList.remove("sidebar-transitioning");
    }, 200);
    return () => clearTimeout(timerRef.current);
  }, [open]);

  return null;
}

function WindowHeader() {
  const { isAtTop } = useScrollPos();

  return (
    <header className="mb-12.25">
      <div
        className={cn(
          "w-full fixed top-0 flex h-12.5 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-lg px-3 z-30 transition-shadow duration-150 shadow-none",
          { "shadow-md/4 dark:shadow-md/26": !isAtTop },
        )}
      >
        <SidebarTrigger size="icon" />
      </div>
    </header>
  );
}

function RootLayout() {
  useMouseNavigation();

  const disableScrollRestoration = location.pathname.startsWith("/library");

  return (
    <AppHostProvider isWindowed>
      <AppMessagingProvider>
        {/* For now not necessary for the windowed host <RouterListener />*/}
        {disableScrollRestoration || <ScrollRestoration />}
        <SidebarProvider>
          <SidebarTransitionGuard />
          <AppSidebar className="select-none z-50" />
          <SidebarInset className="/pr-[calc(var(--lc-scrollbar-offset)+10px)]">
            <ScrollObserverProvider>
              <WindowHeader />
              <Outlet />
            </ScrollObserverProvider>
          </SidebarInset>
        </SidebarProvider>
      </AppMessagingProvider>
    </AppHostProvider>
  );
}

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <WindowHomePage /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "not-supported", element: <NotSupportedPage /> },
      // Entries
      { path: "library", element: <LibraryPage hideTabBar /> },
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
      { path: "settings/data", element: <DataSettingsPage /> },
      { path: "settings/help/faq", element: <FaqPage /> },
      {
        path: "settings/help/tips-and-tricks",
        element: <TipsAndTricksPage />,
      },
      { path: "settings/about", element: <AboutPage /> },
      { path: "settings/about/licenses", element: <LicensesPage /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <RxDBProvider>
        <RouterProvider router={router} />
        <Toaster mobileOffset={13} position="top-right" offset={16} />
      </RxDBProvider>
    </ThemeProvider>
  );
}

export default App;
