// Shared message type constants and TS types (Sample code for later)
export const MSG = {
  PING: 'common/PING',
  FROM_CONTENT: 'content/FROM_CONTENT',
  FROM_BACKGROUND: 'background/FROM_BACKGROUND',
  SEND_TO_CONTENT: 'background/SEND_TO_CONTENT',
} as const;

export type Message =
  | { type: typeof MSG.PING }
  | { type: typeof MSG.FROM_CONTENT; payload: { url: string } }
  | { type: typeof MSG.SEND_TO_CONTENT; payload: any }
  | { type: typeof MSG.FROM_BACKGROUND; payload?: any };

// Helper typed send (optional)
export type MaybePromise<T> = T | Promise<T>;
