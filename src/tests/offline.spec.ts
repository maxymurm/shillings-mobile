import { describe, it, expect } from 'vitest';
import {
  resolveConflict,
  getConflictDiff,
  setDefaultConflictStrategy,
  getDefaultConflictStrategy,
  type ConflictItem,
} from '@/offline/conflicts';

const makeConflict = (overrides?: Partial<ConflictItem>): ConflictItem => ({
  entity_type: 'account',
  entity_id: 1,
  local_data: { name: 'Local Account', code: '1001' },
  server_data: { name: 'Server Account', code: '1001' },
  local_updated_at: '2026-03-01T00:00:00Z',
  server_updated_at: '2026-03-02T00:00:00Z',
  ...overrides,
});

describe('Conflict Resolution', () => {
  it('should resolve with LOCAL_WINS strategy', () => {
    const conflict = makeConflict();
    const result = resolveConflict(conflict, 'LOCAL_WINS');
    expect(result.resolved_data).toEqual(conflict.local_data);
    expect(result.strategy).toBe('LOCAL_WINS');
    expect(result.entity_type).toBe('account');
    expect(result.entity_id).toBe(1);
  });

  it('should resolve with SERVER_WINS strategy', () => {
    const conflict = makeConflict();
    const result = resolveConflict(conflict, 'SERVER_WINS');
    expect(result.resolved_data).toEqual(conflict.server_data);
    expect(result.strategy).toBe('SERVER_WINS');
  });

  it('should resolve MANUAL with server data as default', () => {
    const conflict = makeConflict();
    const result = resolveConflict(conflict, 'MANUAL');
    expect(result.resolved_data).toEqual(conflict.server_data);
    expect(result.strategy).toBe('MANUAL');
  });

  it('should use default strategy when none specified', () => {
    setDefaultConflictStrategy('LOCAL_WINS');
    const conflict = makeConflict();
    const result = resolveConflict(conflict);
    expect(result.resolved_data).toEqual(conflict.local_data);
    // Reset
    setDefaultConflictStrategy('SERVER_WINS');
  });

  it('should get and set default conflict strategy', () => {
    setDefaultConflictStrategy('LOCAL_WINS');
    expect(getDefaultConflictStrategy()).toBe('LOCAL_WINS');
    setDefaultConflictStrategy('SERVER_WINS');
    expect(getDefaultConflictStrategy()).toBe('SERVER_WINS');
  });

  it('should compute diff between local and server data', () => {
    const conflict = makeConflict({
      local_data: { name: 'Local Name', code: '1001', description: 'local desc' },
      server_data: { name: 'Server Name', code: '1001', description: 'server desc' },
    });
    const diff = getConflictDiff(conflict);
    expect(diff).toHaveProperty('name');
    expect(diff.name.local).toBe('Local Name');
    expect(diff.name.server).toBe('Server Name');
    expect(diff).toHaveProperty('description');
    expect(diff).not.toHaveProperty('code'); // same value, no diff
  });

  it('should handle empty diff when data is identical', () => {
    const conflict = makeConflict({
      local_data: { name: 'Same', code: '1001' },
      server_data: { name: 'Same', code: '1001' },
    });
    const diff = getConflictDiff(conflict);
    expect(Object.keys(diff)).toHaveLength(0);
  });

  it('should detect new keys in diff', () => {
    const conflict = makeConflict({
      local_data: { name: 'Test' },
      server_data: { name: 'Test', extra: 'field' },
    });
    const diff = getConflictDiff(conflict);
    expect(diff).toHaveProperty('extra');
    expect(diff.extra.local).toBeUndefined();
    expect(diff.extra.server).toBe('field');
  });
});
