<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Tax Summary</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Date range filter -->
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label>From</ion-label>
          <ion-datetime-button datetime="tax-start" slot="end" />
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime id="tax-start" presentation="date" v-model="startDate" @ionChange="load" />
          </ion-modal>
        </ion-item>
        <ion-item lines="none">
          <ion-label>To</ion-label>
          <ion-datetime-button datetime="tax-end" slot="end" />
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime id="tax-end" presentation="date" v-model="endDate" @ionChange="load" />
          </ion-modal>
        </ion-item>
      </ion-toolbar>

      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <template v-else-if="data">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <ion-card class="summary-card collected">
            <ion-card-content>
              <p class="card-label">Sales Tax Collected</p>
              <p class="card-value">{{ data.totals?.collected_formatted ?? formatNum(data.totals?.collected) }}</p>
            </ion-card-content>
          </ion-card>
          <ion-card class="summary-card paid">
            <ion-card-content>
              <p class="card-label">Purchase Tax Paid</p>
              <p class="card-value">{{ data.totals?.paid_formatted ?? formatNum(data.totals?.paid) }}</p>
            </ion-card-content>
          </ion-card>
          <ion-card class="summary-card net">
            <ion-card-content>
              <p class="card-label">Net Tax {{ (data.totals?.net ?? 0) >= 0 ? 'Payable' : 'Recoverable' }}</p>
              <p class="card-value">{{ data.totals?.net_formatted ?? formatNum(Math.abs(data.totals?.net ?? 0)) }}</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Tax Line Items -->
        <ion-list v-if="data.taxes?.length">
          <ion-list-header>
            <ion-label>Tax Breakdown</ion-label>
          </ion-list-header>
          <ion-item v-for="tax in data.taxes" :key="tax.tax_id">
            <ion-label>
              <h3>{{ tax.tax_name }}</h3>
              <p>Rate: {{ tax.tax_rate }}%</p>
            </ion-label>
            <div slot="end" class="tax-amounts">
              <span class="collected">+{{ tax.collected_formatted ?? formatNum(tax.collected) }}</span>
              <span class="paid">-{{ tax.paid_formatted ?? formatNum(tax.paid) }}</span>
              <span class="net-amount"><strong>{{ tax.net_formatted ?? formatNum(tax.net) }}</strong></span>
            </div>
          </ion-item>
        </ion-list>

        <div v-else class="ion-text-center ion-padding">
          <p>No taxes found for this period.</p>
        </div>
      </template>

      <div v-else class="ion-text-center ion-padding">
        <p>No data available</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSpinner, IonRefresher, IonRefresherContent, IonItem, IonLabel, IonList,
  IonListHeader, IonCard, IonCardContent, IonDatetimeButton, IonDatetime, IonModal,
} from '@ionic/vue';
import { fetchTaxSummary, type TaxSummaryData } from '@/services/reports';

const loading = ref(false);
const data = ref<TaxSummaryData | null>(null);
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));

function formatNum(val: number | undefined): string {
  return (val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function load() {
  loading.value = true;
  try {
    data.value = await fetchTaxSummary({
      start_date: startDate.value,
      end_date: endDate.value,
    });
  } catch {
    /* offline fallback */
  } finally {
    loading.value = false;
  }
}

async function handleRefresh(event: CustomEvent) {
  await load();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(load);
</script>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 8px 16px;
}
.summary-card {
  margin: 0;
  border-radius: 12px;
}
.summary-card.collected { --background: #ecfdf5; }
.summary-card.paid { --background: #fef2f2; }
.summary-card.net { --background: #eff6ff; }
.card-label { font-size: 12px; color: var(--ion-color-medium); margin-bottom: 4px; }
.card-value { font-size: 22px; font-weight: 700; }
.collected .card-value { color: #047857; }
.paid .card-value { color: #dc2626; }
.net .card-value { color: #2563eb; }
.tax-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
}
.tax-amounts .collected { color: #047857; }
.tax-amounts .paid { color: #dc2626; }
.tax-amounts .net-amount { margin-top: 2px; }
</style>
