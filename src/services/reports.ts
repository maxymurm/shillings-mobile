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
  description: string;
  amount_num: number;
  amount_denom: number;
  action: 'DEBIT' | 'CREDIT';
  balance_num: number;
  balance_denom: number;
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

export async function fetchAccountRegister(
  accountId: number,
  page = 1,
  filters: { search?: string; start_date?: string; end_date?: string } = {},
): Promise<AccountRegisterEntry[]> {
  const response = await api.get(`/accounts/${accountId}/transactions`, {
    params: { page, ...filters },
  });
  return response.data.data ?? response.data;
}
