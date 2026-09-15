import { useSyncExternalStore } from "react";

import { navLock } from "@/lib/navigation-lock";

/** Re-renders while navigation is locked, so controls can disable themselves. */
export function useNavLock(): boolean {
  return useSyncExternalStore(
    navLock.subscribe,
    navLock.isLocked,
    navLock.isLocked,
  );
}
