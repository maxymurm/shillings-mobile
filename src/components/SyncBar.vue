<template>
  <div v-if="!isOnline || hasPending" class="sync-bar" :class="{ offline: !isOnline, pending: isOnline && hasPending }">
    <ion-icon :icon="isOnline ? syncOutline : cloudOfflineOutline" />
    <span v-if="!isOnline">Offline</span>
    <span v-else-if="isSyncing">Syncing...</span>
    <span v-else>{{ pendingCount }} pending</span>
    <ion-button v-if="isOnline && hasPending && !isSyncing" fill="clear" size="small" @click="triggerSync">
      Sync Now
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { syncOutline, cloudOfflineOutline } from 'ionicons/icons';
import { useSyncStore } from '@/stores/sync';
import { storeToRefs } from 'pinia';

const syncStore = useSyncStore();
const { isOnline, hasPending, isSyncing, pendingCount } = storeToRefs(syncStore);

function triggerSync(): void {
  syncStore.triggerSync();
}
</script>

<style scoped>
.sync-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.sync-bar.offline {
  background: var(--ion-color-danger);
  color: var(--ion-color-danger-contrast);
}

.sync-bar.pending {
  background: var(--ion-color-warning);
  color: var(--ion-color-warning-contrast);
}

.sync-bar ion-button {
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 11px;
  margin-left: auto;
}
</style>
