import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TODO: Replace with the faster cn package: https://npmx.dev/package/cn / https://www.npmjs.com/package/cn
// INFO: It is a drop in replacement for clsx and twMerge. See issue: #198