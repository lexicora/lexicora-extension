import "./App.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollObserverProvider } from "@/providers/scroll-observer";
import HomePage from ".";

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
