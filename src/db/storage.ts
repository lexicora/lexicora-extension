import type { RxStorage } from "rxdb";
import { wrappedKeyCompressionStorage } from "rxdb/plugins/key-compression";

/**
 * Wraps a storage so documents are written with shortened property keys.
 *
 * Every document repeats its field names on disk — `hostnameUrl`,
 * `archivedExplicitly`, `searchBlob` — which for small documents like blocks is
 * a large share of what is stored. Compression trades a little CPU on read and
 * write for less to store and less to read back.
 *
 * It only affects storage: queries, sorting and indexes are written against the
 * real field names, and documents come back out uncompressed. The schemas opt
 * in with `keyCompression: true`; both halves are needed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withKeyCompression<T extends RxStorage<any, any>>(storage: T) {
  return wrappedKeyCompressionStorage({ storage });
}
