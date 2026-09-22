import { ThemeProvider } from "@/providers/theme-provider";
import OnboardingPage from "./onboarding-page";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <OnboardingPage />
    </ThemeProvider>
  );
}

export default App;
