import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDaysRemaining,
  calculatePercentage,
  normalizeSearchTerm,
} from '../utils/formatters';

describe('Pure Formatting Utilities Suite', () => {
  describe('formatCurrency', () => {
    it('formats positive and zero amounts with appropriate currency symbol', () => {
      expect(formatCurrency(35000, '$')).toBe('$35,000');
      expect(formatCurrency(1250, '€')).toBe('€1,250');
      expect(formatCurrency(0, '£')).toBe('£0');
    });

    it('safely handles non-finite values without throwing', () => {
      expect(formatCurrency(NaN, '$')).toBe('$0');
      expect(formatCurrency(Infinity, '$')).toBe('$0');
    });
  });

  describe('formatDaysRemaining', () => {
    const fixedBase = new Date('2026-06-01T00:00:00Z');

    it('calculates future countdown in days', () => {
      expect(formatDaysRemaining('2026-06-15', fixedBase)).toBe('⏳ In 14 days');
    });

    it('identifies the big day', () => {
      expect(formatDaysRemaining('2026-06-01', fixedBase)).toBe('🎉 Today is the big day!');
    });

    it('identifies 1 day away', () => {
      expect(formatDaysRemaining('2026-06-02', fixedBase)).toBe('⏳ 1 day away!');
    });

    it('safely falls back for missing or invalid dates', () => {
      expect(formatDaysRemaining('')).toBe('Date TBD');
      expect(formatDaysRemaining('invalid-date')).toBe('invalid-date');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates correct percentages and rounds cleanly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(125, 100)).toBe(125);
    });

    it('protects against division by zero and negative denominators', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(50, -100)).toBe(0);
    });
  });

  describe('normalizeSearchTerm', () => {
    it('trims leading/trailing whitespace and converts to lower case', () => {
      expect(normalizeSearchTerm('  Floral Decor  ')).toBe('floral decor');
      expect(normalizeSearchTerm(null)).toBe('');
      expect(normalizeSearchTerm(undefined)).toBe('');
    });
  });
});
