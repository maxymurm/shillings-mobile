<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Cash Flow</ion-title>
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
          <Line :data="chartData" :options="chartOptions" />
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
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { fetchCashFlow, type CashFlowData } from '@/services/reports';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const loading = ref(false);
const data = ref<CashFlowData | null>(null);

const chartData = computed(() => ({
  labels: data.value?.periods ?? [],
  datasets: [{
    label: 'Cash Flow',
    data: data.value?.amounts ?? [],
    borderColor: '#3dc2ff',
    backgroundColor: 'rgba(61, 194, 255, 0.1)',
    fill: true,
    tension: 0.3,
  }],
}));

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
  scales: { y: { beginAtZero: true } },
};

async function load() {
  loading.value = true;
  try { data.value = await fetchCashFlow(); }
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
