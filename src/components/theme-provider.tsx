import { createContext, useContext, useEffect, useState } from "react";
import { themeStorage, type Theme } from "@/lib/utils/storage/settings";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark"; // Optional: resolved theme based on system preference
  isLoading: boolean; // Add loading state to handle async delay
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);

  const applyThemeToDocument = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
      setResolvedTheme(isDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  };

  // Initial Load & Syncing (maybe use layout effect to avoid flicker?)
  useEffect(() => {
    async function initTheme() {
      // Get the value from async storage
      const savedTheme = await themeStorage.getValue();
      setTheme(savedTheme);
      setIsLoading(false);

      // Watch for changes from other parts of the extension
      return themeStorage.watch((newTheme: Theme) => {
        if (newTheme) setTheme(newTheme);
      });
    }

    const unwatchPromise = initTheme();
    return () => {
      unwatchPromise.then((unwatch) => unwatch?.());
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme !== "system") return;
      applyThemeToDocument(theme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  // Class Logic (Your existing logic is fine, just ensure it runs after loading)
  useEffect(() => {
    if (!isLoading) applyThemeToDocument(theme);
  }, [theme, isLoading]);

  const value = {
    theme,
    resolvedTheme,
    isLoading,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme); // Optimistic UI update
      themeStorage.setValue(newTheme); // Async save to browser storage
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {/* Optionally hide children or show a loader to prevent theme flickering on load */}
      {!isLoading && children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
