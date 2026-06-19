import "./App.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollObserverProvider } from "@/providers/scroll-observer";
import Popup from ".";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ScrollObserverProvider>
        <Popup />
      </ScrollObserverProvider>
    </ThemeProvider>
  );
}

export default App;
