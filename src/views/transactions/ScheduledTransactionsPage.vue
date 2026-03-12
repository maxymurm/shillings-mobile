<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>Scheduled Transactions</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/scheduled/create">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Upcoming alert -->
      <ion-card v-if="store.upcoming.length" color="warning">
        <ion-card-content>
          <strong>{{ store.upcoming.length }} transaction{{ store.upcoming.length > 1 ? 's' : '' }} due this week</strong>
        </ion-card-content>
      </ion-card>

      <ion-list>
        <ion-item v-for="item in store.items" :key="item.id">
          <ion-label>
            <h3>{{ item.description }}</h3>
            <p>{{ item.frequency }} — Next: {{ item.next_due_date }}</p>
          </ion-label>
          <ion-chip slot="end" :color="item.enabled ? 'success' : 'medium'">
            {{ item.enabled ? 'Active' : 'Paused' }}
          </ion-chip>
        </ion-item>
      </ion-list>

      <div v-if="!store.loading && !store.items.length" class="ion-text-center ion-padding">
        <p>No scheduled transactions</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonChip, IonCard, IonCardContent,
  IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useScheduledTransactionsStore } from '@/stores/scheduledTransactions';

const store = useScheduledTransactionsStore();

async function handleRefresh(event: CustomEvent) {
  await store.fetchScheduled();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(() => store.fetchScheduled());
</script>
