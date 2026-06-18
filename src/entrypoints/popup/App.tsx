import "./App.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollObserverProvider } from "@/providers/scroll-observer";

// Pages
import HomePage from "./pages/home/home";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ScrollObserverProvider>
        <HomePage />
      </ScrollObserverProvider>
    </ThemeProvider>
  );
}

export default App;
