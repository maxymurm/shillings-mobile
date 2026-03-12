<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Transactions</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/transactions/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list>
        <ion-item v-for="txn in transactions" :key="txn.id" :router-link="`/tabs/transactions/${txn.id}`">
          <ion-label>
            <h3>{{ txn.description }}</h3>
            <p>{{ txn.post_date }}</p>
          </ion-label>
        </ion-item>
        <ion-item v-if="!transactions.length">
          <ion-label color="medium">No transactions found</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import api from '@/services/api';
import type { Transaction } from '@/types';

const transactions = ref<Transaction[]>([]);

async function fetchTransactions() {
  try {
    const response = await api.get('/transactions');
    transactions.value = response.data.data ?? response.data;
  } catch { /* offline */ }
}

async function handleRefresh(event: CustomEvent) {
  await fetchTransactions();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(fetchTransactions);
</script>
