import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @deprecated Use the `cn` package instead: https://npmx.dev/package/cn / https://www.npmjs.com/package/cn
 *
 * Combines class names into a single string, filtering out falsy values and
 * merging Tailwind classes. This is a wrapper around `clsx` and `tailwind-merge`.
 * @param inputs
 * @returns string of css classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TODO: Replace with the faster cn package: https://npmx.dev/package/cn / https://www.npmjs.com/package/cn
// INFO: It is a drop in replacement for clsx and twMerge. See issue: #198