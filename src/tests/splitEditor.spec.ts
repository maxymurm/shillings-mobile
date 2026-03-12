import { describe, it, expect } from 'vitest';
import { isBalanced, getImbalance, toDecimal, formatCurrency } from '@/utils/money';

type Split = { amount_num: number; action: 'DEBIT' | 'CREDIT' };

describe('SplitEditor balance validation', () => {
  describe('isBalanced', () => {
    it('returns true for equal debit and credit', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(true);
    });

    it('returns false for unequal amounts', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(false);
    });

    it('returns false when all debits and no credits', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'DEBIT' },
      ];
      expect(isBalanced(splits)).toBe(false);
    });

    it('returns false when all credits and no debits', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'CREDIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(false);
    });

    it('handles multiple splits that balance', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'DEBIT' },
        { amount_num: 8000, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(true);
    });

    it('handles multiple splits that do not balance', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'DEBIT' },
        { amount_num: 7000, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(false);
    });

    it('returns true for empty splits (0 === 0)', () => {
      const splits: Split[] = [];
      // isBalanced only checks debits === credits, not debits > 0
      expect(isBalanced(splits)).toBe(true);
    });

    it('returns true for all-zero amounts (0 === 0)', () => {
      const splits: Split[] = [
        { amount_num: 0, action: 'DEBIT' },
        { amount_num: 0, action: 'CREDIT' },
      ];
      expect(isBalanced(splits)).toBe(true);
    });
  });

  describe('getImbalance', () => {
    it('returns 0 for balanced splits', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ];
      expect(getImbalance(splits)).toBe(0);
    });

    it('returns positive when debits exceed credits', () => {
      const splits: Split[] = [
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ];
      expect(getImbalance(splits)).toBe(2000);
    });

    it('returns negative when credits exceed debits', () => {
      const splits: Split[] = [
        { amount_num: 3000, action: 'DEBIT' },
        { amount_num: 5000, action: 'CREDIT' },
      ];
      expect(getImbalance(splits)).toBe(-2000);
    });

    it('returns 0 for multi-split balanced transaction', () => {
      const splits: Split[] = [
        { amount_num: 1000, action: 'DEBIT' },
        { amount_num: 2000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ];
      expect(getImbalance(splits)).toBe(0);
    });

    it('computes imbalance display text correctly', () => {
      const diff = Math.abs(getImbalance([
        { amount_num: 5000, action: 'DEBIT' },
        { amount_num: 3000, action: 'CREDIT' },
      ]));
      const display = formatCurrency(diff, 100, 'USD', 'en-US');
      expect(display).toContain('20.00');
    });
  });
});
