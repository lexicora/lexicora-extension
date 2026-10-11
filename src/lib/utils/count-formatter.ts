const UNITS = [
  { value: 1_000_000, suffix: "M" },
  { value: 1_000, suffix: "k" },
] as const;

/**
 * A list count short enough for a small label: exact below a thousand, then
 * "1.2k+", "12k+", "1.5M+".
 *
 * Rounded down, never up, so the label never claims more items than there
 * are; the "+" says some were left off. One decimal below ten of a unit, none
 * above, where a decimal no longer tells you anything. The full number belongs
 * in a title next to it.
 */
export function formatCount(count: number): string {
  for (const { value, suffix } of UNITS) {
    if (count < value) continue;
    const step = count < value * 10 ? value / 10 : value;
    const shown = Math.floor(count / step) * step;
    const label = String(shown / value).replace(".", localeDecimal());
    return `${label}${suffix}${shown < count ? "+" : ""}`;
  }
  return String(count);
}

/** The full count, grouped the way the user's locale writes it ("12,345"). */
export function formatCountExact(count: number): string {
  return count.toLocaleString(navigatorLanguage());
}

function navigatorLanguage(): string | undefined {
  return typeof navigator === "undefined" ? undefined : navigator.language;
}

function localeDecimal(): string {
  return (
    new Intl.NumberFormat(navigatorLanguage())
      .formatToParts(1.5)
      .find((part) => part.type === "decimal")?.value ?? "."
  );
}

const BYTE_UNITS = [
  { value: 1e9, unit: "gigabyte" },
  { value: 1e6, unit: "megabyte" },
] as const;

/**
 * A byte count as the user's locale writes it: "0.5 kB", "840 kB", "12.4 MB".
 * Decimal units, as macOS and the browsers' own storage pages count. Never in
 * bytes, which Intl only spells out ("512 byte"); one decimal while the number
 * is small enough for it to mean something.
 */
export function formatBytes(bytes: number): string {
  const { value, unit } = BYTE_UNITS.find((u) => bytes >= u.value) ?? {
    value: 1e3,
    unit: "kilobyte",
  };
  const amount = bytes / value;
  return new Intl.NumberFormat(navigatorLanguage(), {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: amount < 100 ? 1 : 0,
  }).format(amount);
}
