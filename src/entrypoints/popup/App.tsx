import "./App.css";
import ErrorPage from "./pages/error";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollObserverProvider } from "@/providers/scroll-observer";

// Pages
import HomePage from "./pages/home";

function RootLayout() {
  return (
    <ScrollObserverProvider>
      <Outlet />
    </ScrollObserverProvider>
  );
}

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      //MAYBE: Add (if not logged in pages here)
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
