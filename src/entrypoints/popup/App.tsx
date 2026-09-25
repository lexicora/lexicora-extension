import "./App.css";
import { ThemeProvider } from "@/providers/theme-provider";
//* ScrollObserverProvider is not needed when FEATURES.AI is set to false and therefore compact layout is used.
//* Reenable if FEATURES.AI is set to true and therefore the ai layout is used which requires the scroll observer.
//import { ScrollObserverProvider } from "@/providers/scroll-observer";
import Popup from ".";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/*<ScrollObserverProvider>*/}
      <Popup />
      {/*</ScrollObserverProvider>*/}
    </ThemeProvider>
  );
}

export default App;
