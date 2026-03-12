import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { syncAll, getPendingCount, onSyncComplete, type SyncResult } from '@/offline/sync';
import type { ConflictItem } from '@/offline/conflicts';

export const useSyncStore = defineStore('sync', () => {
  const pendingCount = ref(0);
  const isSyncing = ref(false);
  const lastSyncAt = ref<string | null>(null);
  const lastSyncResult = ref<SyncResult | null>(null);
  const conflicts = ref<ConflictItem[]>([]);
  const isOnline = ref(true);

  const hasPending = computed(() => pendingCount.value > 0);
  const hasConflicts = computed(() => conflicts.value.length > 0);

  async function refreshPendingCount(): Promise<void> {
    pendingCount.value = await getPendingCount();
  }

  async function triggerSync(): Promise<SyncResult> {
    isSyncing.value = true;
    try {
      const result = await syncAll();
      lastSyncResult.value = result;
      lastSyncAt.value = new Date().toISOString();
      await refreshPendingCount();
      return result;
    } finally {
      isSyncing.value = false;
    }
  }

  function addConflict(conflict: ConflictItem): void {
    conflicts.value.push(conflict);
  }

  function removeConflict(entityType: string, entityId: number): void {
    conflicts.value = conflicts.value.filter(
      (c) => !(c.entity_type === entityType && c.entity_id === entityId),
    );
  }

  function clearConflicts(): void {
    conflicts.value = [];
  }

  function setOnline(status: boolean): void {
    isOnline.value = status;
  }

  // Register callback for sync completion
  onSyncComplete((result) => {
    lastSyncResult.value = result;
    lastSyncAt.value = new Date().toISOString();
    refreshPendingCount();
  });

  return {
    pendingCount,
    isSyncing,
    lastSyncAt,
    lastSyncResult,
    conflicts,
    isOnline,
    hasPending,
    hasConflicts,
    refreshPendingCount,
    triggerSync,
    addConflict,
    removeConflict,
    clearConflicts,
    setOnline,
  };
});
