// Monkey patch console.warn to filter out specific RxDB Dexie premium advertisement warnings
export const filterConsole = () => {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    // Quickly filter out the specific RxDB Dexie premium advertisement warning
    if (
      typeof args[0] === "string" &&
      args[0].includes("-------------- RxDB Open Core RxStorage")
    ) {
      return;
    }

    // Pass all other warnings through normally
    originalWarn(...args);
  };
};
