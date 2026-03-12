import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Account, AccountType } from '@/types';

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);
  const accountTypes = ref<AccountType[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const accountsByType = computed(() => {
    const classifications = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
    return classifications
      .map((type) => ({
        type,
        accounts: accounts.value.filter((a) => a.account_type?.classification === type),
      }))
      .filter((g) => g.accounts.length > 0);
  });

  const rootAccounts = computed(() =>
    accounts.value.filter((a) => !a.parent_id),
  );

  function getChildren(parentId: number): Account[] {
    return accounts.value.filter((a) => a.parent_id === parentId);
  }

  function getAccountById(id: number): Account | undefined {
    return accounts.value.find((a) => a.id === id);
  }

  async function fetchAccounts() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/accounts');
      accounts.value = response.data.data ?? response.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAccountTypes() {
    try {
      const response = await api.get('/account-types');
      accountTypes.value = response.data.data ?? response.data;
    } catch {
      // offline — use cached
    }
  }

  async function createAccount(data: Partial<Account>): Promise<Account> {
    const response = await api.post('/accounts', data);
    const account = response.data.data ?? response.data;
    accounts.value.push(account);
    return account;
  }

  async function updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, data);
    const updated = response.data.data ?? response.data;
    const idx = accounts.value.findIndex((a) => a.id === id);
    if (idx >= 0) accounts.value[idx] = updated;
    return updated;
  }

  return {
    accounts, accountTypes, loading, error,
    accountsByType, rootAccounts,
    getChildren, getAccountById,
    fetchAccounts, fetchAccountTypes, createAccount, updateAccount,
  };
});
