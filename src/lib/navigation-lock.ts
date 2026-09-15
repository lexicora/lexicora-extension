/**
 * Blocks navigation while something must not be interrupted — saving, or a
 * long export.
 *
 * Observable, so the UI can show it: the bottom navigation dims and stops
 * responding while locked, rather than looking available and doing nothing.
 */
let locked = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (locked === value) return;
  locked = value;
  for (const listener of listeners) listener();
}

export const navLock = {
  lock: () => set(true),
  unlock: () => set(false),
  isLocked: () => locked,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
