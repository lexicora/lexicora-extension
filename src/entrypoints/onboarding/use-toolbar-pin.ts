import { useEffect, useState } from "react";

type UserSettings = { isOnToolbar?: boolean };
type ActionWithSettings = {
  getUserSettings?: () => Promise<UserSettings>;
  onUserSettingsChanged?: {
    addListener: (listener: (settings: UserSettings) => void) => void;
    removeListener: (listener: (settings: UserSettings) => void) => void;
  };
};

/**
 * Whether Lexicora's button is pinned to the toolbar, or `null` when the
 * browser cannot say.
 *
 * No browser lets an extension pin itself; they only let it ask. Chromium
 * answers through `action`, Firefox from version 118 through `browserAction`.
 */
export function useToolbarPin(): boolean | null {
  const [isPinned, setIsPinned] = useState<boolean | null>(null);

  useEffect(() => {
    const api = browser as unknown as {
      action?: ActionWithSettings;
      browserAction?: ActionWithSettings;
    };
    const action = api.action ?? api.browserAction;
    if (!action?.getUserSettings) return;

    const read = () =>
      action
        .getUserSettings?.()
        .then((settings) => setIsPinned(settings.isOnToolbar ?? null))
        .catch(() => setIsPinned(null));
    const onChange = (settings: UserSettings) =>
      setIsPinned(settings.isOnToolbar ?? null);

    void read();
    // Live from Chrome 130; re-reading on focus covers older versions and
    // Firefox, where the pin is changed in a menu outside the page.
    action.onUserSettingsChanged?.addListener(onChange);
    window.addEventListener("focus", read);
    return () => {
      action.onUserSettingsChanged?.removeListener(onChange);
      window.removeEventListener("focus", read);
    };
  }, []);

  return isPinned;
}
