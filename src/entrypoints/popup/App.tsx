import "./App.css";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import HomePage from "./pages/home";

function RootLayout() {
  return (
    <>
      <div
        id="start-of-content-sentinel"
        aria-hidden="true"
        style={{ position: "absolute", top: 0, height: "1px", width: "100%" }}
      ></div>
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
