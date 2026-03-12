<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accounts</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="search" placeholder="Search accounts" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list v-for="group in filteredGroups" :key="group.type">
        <ion-list-header>
          <ion-label>{{ group.type }}</ion-label>
        </ion-list-header>
        <ion-item v-for="account in group.accounts" :key="account.id" :router-link="`/tabs/accounts/${account.id}`">
          <ion-label>
            <h3>{{ account.name }}</h3>
            <p>{{ account.code }}</p>
          </ion-label>
          <ion-note slot="end">{{ formatAmount(account.balance_num ?? 0) }}</ion-note>
        </ion-item>
      </ion-list>
      <ion-text v-if="!filteredGroups.length" color="medium" class="ion-padding ion-text-center">
        <p>No accounts found</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText,
  IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import api from '@/services/api';
import { formatCurrency } from '@/utils/money';
import type { Account } from '@/types';

const search = ref('');
const accounts = ref<Account[]>([]);

const filteredGroups = computed(() => {
  const types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  const query = search.value.toLowerCase();
  return types
    .map((type) => ({
      type,
      accounts: accounts.value.filter(
        (a) => a.account_type?.classification === type &&
          (a.name.toLowerCase().includes(query) || a.code?.toLowerCase().includes(query)),
      ),
    }))
    .filter((g) => g.accounts.length > 0);
});

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

async function fetchAccounts() {
  try {
    const response = await api.get('/accounts');
    accounts.value = response.data.data ?? response.data;
  } catch { /* offline */ }
}

async function handleRefresh(event: CustomEvent) {
  await fetchAccounts();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(fetchAccounts);
</script>
