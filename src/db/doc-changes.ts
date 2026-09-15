/**
 * The fields of a patch that would actually change the stored document.
 *
 * Saving a form patches every field it manages, whether or not the user
 * touched any of them — a write, a new revision, and later a change to
 * replicate, for nothing. Worse, the patch carries a fresh `updatedAt`, so
 * opening an entry and saving it unchanged moved it to the top of the library.
 *
 * Arrays and objects are compared by value, since form fields like `tags` are
 * rebuilt on every render and are never the same reference.
 */
export function changedFields<T extends object>(
  current: T,
  patch: Partial<T>,
): Partial<T> {
  const changes: Partial<T> = {};

  for (const [key, value] of Object.entries(patch) as [keyof T, T[keyof T]][]) {
    const before = current[key];
    const same =
      typeof value === "object" && value !== null
        ? JSON.stringify(before) === JSON.stringify(value)
        : before === value;
    if (!same) changes[key] = value;
  }

  return changes;
}

/** Whether a patch would change anything at all. */
export function hasChanges<T extends object>(
  current: T,
  patch: Partial<T>,
): boolean {
  return Object.keys(changedFields(current, patch)).length > 0;
}
