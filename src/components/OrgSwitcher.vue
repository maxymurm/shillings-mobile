<template>
  <div class="org-switcher" v-if="selectedCompany">
    <ion-chip @click="showPicker" color="primary" outline>
      <ion-icon :icon="businessOutline" />
      <ion-label>{{ abbreviation }}</ion-label>
    </ion-chip>

    <ion-action-sheet
      :is-open="isOpen"
      :header="'Switch Organisation'"
      :buttons="actionButtons"
      @didDismiss="isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonChip, IonIcon, IonLabel, IonActionSheet } from '@ionic/vue';
import { businessOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isOpen = ref(false);

const selectedCompany = computed(() => authStore.selectedCompany);

const abbreviation = computed(() => {
  const name = selectedCompany.value?.name ?? '';
  const stripped = name.replace(/\b(Inc|LLC|Ltd|PLC|Corp|Co)\b\.?/gi, '').trim();
  const words = stripped.split(/\s+/).filter(w => !['and', 'the', 'of'].includes(w.toLowerCase()));
  return words
    .slice(0, 4)
    .map(w => w.charAt(0).toUpperCase())
    .join('');
});

const actionButtons = computed(() => {
  const buttons: Array<{ text: string; handler?: () => void; role?: string }> = authStore.companies
    .filter(c => c.id !== authStore.selectedCompanyId)
    .map(c => ({
      text: c.name,
      handler: () => { authStore.selectCompany(c.id); },
    }));

  buttons.push({ text: 'Cancel', role: 'cancel' });
  return buttons;
});

function showPicker() {
  if (authStore.companies.length > 1) {
    isOpen.value = true;
  }
}
</script>

<style scoped>
.org-switcher {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

ion-chip {
  --background: transparent;
  font-weight: 600;
  font-size: 13px;
  height: 30px;
}
</style>
