/**
 * Money utility functions for fraction-based accounting.
 * Shillings stores amounts as amount_num / amount_denom (always 100).
 * NEVER send floats directly — always convert to fractions.
 */

export function toDecimal(amountNum: number, amountDenom: number = 100): number {
  if (amountDenom === 0) return 0;
  return amountNum / amountDenom;
}

export function fromDecimal(value: string | number): { amount_num: number; amount_denom: number } {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(parsed)) return { amount_num: 0, amount_denom: 100 };
  return {
    amount_num: Math.round(parsed * 100),
    amount_denom: 100,
  };
}

export function formatCurrency(
  amountNum: number,
  amountDenom: number = 100,
  currencyCode: string = 'KES',
  locale: string = 'en-KE',
): string {
  const value = toDecimal(amountNum, amountDenom);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export function isBalanced(splits: Array<{ amount_num: number; action: 'DEBIT' | 'CREDIT' }>): boolean {
  let debits = 0;
  let credits = 0;
  for (const split of splits) {
    if (split.action === 'DEBIT') debits += split.amount_num;
    else credits += split.amount_num;
  }
  return debits === credits;
}

export function getImbalance(splits: Array<{ amount_num: number; action: 'DEBIT' | 'CREDIT' }>): number {
  let debits = 0;
  let credits = 0;
  for (const split of splits) {
    if (split.action === 'DEBIT') debits += split.amount_num;
    else credits += split.amount_num;
  }
  return debits - credits;
}
