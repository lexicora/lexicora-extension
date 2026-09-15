/**
 * Whether documents are stored with shortened property keys.
 *
 * Off in development so the rows in DevTools → IndexedDB stay readable:
 * compressed, `hostnameUrl` is stored as something like `|b`, which makes
 * inspecting the database by hand near useless. Production builds get the
 * smaller rows.
 *
 * It is part of the schema, so switching it changes the schema's hash: a
 * database written by a dev build cannot be opened by a production build, or
 * the other way round, without deleting it first. That is fine while nothing
 * is released — see `db/collections` for what a released version would need.
 *
 * Set this to `true` to check the compressed behaviour while developing.
 */
export const KEY_COMPRESSION_ENABLED = !import.meta.env.DEV;
