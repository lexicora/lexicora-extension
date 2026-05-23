// Format the date using the modern Temporal API (with a standard Date fallback).
// We use `updatedAt` because library items are typically sorted and searched by recent activity.

export function formatDate(date: string): string {
  try {
    // @ts-ignore - TS might not have Temporal types inherently available yet.
    const instant = Temporal.Instant.from(date);
    return instant.toLocaleString(navigator.language, {
      dateStyle: "medium", // 'medium' is usually nicely balanced (e.g. Oct 18, 2026)
      timeStyle: "short",
      // Potentially make configurable via options parameter in the future, if needed.
    });
  } catch (e) {
    // Safe fallback if Temporal throws/isn't supported
    return new Date(date).toLocaleString(navigator.language, {
      dateStyle: "medium",
      timeStyle: "short",
      // Potentially make configurable via options parameter in the future, if needed.
    });
  }
}
