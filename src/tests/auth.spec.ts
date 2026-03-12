import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock API module
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { Preferences } from '@capacitor/preferences';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start unauthenticated', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.companies).toEqual([]);
    });
  });

  describe('login', () => {
    it('should store token and user on successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            companies: [{ id: 1, name: 'Test Co', currency_code: 'USD' }],
          },
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(store.isAuthenticated).toBe(true);
      expect(store.token).toBe('test-token-123');
      expect(store.user?.name).toBe('Test User');
      expect(store.companies).toHaveLength(1);
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'auth_token', value: 'test-token-123' });
    });

    it('should throw on failed login', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid credentials'));

      const store = useAuthStore();
      await expect(store.login('bad@example.com', 'wrong')).rejects.toThrow();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all state on logout', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          token: 'tok',
          user: { id: 1, name: 'A', email: 'a@b.com', companies: [] },
        },
      });

      const store = useAuthStore();
      await store.login('a@b.com', 'pass');
      expect(store.isAuthenticated).toBe(true);

      vi.mocked(api.post).mockResolvedValueOnce({});
      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.companies).toEqual([]);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth_token' });
    });
  });

  describe('init', () => {
    it('should restore session from Preferences', async () => {
      vi.mocked(Preferences.get).mockImplementation(async ({ key }) => {
        if (key === 'auth_token') return { value: 'saved-token' };
        if (key === 'user') return { value: JSON.stringify({ id: 1, name: 'Saved', email: 's@b.com' }) };
        if (key === 'selected_company_id') return { value: '2' };
        return { value: null };
      });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { id: 1, name: 'Saved', email: 's@b.com', companies: [] },
      });

      const store = useAuthStore();
      await store.init();

      expect(store.isAuthenticated).toBe(true);
      expect(store.token).toBe('saved-token');
      expect(store.selectedCompanyId).toBe(2);
    });

    it('should handle missing token gracefully', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({ value: null });
      const store = useAuthStore();
      await store.init();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('selectCompany', () => {
    it('should update selectedCompanyId and persist', async () => {
      const store = useAuthStore();
      await store.selectCompany(5);
      expect(store.selectedCompanyId).toBe(5);
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'selected_company_id', value: '5' });
    });
  });

  describe('selectedCompany computed', () => {
    it('should return company matching selectedCompanyId', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          token: 'tok',
          user: {
            id: 1, name: 'A', email: 'a@b.com',
            companies: [
              { id: 1, name: 'Co A', currency_code: 'USD' },
              { id: 2, name: 'Co B', currency_code: 'KES' },
            ],
          },
        },
      });

      const store = useAuthStore();
      await store.login('a@b.com', 'pass');
      await store.selectCompany(2);

      expect(store.selectedCompany?.name).toBe('Co B');
    });
  });
});
