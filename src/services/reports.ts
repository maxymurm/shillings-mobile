import api from '@/services/api';

export interface BalanceSheetData {
  assets: number;
  liabilities: number;
  equity: number;
}

export interface IncomeStatementData {
  periods: string[];
  income: number[];
  expenses: number[];
}

export interface CashFlowData {
  periods: string[];
  amounts: number[];
}

export interface TrialBalanceRow {
  account_id: number;
  account_name: string;
  account_code: string;
  classification: string;
  debit: number;
  credit: number;
}

export interface AccountRegisterEntry {
  id: number;
  date: string;
  num?: string;
  description: string;
  memo?: string;
  amount_num: number;
  amount_denom: number;
  action: 'DEBIT' | 'CREDIT';
  balance_num: number;
  balance_denom: number;
  reconciled_state?: 'n' | 'c' | 'y';
  is_posted?: boolean;
  is_void?: boolean;
  transfer_account?: string;
  transfer_account_id?: number;
  split_id?: number;
}

export interface TaxSummaryTax {
  tax_id: number;
  tax_name: string;
  tax_rate: number;
  tax_type: string;
  collected: number;
  collected_formatted: string;
  paid: number;
  paid_formatted: string;
  net: number;
  net_formatted: string;
}

export interface TaxSummaryData {
  taxes: TaxSummaryTax[];
  totals: {
    collected: number;
    collected_formatted: string;
    paid: number;
    paid_formatted: string;
    net: number;
    net_formatted: string;
  };
  period: { start_date: string; end_date: string };
  tax_count: number;
}

export interface ReportFilters {
  search?: string;
  date_preset?: string;
  start_date?: string;
  end_date?: string;
  as_of_date?: string;
}

export async function fetchBalanceSheet(filters: ReportFilters = {}): Promise<BalanceSheetData> {
  const response = await api.get('/reports/balance-sheet', { params: filters });
  return response.data.data ?? response.data;
}

export async function fetchIncomeStatement(filters: ReportFilters = {}): Promise<IncomeStatementData> {
  const response = await api.get('/reports/income-statement', { params: filters });
  return response.data.data ?? response.data;
}

export async function fetchCashFlow(filters: ReportFilters = {}): Promise<CashFlowData> {
  const response = await api.get('/reports/cash-flow', { params: filters });
  return response.data.data ?? response.data;
}

export async function fetchTrialBalance(filters: ReportFilters = {}): Promise<TrialBalanceRow[]> {
  const response = await api.get('/reports/trial-balance', { params: filters });
  return response.data.data ?? response.data;
}

export async function fetchTaxSummary(
  filters: { start_date?: string; end_date?: string } = {},
): Promise<TaxSummaryData> {
  const response = await api.get('/tax-summary', { params: filters });
  return response.data.data ?? response.data;
}

export async function fetchAccountRegister(
  accountId: number,
  page = 1,
  filters: {
    search?: string;
    start_date?: string;
    end_date?: string;
    unreconciled_only?: boolean;
    sort_column?: string;
    sort_dir?: string;
  } = {},
): Promise<AccountRegisterEntry[]> {
  const response = await api.get(`/accounts/${accountId}/transactions`, {
    params: { page, ...filters },
  });
  return response.data.data ?? response.data;
}

export async function toggleReconcileState(
  transactionId: number,
  splitId: number,
  newState: 'n' | 'c' | 'y',
): Promise<void> {
  await api.post(`/transactions/${transactionId}/reconcile`, {
    splits: [{ id: splitId, reconciled_state: newState }],
  });
}

export async function voidTransaction(
  transactionId: number,
  reason: string,
): Promise<void> {
  await api.post(`/transactions/${transactionId}/void`, { reason });
}

export async function duplicateTransaction(
  transactionId: number,
): Promise<{ transaction: any }> {
  const response = await api.post(`/transactions/${transactionId}/duplicate`);
  return response.data;
}

export async function deleteTransaction(
  transactionId: number,
): Promise<void> {
  await api.delete(`/transactions/${transactionId}`);
}

export async function exportAccountRegisterCsv(
  accountId: number,
  filters: { search?: string; start_date?: string; end_date?: string } = {},
): Promise<Blob> {
  const response = await api.get(`/accounts/${accountId}/transactions/export`, {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
}
