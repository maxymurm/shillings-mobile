<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Resolve Conflicts</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list v-if="conflicts.length">
        <div v-for="conflict in conflicts" :key="`${conflict.entity_type}-${conflict.entity_id}`">
          <ion-item-divider>
            <ion-label>{{ conflict.entity_type }} #{{ conflict.entity_id }}</ion-label>
          </ion-item-divider>

          <div v-for="(diff, field) in getConflictDiff(conflict)" :key="String(field)" class="conflict-field">
            <ion-item>
              <ion-label>
                <h3>{{ String(field) }}</h3>
                <p class="local-value">Local: {{ diff.local ?? '(empty)' }}</p>
                <p class="server-value">Server: {{ diff.server ?? '(empty)' }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="conflict-actions ion-padding">
            <ion-button expand="block" color="primary" @click="resolve(conflict, 'LOCAL_WINS')">
              Keep Local
            </ion-button>
            <ion-button expand="block" color="secondary" @click="resolve(conflict, 'SERVER_WINS')">
              Keep Server
            </ion-button>
          </div>
        </div>
      </ion-list>

      <div v-else class="ion-text-center ion-padding">
        <ion-icon :icon="checkmarkCircleOutline" size="large" color="success" />
        <p>No conflicts to resolve</p>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/vue';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useSyncStore } from '@/stores/sync';
import {
  type ConflictItem,
  type ConflictStrategy,
  resolveConflict,
  getConflictDiff,
} from '@/offline/conflicts';
import { db } from '@/offline/database';
import { storeToRefs } from 'pinia';

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();

const syncStore = useSyncStore();
const { conflicts } = storeToRefs(syncStore);

async function resolve(conflict: ConflictItem, strategy: ConflictStrategy): Promise<void> {
  const resolution = resolveConflict(conflict, strategy);

  // Apply resolution to local database
  const table = (db as any)[resolution.entity_type + 's'];
  if (table) {
    await table.put({ id: resolution.entity_id, ...resolution.resolved_data });
  }

  syncStore.removeConflict(conflict.entity_type, conflict.entity_id);
}
</script>

<style scoped>
.conflict-field {
  margin-left: 16px;
}

.local-value {
  color: var(--ion-color-primary);
}

.server-value {
  color: var(--ion-color-secondary);
}

.conflict-actions {
  display: flex;
  gap: 8px;
}

.conflict-actions ion-button {
  flex: 1;
}
</style>
