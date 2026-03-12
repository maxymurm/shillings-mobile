import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export interface ScheduledTransaction {
  id: number;
  company_id: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  amount_num: number;
  amount_denom: number;
  enabled: boolean;
  last_run_at: string | null;
}

export const useScheduledTransactionsStore = defineStore('scheduledTransactions', () => {
  const items = ref<ScheduledTransaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const upcoming = computed(() => {
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return items.value.filter((t) => {
      const due = new Date(t.next_due_date);
      return t.enabled && due >= now && due <= week;
    });
  });

  async function fetchScheduled(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/scheduled-transactions');
      items.value = response.data.data ?? response.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createScheduled(data: Partial<ScheduledTransaction>): Promise<ScheduledTransaction | null> {
    try {
      const response = await api.post('/scheduled-transactions', data);
      const item = response.data.data ?? response.data;
      items.value.unshift(item);
      return item;
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  return { items, loading, error, upcoming, fetchScheduled, createScheduled };
});
