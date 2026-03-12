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

export async function fetchBalanceSheet(): Promise<BalanceSheetData> {
  const response = await api.get('/reports/balance-sheet');
  return response.data.data ?? response.data;
}

export async function fetchIncomeStatement(): Promise<IncomeStatementData> {
  const response = await api.get('/reports/income-statement');
  return response.data.data ?? response.data;
}

export async function fetchCashFlow(): Promise<CashFlowData> {
  const response = await api.get('/reports/cash-flow');
  return response.data.data ?? response.data;
}

export async function fetchTrialBalance(): Promise<TrialBalanceRow[]> {
  const response = await api.get('/reports/trial-balance');
  return response.data.data ?? response.data;
}

export async function fetchAccountRegister(accountId: number, page = 1): Promise<AccountRegisterEntry[]> {
  const response = await api.get(`/accounts/${accountId}/transactions`, { params: { page } });
  return response.data.data ?? response.data;
}
