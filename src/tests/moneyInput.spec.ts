import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { toDecimal, fromDecimal, formatCurrency } from '@/utils/money';

// Mock Ionic components
vi.mock('@ionic/vue', () => ({
  IonInput: {
    name: 'IonInput',
    template: '<input />',
    props: ['modelValue', 'type', 'label', 'labelPlacement', 'inputmode', 'step', 'min'],
  },
}));

// Inline MoneyInput logic tests (testing the conversion logic used by MoneyInput)
describe('MoneyInput fraction conversion', () => {
  describe('display value from fraction', () => {
    it('converts 5000/100 to 50', () => {
      expect(toDecimal(5000, 100)).toBe(50);
    });

    it('converts 1050/100 to 10.5', () => {
      expect(toDecimal(1050, 100)).toBe(10.5);
    });

    it('converts 0/100 to 0', () => {
      expect(toDecimal(0, 100)).toBe(0);
    });

    it('converts negative fractions', () => {
      expect(toDecimal(-2500, 100)).toBe(-25);
    });

    it('handles 1 cent (1/100)', () => {
      expect(toDecimal(1, 100)).toBe(0.01);
    });

    it('handles large amounts', () => {
      expect(toDecimal(99999999, 100)).toBe(999999.99);
    });
  });

  describe('fraction from decimal input', () => {
    it('converts 50.00 to 5000/100', () => {
      const r = fromDecimal('50.00');
      expect(r.amount_num).toBe(5000);
      expect(r.amount_denom).toBe(100);
    });

    it('converts 0.01 to 1/100', () => {
      const r = fromDecimal('0.01');
      expect(r.amount_num).toBe(1);
      expect(r.amount_denom).toBe(100);
    });

    it('rounds 3-decimal input to nearest cent', () => {
      expect(fromDecimal('10.555').amount_num).toBe(1056);
      expect(fromDecimal('10.554').amount_num).toBe(1055);
    });

    it('handles empty string as 0', () => {
      const r = fromDecimal('');
      expect(r.amount_num).toBe(0);
    });

    it('handles negative values', () => {
      const r = fromDecimal('-25.50');
      expect(r.amount_num).toBe(-2550);
      expect(r.amount_denom).toBe(100);
    });

    it('always returns denom 100', () => {
      expect(fromDecimal('1').amount_denom).toBe(100);
      expect(fromDecimal('999.99').amount_denom).toBe(100);
      expect(fromDecimal('0').amount_denom).toBe(100);
    });
  });

  describe('round-trip conversion', () => {
    it('decimal -> fraction -> decimal preserves value', () => {
      const inputs = [0, 1, 10.5, 99.99, 1000, 0.01, -50];
      for (const input of inputs) {
        const frac = fromDecimal(input);
        const decimal = toDecimal(frac.amount_num, frac.amount_denom);
        expect(decimal).toBe(input);
      }
    });
  });

  describe('formatCurrency display', () => {
    it('formats with KES currency', () => {
      const result = formatCurrency(5000, 100, 'KES', 'en-KE');
      expect(result).toContain('50.00');
    });

    it('formats zero amount', () => {
      const result = formatCurrency(0, 100, 'USD', 'en-US');
      expect(result).toContain('0.00');
    });

    it('formats negative amounts', () => {
      const result = formatCurrency(-2500, 100, 'USD', 'en-US');
      expect(result).toContain('25.00');
    });
  });
});
