<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>Budgets</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/budgets/create">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Variance Chart -->
      <div v-if="store.budgets.length" class="chart-container ion-padding">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <!-- Budget List -->
      <ion-list>
        <ion-item v-for="b in store.budgets" :key="b.id">
          <ion-label>
            <h3>{{ b.account_name ?? `Account #${b.account_id}` }}</h3>
            <p>{{ b.period }}</p>
          </ion-label>
          <div slot="end" class="budget-amounts">
            <span class="actual" :style="{ color: varianceColor(b) }">
              {{ formatAmount(b.actual_num, b.actual_denom) }}
            </span>
            <span class="budgeted">
              / {{ formatAmount(b.budgeted_num, b.budgeted_denom) }}
            </span>
          </div>
        </ion-item>
      </ion-list>

      <div v-if="!store.loading && !store.budgets.length" class="ion-text-center ion-padding">
        <p>No budgets configured</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useBudgetsStore, type Budget } from '@/stores/budgets';
import { toDecimal, formatCurrency } from '@/utils/money';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const store = useBudgetsStore();

function formatAmount(num: number, denom: number): string {
  return formatCurrency(toDecimal(num, denom));
}

function varianceColor(b: Budget): string {
  const actual = toDecimal(b.actual_num, b.actual_denom);
  const budgeted = toDecimal(b.budgeted_num, b.budgeted_denom);
  return actual > budgeted ? '#eb445a' : '#2dd36f';
}

const chartData = computed(() => {
  const labels = store.budgets.map((b) => b.account_name ?? `#${b.account_id}`);
  const budgeted = store.budgets.map((b) => toDecimal(b.budgeted_num, b.budgeted_denom));
  const actual = store.budgets.map((b) => toDecimal(b.actual_num, b.actual_denom));
  const colors = store.budgets.map((b) => {
    const a = toDecimal(b.actual_num, b.actual_denom);
    const bu = toDecimal(b.budgeted_num, b.budgeted_denom);
    return a > bu ? '#eb445a' : '#2dd36f';
  });

  return {
    labels,
    datasets: [
      { label: 'Budgeted', data: budgeted, backgroundColor: '#92949c' },
      { label: 'Actual', data: actual, backgroundColor: colors },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
  scales: { y: { beginAtZero: true } },
};

async function handleRefresh(event: CustomEvent) {
  await store.fetchBudgets();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(() => store.fetchBudgets());
</script>

<style scoped>
.chart-container { max-width: 600px; margin: 0 auto; }
.budget-amounts { text-align: right; font-size: 13px; }
.budgeted { color: var(--ion-color-medium); }
</style>
