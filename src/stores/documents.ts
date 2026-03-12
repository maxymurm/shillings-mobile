import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Document } from '@/types';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filterType = ref<string | null>(null);
  const filterStatus = ref<string | null>(null);

  const filteredDocuments = computed(() => {
    let result = documents.value;
    if (filterType.value) {
      result = result.filter((d) => d.type === filterType.value);
    }
    if (filterStatus.value) {
      result = result.filter((d) => d.status === filterStatus.value);
    }
    return result;
  });

  async function fetchDocuments(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const params: Record<string, any> = {};
      if (filterType.value) params.type = filterType.value;
      if (filterStatus.value) params.status = filterStatus.value;
      const response = await api.get('/documents', { params });
      documents.value = response.data.data ?? response.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createInvoice(data: {
    contact_id: number;
    items: Array<{ description: string; quantity: number; price_num: number; price_denom: number; account_id: number }>;
  }): Promise<Document | null> {
    try {
      const response = await api.post('/documents', {
        type: 'invoice',
        status: 'draft',
        ...data,
      });
      const doc = response.data.data ?? response.data;
      documents.value.unshift(doc);
      return doc;
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  function getDocumentById(id: number): Document | undefined {
    return documents.value.find((d) => d.id === id);
  }

  return {
    documents,
    loading,
    error,
    filterType,
    filterStatus,
    filteredDocuments,
    fetchDocuments,
    createInvoice,
    getDocumentById,
  };
});
