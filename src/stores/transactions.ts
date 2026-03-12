import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Transaction } from '@/types';

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const hasMore = ref(true);

  const filters = ref({
    account_id: null as number | null,
    date_from: '',
    date_to: '',
    search: '',
    status: '' as '' | 'posted' | 'draft',
  });

  async function fetchTransactions(reset = false) {
    if (reset) {
      currentPage.value = 1;
      hasMore.value = true;
      transactions.value = [];
    }
    if (!hasMore.value) return;
    loading.value = true;
    try {
      const params: Record<string, any> = { page: currentPage.value, per_page: 20 };
      if (filters.value.account_id) params.account_id = filters.value.account_id;
      if (filters.value.date_from) params.date_from = filters.value.date_from;
      if (filters.value.date_to) params.date_to = filters.value.date_to;
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.status) params.is_posted = filters.value.status === 'posted';

      const response = await api.get('/transactions', { params });
      const data = response.data.data ?? response.data;
      if (Array.isArray(data)) {
        transactions.value.push(...data);
        hasMore.value = data.length === 20;
      } else {
        hasMore.value = false;
      }
      currentPage.value++;
    } catch {
      // offline
    } finally {
      loading.value = false;
    }
  }

  function getTransactionById(id: number): Transaction | undefined {
    return transactions.value.find((t) => t.id === id);
  }

  async function deleteTransaction(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`);
    transactions.value = transactions.value.filter((t) => t.id !== id);
  }

  return {
    transactions, loading, currentPage, hasMore, filters,
    fetchTransactions, getTransactionById, deleteTransaction,
  };
});
