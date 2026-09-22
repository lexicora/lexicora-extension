import { useEffect, useState } from "react";

/**
 * The keys the browser actually bound, by command name. A command that is
 * missing or has an empty string arrived unset — see `suggestedKeyFor`.
 * `null` until the browser has answered.
 */
export function useCommandKeys(): Record<string, string> | null {
  const [keys, setKeys] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    // Re-read on focus: the user may have just set one in the browser.
    const load = () =>
      browser.commands
        .getAll()
        .then((all) =>
          setKeys(
            Object.fromEntries(
              all.map((command) => [
                command.name ?? "",
                command.shortcut ?? "",
              ]),
            ),
          ),
        )
        .catch(() => setKeys({}));
    void load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  return keys;
}
