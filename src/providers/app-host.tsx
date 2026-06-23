import { createContext, useContext } from "react";

interface AppHostContextValue {
  isWindowed: boolean;
}

const AppHostContext = createContext<AppHostContextValue>({ isWindowed: false });

export function AppHostProvider({
  isWindowed,
  children,
}: {
  isWindowed: boolean;
  children: React.ReactNode;
}) {
  return (
    <AppHostContext.Provider value={{ isWindowed }}>
      {children}
    </AppHostContext.Provider>
  );
}

export function useAppHost(): AppHostContextValue {
  return useContext(AppHostContext);
}
