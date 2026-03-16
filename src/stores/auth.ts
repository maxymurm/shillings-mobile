import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import api from '@/services/api';
import type { User, Company } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<User | null>(null);
  const companies = ref<Company[]>([]);
  const selectedCompanyId = ref<number | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const selectedCompany = computed(() =>
    companies.value.find((c) => c.id === selectedCompanyId.value) ?? companies.value[0] ?? null,
  );

  async function init() {
    const { value: savedToken } = await Preferences.get({ key: 'auth_token' });
    if (savedToken) {
      token.value = savedToken;
      const { value: savedUser } = await Preferences.get({ key: 'user' });
      if (savedUser) {
        try { user.value = JSON.parse(savedUser); } catch { /* ignore */ }
      }
      const { value: savedCompanyId } = await Preferences.get({ key: 'selected_company_id' });
      if (savedCompanyId) selectedCompanyId.value = parseInt(savedCompanyId, 10);
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Init timeout')), 5000),
        );
        await Promise.race([fetchUser(), timeout]);
      } catch {
        // offline or timeout — use cached data
      }
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    await Preferences.set({ key: 'auth_token', value: token.value! });
    await Preferences.set({ key: 'user', value: JSON.stringify(user.value) });
    if (response.data.user?.companies?.length) {
      companies.value = response.data.user.companies;
      await selectCompany(companies.value[0].id);
    }
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* fire-and-forget */ }
    token.value = null;
    user.value = null;
    companies.value = [];
    selectedCompanyId.value = null;
    await Preferences.remove({ key: 'auth_token' });
    await Preferences.remove({ key: 'user' });
    await Preferences.remove({ key: 'selected_company_id' });
  }

  async function fetchUser() {
    const response = await api.get('/user');
    user.value = response.data;
    if (response.data.companies) {
      companies.value = response.data.companies;
    }
    await Preferences.set({ key: 'user', value: JSON.stringify(user.value) });
  }

  async function selectCompany(companyId: number) {
    selectedCompanyId.value = companyId;
    await Preferences.set({ key: 'selected_company_id', value: String(companyId) });
  }

  return {
    token, user, companies, selectedCompanyId, selectedCompany,
    isAuthenticated, init, login, logout, fetchUser, selectCompany,
  };
});
