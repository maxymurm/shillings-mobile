<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/transactions" />
        </ion-buttons>
        <ion-title>Transaction</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="transaction">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ transaction.description }}</ion-card-title>
            <ion-card-subtitle>{{ transaction.post_date }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="split in transaction.splits" :key="split.id">
                <ion-label>
                  <h3>{{ split.account?.name ?? 'Account #' + split.account_id }}</h3>
                  <p>{{ split.memo }}</p>
                </ion-label>
                <ion-note slot="end" :color="split.amount_num >= 0 ? 'success' : 'danger'">
                  {{ formatAmount(split.amount_num) }}
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
      <ion-text v-else color="medium" class="ion-text-center">
        <p>Loading...</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel, IonNote, IonText,
} from '@ionic/vue';
import api from '@/services/api';
import { formatCurrency } from '@/utils/money';
import type { Transaction } from '@/types';

const route = useRoute();
const transaction = ref<Transaction | null>(null);

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

onMounted(async () => {
  try {
    const response = await api.get(`/transactions/${route.params.id}`);
    transaction.value = response.data.data ?? response.data;
  } catch { /* offline */ }
});
</script>
