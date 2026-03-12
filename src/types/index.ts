export interface User {
  id: number;
  name: string;
  email: string;
  companies?: Company[];
}

export interface Company {
  id: number;
  name: string;
  default_currency_id: number;
  currency?: Currency;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface Account {
  id: number;
  company_id: number;
  account_type_id: number;
  parent_id: number | null;
  name: string;
  code: string;
  description: string | null;
  placeholder: boolean;
  hidden: boolean;
  account_type?: AccountType;
  children?: Account[];
  balance_num?: number;
  balance_denom?: number;
}

export interface AccountType {
  id: number;
  name: string;
  classification: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  normal_balance: 'DEBIT' | 'CREDIT';
}

export interface Transaction {
  id: number;
  company_id: number;
  currency_id: number;
  description: string;
  notes: string | null;
  reference: string | null;
  post_date: string;
  enter_date: string;
  is_posted: boolean;
  splits: Split[];
  currency?: Currency;
}

export interface Split {
  id: number;
  transaction_id: number;
  account_id: number;
  amount_num: number;
  amount_denom: number;
  action: 'DEBIT' | 'CREDIT';
  memo: string | null;
  reconcile_state: 'n' | 'c' | 'y';
  account?: Account;
  transaction?: Transaction;
}

export interface Contact {
  id: number;
  company_id: number;
  name: string;
  type: 'customer' | 'vendor' | 'employee';
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface Document {
  id: number;
  company_id: number;
  contact_id: number;
  type: 'invoice' | 'bill' | 'quote';
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  number: string;
  issued_at: string;
  due_at: string;
  total_num: number;
  total_denom: number;
  contact?: Contact;
  items?: DocumentItem[];
}

export interface DocumentItem {
  id: number;
  document_id: number;
  description: string;
  quantity: number;
  price_num: number;
  price_denom: number;
  account_id: number;
}

export interface SyncQueueItem {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entity_id: number | null;
  data: Record<string, unknown>;
  created_at: string;
  synced: boolean;
}

export interface DashboardSummary {
  net_worth_num: number;
  net_worth_denom: number;
  income_num: number;
  income_denom: number;
  expenses_num: number;
  expenses_denom: number;
  recent_transactions: Transaction[];
}
