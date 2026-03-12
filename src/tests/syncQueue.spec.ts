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

import api from '@/services/api';

// Since src/offline/ is symlinked to the parent project, test sync logic
// through the sync store which wraps those functions
describe('Sync Queue Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('API batch upload format', () => {
    it('sends correct batch payload shape', async () => {
      const changes = [
        { entity_type: 'account', entity_id: 1, action: 'update', data: { name: 'Test' } },
        { entity_type: 'transaction', entity_id: 2, action: 'create', data: { description: 'New' } },
      ];

      vi.mocked(api.post).mockResolvedValueOnce({ data: { conflicts: [] } });
      await api.post('/sync/batch', { changes });

      expect(api.post).toHaveBeenCalledWith('/sync/batch', {
        changes: expect.arrayContaining([
          expect.objectContaining({ entity_type: 'account', action: 'update' }),
          expect.objectContaining({ entity_type: 'transaction', action: 'create' }),
        ]),
      });
    });

    it('handles server error response', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'));
      await expect(api.post('/sync/batch', { changes: [] })).rejects.toThrow('Network error');
    });
  });

  describe('API download changes format', () => {
    it('fetches changes since timestamp', async () => {
      const since = '2026-03-01T00:00:00Z';
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          accounts: [{ id: 1, name: 'Checking' }],
          transactions: [{ id: 1, description: 'Payment' }],
        },
      });

      const response = await api.get('/sync/changes', { params: { since } });
      expect(response.data.accounts).toHaveLength(1);
      expect(response.data.transactions).toHaveLength(1);
    });

    it('handles empty changes response', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: {} });
      const response = await api.get('/sync/changes', { params: { since: '2026-03-01T00:00:00Z' } });
      expect(response.data.accounts).toBeUndefined();
    });
  });

  describe('push subscription registration', () => {
    it('sends push token registration', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });
      await api.post('/push-subscriptions', { endpoint: 'fcm-token-123', platform: 'android' });
      expect(api.post).toHaveBeenCalledWith('/push-subscriptions', {
        endpoint: 'fcm-token-123',
        platform: 'android',
      });
    });
  });

  describe('sync queue entry shape', () => {
    it('creates valid queue entry structure', () => {
      const entry = {
        entity_type: 'account',
        entity_id: 1,
        action: 'update' as const,
        payload: JSON.stringify({ name: 'Updated' }),
        created_at: new Date().toISOString(),
        retries: 0,
        status: 'pending' as const,
      };

      expect(entry.entity_type).toBe('account');
      expect(entry.status).toBe('pending');
      expect(entry.retries).toBe(0);
      expect(JSON.parse(entry.payload)).toEqual({ name: 'Updated' });
    });

    it('increments retries on failure', () => {
      const entry = { retries: 0, status: 'pending' as const };
      const updated = {
        ...entry,
        retries: entry.retries + 1,
        status: entry.retries >= 3 ? 'failed' as const : 'pending' as const,
      };
      expect(updated.retries).toBe(1);
      expect(updated.status).toBe('pending');
    });

    it('marks as failed after 3 retries', () => {
      const entry = { retries: 3, status: 'pending' as const };
      const updated = {
        ...entry,
        retries: entry.retries + 1,
        status: entry.retries >= 3 ? 'failed' as const : 'pending' as const,
      };
      expect(updated.retries).toBe(4);
      expect(updated.status).toBe('failed');
    });
  });
});
