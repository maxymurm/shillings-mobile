<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Trial Balance</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
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
      <div v-else-if="rows.length">
        <div class="table-header">
          <span class="col-code">Code</span>
          <span class="col-name">Account</span>
          <span class="col-amount">Debit</span>
          <span class="col-amount">Credit</span>
        </div>
        <div v-for="row in rows" :key="row.account_id" class="table-row">
          <span class="col-code">{{ row.account_code }}</span>
          <span class="col-name">{{ row.account_name }}</span>
          <span class="col-amount debit">{{ row.debit ? formatCurrency(row.debit) : '' }}</span>
          <span class="col-amount credit">{{ row.credit ? formatCurrency(row.credit) : '' }}</span>
        </div>
        <div class="table-footer">
          <span class="col-code"></span>
          <span class="col-name"><strong>Total</strong></span>
          <span class="col-amount debit"><strong>{{ formatCurrency(totalDebit) }}</strong></span>
          <span class="col-amount credit"><strong>{{ formatCurrency(totalCredit) }}</strong></span>
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
  IonSpinner, IonRefresher, IonRefresherContent, IonSearchbar,
} from '@ionic/vue';
import { fetchTrialBalance, type TrialBalanceRow } from '@/services/reports';
import { formatCurrency } from '@/utils/money';

const loading = ref(false);
const rows = ref<TrialBalanceRow[]>([]);
const searchQuery = ref('');

const totalDebit = computed(() => rows.value.reduce((sum, r) => sum + r.debit, 0));
const totalCredit = computed(() => rows.value.reduce((sum, r) => sum + r.credit, 0));

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchTrialBalance({
      search: searchQuery.value || undefined,
    });
  }
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
.table-header, .table-row, .table-footer {
  display: grid;
  grid-template-columns: 60px 1fr 80px 80px;
  padding: 8px 16px;
  font-size: 13px;
}
.table-header { font-weight: bold; border-bottom: 2px solid var(--ion-color-medium); }
.table-row { border-bottom: 1px solid var(--ion-color-light-shade); }
.table-footer { border-top: 2px solid var(--ion-color-dark); }
.col-amount { text-align: right; }
.debit { color: var(--ion-color-success); }
.credit { color: var(--ion-color-danger); }
</style>
