<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Shillings</ion-title>
        <OfflineBadge slot="end" style="margin-inline-end: 12px" />
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <ion-text color="medium" class="ion-margin-bottom">
        <p>Welcome{{ user ? ', ' + user.name : '' }}</p>
      </ion-text>

      <!-- Summary Cards -->
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Net Worth</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>{{ formatAmount(summary.net_worth_num) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Income (Month)</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2 class="income">{{ formatAmount(summary.income_num) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Expenses (Month)</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2 class="expense">{{ formatAmount(summary.expenses_num) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Recent Transactions -->
      <ion-list-header>
        <ion-label>Recent Transactions</ion-label>
      </ion-list-header>
      <ion-list>
        <ion-item v-for="txn in summary.recent_transactions" :key="txn.id" :router-link="`/tabs/transactions/${txn.id}`">
          <ion-label>
            <h3>{{ txn.description }}</h3>
            <p>{{ txn.post_date }}</p>
          </ion-label>
        </ion-item>
        <ion-item v-if="!summary.recent_transactions.length">
          <ion-label color="medium">No recent transactions</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonText,
} from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency } from '@/utils/money';
import api from '@/services/api';
import OfflineBadge from '@/components/OfflineBadge.vue';
import type { DashboardSummary } from '@/types';

const authStore = useAuthStore();
const user = ref(authStore.user);

const summary = ref<DashboardSummary>({
  net_worth_num: 0, net_worth_denom: 100,
  income_num: 0, income_denom: 100,
  expenses_num: 0, expenses_denom: 100,
  recent_transactions: [],
});

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

async function fetchSummary() {
  try {
    const response = await api.get('/reports/summary');
    summary.value = response.data;
  } catch {
    // Offline: show cached or zeros
  }
}

async function handleRefresh(event: CustomEvent) {
  await fetchSummary();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(fetchSummary);
</script>

<style scoped>
h2 { font-size: 1.3rem; font-weight: 700; margin: 0; }
.income { color: var(--ion-color-success); }
.expense { color: var(--ion-color-danger); }
</style>
