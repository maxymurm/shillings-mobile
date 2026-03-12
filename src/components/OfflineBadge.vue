<template>
  <div v-if="!isOnline || pendingCount > 0" class="offline-badge" :class="{ offline: !isOnline }">
    <ion-icon :icon="isOnline ? syncOutline : cloudOfflineOutline" />
    <span v-if="!isOnline">Offline</span>
    <span v-else-if="pendingCount > 0">{{ pendingCount }} pending</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IonIcon } from '@ionic/vue';
import { cloudOfflineOutline, syncOutline } from 'ionicons/icons';
import { Network } from '@capacitor/network';

const isOnline = ref(true);
const pendingCount = ref(0);

let networkHandler: any;

onMounted(async () => {
  const status = await Network.getStatus();
  isOnline.value = status.connected;

  networkHandler = Network.addListener('networkStatusChange', (status) => {
    isOnline.value = status.connected;
  });
});

onUnmounted(() => {
  networkHandler?.remove();
});

defineExpose({ pendingCount });
</script>

<style scoped>
.offline-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--ion-color-warning-tint);
  color: var(--ion-color-warning-contrast);
}
.offline-badge.offline {
  background: var(--ion-color-danger);
  color: #fff;
}
.offline-badge ion-icon {
  font-size: 14px;
}
</style>
