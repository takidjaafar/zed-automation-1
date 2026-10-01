/**
 * Display formatting helpers for the commission-audit module.
 *
 * House rules (see module spec):
 *  - money      -> "$1,234.56" (always 2 decimals)
 *  - percentages-> "6.0%"      (always 1 decimal)
 */

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plainNumberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `$1,234.56` — safe against null/undefined/NaN. */
export function formatMoney(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return moneyFormatter.format(0);
  // Avoid "-$0.00" noise for tiny negative rounding artefacts.
  const safe = Math.abs(n) < 0.005 ? 0 : n;
  return moneyFormatter.format(safe);
}

/** `1234.56` — grouped, 2 decimals, no currency symbol. */
export function formatNumber(value: number | null | undefined): string {
  const n = Number(value);
  return plainNumberFormatter.format(Number.isFinite(n) ? n : 0);
}

/** `6.0%` — always one decimal place. */
export function formatPercent(value: number | null | undefined): string {
  const n = Number(value);
  return `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
}

/** `+$1,200.00` / `-$1,200.00` / `$0.00` — for discrepancies. */
export function formatSignedMoney(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) < 0.005) return formatMoney(0);
  return `${n > 0 ? '+' : '-'}${formatMoney(Math.abs(n))}`;
}

/** `2.4 MB` — used by the file uploader and the data-health panel. */
export function formatBytes(bytes: number | null | undefined): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
