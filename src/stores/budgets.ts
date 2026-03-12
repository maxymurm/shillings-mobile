import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export interface Budget {
  id: number;
  company_id: number;
  account_id: number;
  account_name?: string;
  period: string;
  budgeted_num: number;
  budgeted_denom: number;
  actual_num: number;
  actual_denom: number;
}

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBudgets(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/budgets');
      budgets.value = response.data.data ?? response.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createBudget(data: Partial<Budget>): Promise<Budget | null> {
    try {
      const response = await api.post('/budgets', data);
      const budget = response.data.data ?? response.data;
      budgets.value.unshift(budget);
      return budget;
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  return { budgets, loading, error, fetchBudgets, createBudget };
});
