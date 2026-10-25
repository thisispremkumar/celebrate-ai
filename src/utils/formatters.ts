import type { CurrencySymbol } from '../types/event';

/**
 * Formats a numerical currency value with the provided symbol and locale thousands grouping.
 * @param amount - Numerical amount to format.
 * @param currency - Target currency symbol (defaults to '$').
 * @returns Formatted currency string, e.g. "$38,000".
 */
export function formatCurrency(amount: number, currency: CurrencySymbol = '$'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${currency}${Math.round(safe).toLocaleString()}`;
}

/**
 * Calculates deterministic human-readable days remaining until a target date.
 * Accepts an optional reference date to guarantee purity and test determinism.
 * @param targetDateStr - ISO date string (YYYY-MM-DD).
 * @param referenceDate - Reference baseline date (defaults to current date).
 * @returns Humanized countdown or completion string.
 */
export function formatDaysRemaining(
  targetDateStr: string,
  referenceDate: Date = new Date()
): string {
  if (!targetDateStr) return 'Date TBD';

  try {
    const target = new Date(targetDateStr);
    if (isNaN(target.getTime())) return targetDateStr;

    const base = new Date(referenceDate);
    target.setHours(0, 0, 0, 0);
    base.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - base.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '🎉 Today is the big day!';
    if (diffDays === 1) return '⏳ 1 day away!';
    if (diffDays > 1) return `⏳ In ${diffDays} days`;
    return `Completed on ${targetDateStr}`;
  } catch {
    return targetDateStr;
  }
}

/**
 * Computes a percentage safely guarded against zero or negative denominators.
 * @param numerator - Partial value.
 * @param denominator - Total value baseline.
 * @returns Non-negative percentage integer (0-100+).
 */
export function calculatePercentage(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Normalizes user queries for case-insensitive and whitespace-resilient comparisons.
 * @param value - Search string or keyword.
 * @returns Normalized lowercase string.
 */
export function normalizeSearchTerm(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase();
}
