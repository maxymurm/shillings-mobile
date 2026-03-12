import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { db } from '@/offline/database';
import { queueOfflineChange, isOnline } from '@/offline/sync';
import type { Contact } from '@/types';

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const hasMore = ref(true);
  const searchQuery = ref('');
  const filterType = ref<string | null>(null);

  const customers = computed(() => contacts.value.filter((c) => c.type === 'customer'));
  const vendors = computed(() => contacts.value.filter((c) => c.type === 'vendor'));
  const employees = computed(() => contacts.value.filter((c) => c.type === 'employee'));

  const filteredContacts = computed(() => {
    let result = contacts.value;
    if (filterType.value) {
      result = result.filter((c) => c.type === filterType.value);
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q),
      );
    }
    return result;
  });

  async function fetchContacts(reset = false): Promise<void> {
    if (reset) {
      currentPage.value = 1;
      hasMore.value = true;
      contacts.value = [];
    }
    if (!hasMore.value || loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      if (await isOnline()) {
        const params: Record<string, any> = { page: currentPage.value };
        if (filterType.value) params.type = filterType.value;
        const response = await api.get('/contacts', { params });
        const data = response.data.data ?? response.data;
        if (reset) {
          contacts.value = data;
        } else {
          contacts.value.push(...data);
        }
        hasMore.value = data.length >= 15;
        currentPage.value++;

        // Cache to offline DB
        await db.contacts.bulkPut(data);
      } else {
        // Load from offline DB
        const offline = await db.contacts.toArray();
        contacts.value = offline as Contact[];
        hasMore.value = false;
      }
    } catch (e: any) {
      error.value = e.message;
      // Fallback to offline
      const offline = await db.contacts.toArray();
      contacts.value = offline as Contact[];
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function createContact(data: Partial<Contact>): Promise<Contact | null> {
    try {
      if (await isOnline()) {
        const response = await api.post('/contacts', data);
        const contact = response.data.data ?? response.data;
        contacts.value.unshift(contact);
        await db.contacts.put(contact);
        return contact;
      } else {
        await queueOfflineChange('contact', null, 'create', data);
        return null;
      }
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  async function updateContact(id: number, data: Partial<Contact>): Promise<Contact | null> {
    try {
      if (await isOnline()) {
        const response = await api.put(`/contacts/${id}`, data);
        const contact = response.data.data ?? response.data;
        const idx = contacts.value.findIndex((c) => c.id === id);
        if (idx >= 0) contacts.value[idx] = contact;
        await db.contacts.put(contact);
        return contact;
      } else {
        await queueOfflineChange('contact', id, 'update', data);
        return null;
      }
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  function getContactById(id: number): Contact | undefined {
    return contacts.value.find((c) => c.id === id);
  }

  return {
    contacts,
    loading,
    error,
    searchQuery,
    filterType,
    hasMore,
    customers,
    vendors,
    employees,
    filteredContacts,
    fetchContacts,
    createContact,
    updateContact,
    getContactById,
  };
});
