let locked = false;

export const navLock = {
  lock: () => { locked = true; },
  unlock: () => { locked = false; },
  isLocked: () => locked,
};
