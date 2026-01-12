import "./App.css";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import HomePage from "./pages/home";

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      //MAYBE: Add (if not logged in pages here)
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
