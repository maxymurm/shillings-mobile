<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Balance Sheet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Filter bar -->
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search accounts..."
          :debounce="400"
          @ionInput="load"
        />
      </ion-toolbar>

      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <div v-else-if="data">
        <div class="chart-container">
          <Pie :data="chartData" :options="chartOptions" />
        </div>
        <ion-list>
          <ion-item>
            <ion-label>Assets</ion-label>
            <ion-note slot="end">{{ formatCurrency(data.assets) }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Liabilities</ion-label>
            <ion-note slot="end">{{ formatCurrency(data.liabilities) }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Equity</ion-label>
            <ion-note slot="end">{{ formatCurrency(data.equity) }}</ion-note>
          </ion-item>
        </ion-list>
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
  IonList, IonItem, IonLabel, IonNote, IonSpinner, IonRefresher, IonRefresherContent,
  IonSearchbar,
} from '@ionic/vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchBalanceSheet, type BalanceSheetData } from '@/services/reports';
import { formatCurrency } from '@/utils/money';

ChartJS.register(ArcElement, Tooltip, Legend);

const loading = ref(false);
const data = ref<BalanceSheetData | null>(null);
const searchQuery = ref('');

const chartData = computed(() => ({
  labels: ['Assets', 'Liabilities', 'Equity'],
  datasets: [{
    data: data.value ? [data.value.assets, data.value.liabilities, data.value.equity] : [],
    backgroundColor: ['#2dd36f', '#eb445a', '#3dc2ff'],
  }],
}));

const chartOptions = { responsive: true, plugins: { legend: { position: 'bottom' as const } } };

async function load() {
  loading.value = true;
  try {
    data.value = await fetchBalanceSheet({
      search: searchQuery.value || undefined,
    });
  } catch { /* offline */ }
  finally { loading.value = false; }
}

async function handleRefresh(event: CustomEvent) {
  await load();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(load);
</script>

<style scoped>
.chart-container { max-width: 400px; margin: 0 auto; padding: 16px 0; }
</style>
