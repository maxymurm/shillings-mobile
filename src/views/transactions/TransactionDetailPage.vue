<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/transactions" />
        </ion-buttons>
        <ion-title>Transaction</ion-title>
        <ion-buttons slot="end">
          <ion-button :router-link="`/tabs/transactions/${$route.params.id}/edit`">
            <ion-icon slot="icon-only" :icon="createOutline" />
          </ion-button>
        </ion-buttons>
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
            <p v-if="transaction.notes">{{ transaction.notes }}</p>
            <p v-if="transaction.reference">Ref: {{ transaction.reference }}</p>
            <ion-chip :color="transaction.is_posted ? 'success' : 'warning'">
              {{ transaction.is_posted ? 'Posted' : 'Draft' }}
            </ion-chip>
          </ion-card-content>
        </ion-card>

        <ion-list-header>
          <ion-label>Splits</ion-label>
        </ion-list-header>
        <ion-list>
          <ion-item v-for="split in transaction.splits" :key="split.id"
            :router-link="`/tabs/accounts/${split.account_id}`">
            <ion-label>
              <h3>{{ split.account?.name ?? 'Account #' + split.account_id }}</h3>
              <p>{{ split.action }} {{ split.memo ? '— ' + split.memo : '' }}</p>
            </ion-label>
            <SplitAmount slot="end" :amount-num="split.amount_num" :amount-denom="split.amount_denom"
              :action="split.action" />
          </ion-item>
        </ion-list>
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonText, IonChip,
} from '@ionic/vue';
import { createOutline } from 'ionicons/icons';
import api from '@/services/api';
import SplitAmount from '@/components/SplitAmount.vue';
import type { Transaction } from '@/types';

const route = useRoute();
const transaction = ref<Transaction | null>(null);

onMounted(async () => {
  try {
    const response = await api.get(`/transactions/${route.params.id}`);
    transaction.value = response.data.data ?? response.data;
  } catch { /* offline */ }
});
</script>
