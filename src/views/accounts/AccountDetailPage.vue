<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/accounts" />
        </ion-buttons>
        <ion-title>{{ account?.name ?? 'Account' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="account">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ account.account_type?.classification }}</ion-card-subtitle>
            <ion-card-title>{{ formatAmount(account.balance_num ?? 0) }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p v-if="account.description">{{ account.description }}</p>
            <p>Code: {{ account.code }}</p>
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
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonText,
} from '@ionic/vue';
import api from '@/services/api';
import { formatCurrency } from '@/utils/money';
import type { Account } from '@/types';

const route = useRoute();
const account = ref<Account | null>(null);

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

onMounted(async () => {
  try {
    const response = await api.get(`/accounts/${route.params.id}`);
    account.value = response.data.data ?? response.data;
  } catch { /* offline */ }
});
</script>
