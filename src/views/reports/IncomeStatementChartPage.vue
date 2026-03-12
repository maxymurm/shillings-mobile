<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Income Statement</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <div v-else-if="data">
        <div class="chart-container">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <div v-else class="ion-text-center ion-padding">
        <p>No data available</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { fetchIncomeStatement, type IncomeStatementData } from '@/services/reports';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const loading = ref(false);
const data = ref<IncomeStatementData | null>(null);

const chartData = computed(() => ({
  labels: data.value?.periods ?? [],
  datasets: [
    { label: 'Income', data: data.value?.income ?? [], backgroundColor: '#2dd36f' },
    { label: 'Expenses', data: data.value?.expenses ?? [], backgroundColor: '#eb445a' },
  ],
}));

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
  scales: { y: { beginAtZero: true } },
};

async function load() {
  loading.value = true;
  try { data.value = await fetchIncomeStatement(); }
  catch { /* offline */ }
  finally { loading.value = false; }
}

async function handleRefresh(event: CustomEvent) {
  await load();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(load);
</script>

<style scoped>
.chart-container { max-width: 600px; margin: 0 auto; padding: 16px 0; }
</style>
