import { describe, it, expect } from 'vitest';
import { toDecimal, fromDecimal, formatCurrency, isBalanced, getImbalance } from '@/utils/money';

describe('money utilities', () => {
  describe('toDecimal', () => {
    it('converts fraction to decimal', () => {
      expect(toDecimal(5000, 100)).toBe(50);
      expect(toDecimal(1050, 100)).toBe(10.5);
      expect(toDecimal(0, 100)).toBe(0);
      expect(toDecimal(-2500, 100)).toBe(-25);
    });

    it('handles zero denominator', () => {
      expect(toDecimal(100, 0)).toBe(0);
    });
  });

  describe('fromDecimal', () => {
    it('converts decimal string to fraction', () => {
      const result = fromDecimal('50.00');
      expect(result.amount_num).toBe(5000);
      expect(result.amount_denom).toBe(100);
    });

    it('converts number to fraction', () => {
      const result = fromDecimal(10.5);
      expect(result.amount_num).toBe(1050);
      expect(result.amount_denom).toBe(100);
    });

    it('handles NaN', () => {
      const result = fromDecimal('abc');
      expect(result.amount_num).toBe(0);
      expect(result.amount_denom).toBe(100);
    });

    it('handles zero', () => {
      const result = fromDecimal(0);
      expect(result.amount_num).toBe(0);
      expect(result.amount_denom).toBe(100);
    });

    it('rounds to nearest cent', () => {
      const result = fromDecimal('10.555');
      expect(result.amount_num).toBe(1056);
    });
  });

  describe('formatCurrency', () => {
    it('formats with currency code', () => {
      const result = formatCurrency(5000, 100, 'USD', 'en-US');
      expect(result).toContain('50.00');
    });

    it('formats zero', () => {
      const result = formatCurrency(0, 100, 'USD', 'en-US');
      expect(result).toContain('0.00');
    });
  });

  describe('isBalanced', () => {
    it('returns true when balanced', () => {
      expect(isBalanced([
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ])).toBe(true);
    });

    it('returns false when unbalanced', () => {
      expect(isBalanced([
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ])).toBe(false);
    });
  });

  describe('getImbalance', () => {
    it('returns 0 for balanced', () => {
      expect(getImbalance([
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ])).toBe(0);
    });

    it('returns positive when more debits', () => {
      expect(getImbalance([
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ])).toBe(2000);
    });

    it('returns negative when more credits', () => {
      expect(getImbalance([
        { amount_num: 3000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ])).toBe(-2000);
    });
  });
});
