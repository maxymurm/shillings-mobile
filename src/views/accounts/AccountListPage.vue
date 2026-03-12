<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accounts</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/accounts/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
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
            <h3 :style="{ paddingLeft: (account.depth ?? 0) * 16 + 'px' }">{{ account.name }}</h3>
            <p>{{ account.code }}</p>
          </ion-label>
          <ion-note slot="end">{{ formatAmount(account.balance_num ?? 0) }}</ion-note>
        </ion-item>
      </ion-list>
      <ion-text v-if="!filteredGroups.length && !accountsStore.loading" color="medium" class="ion-padding ion-text-center">
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
  IonRefresher, IonRefresherContent, IonButtons, IonButton, IonIcon,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useAccountsStore } from '@/stores/accounts';
import { formatCurrency } from '@/utils/money';

const accountsStore = useAccountsStore();
const search = ref('');

interface FlatAccount {
  id: number;
  name: string;
  code?: string;
  balance_num?: number;
  account_type?: { classification: string };
  depth: number;
}

function flattenHierarchy(accounts: any[], parentId: number | null = null, depth = 0): FlatAccount[] {
  const result: FlatAccount[] = [];
  const children = accounts.filter((a) => (a.parent_id ?? null) === parentId);
  for (const child of children) {
    result.push({ ...child, depth });
    result.push(...flattenHierarchy(accounts, child.id, depth + 1));
  }
  return result;
}

const filteredGroups = computed(() => {
  const types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  const query = search.value.toLowerCase();
  const all = accountsStore.accounts;
  return types
    .map((type) => {
      const typeAccounts = all.filter((a) => a.account_type?.classification === type);
      const flat = flattenHierarchy(typeAccounts);
      return {
        type,
        accounts: flat.filter(
          (a) => a.name.toLowerCase().includes(query) || a.code?.toLowerCase().includes(query),
        ),
      };
    })
    .filter((g) => g.accounts.length > 0);
});

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

async function handleRefresh(event: CustomEvent) {
  await accountsStore.fetchAccounts();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(() => {
  if (!accountsStore.accounts.length) accountsStore.fetchAccounts();
});
</script>
