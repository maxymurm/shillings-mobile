<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Transactions</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showFilter = true">
            <ion-icon slot="icon-only" :icon="funnelOutline" />
          </ion-button>
          <ion-button router-link="/tabs/transactions/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchText" placeholder="Search transactions" @ionInput="handleSearch" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <ion-list>
        <ion-item-sliding v-for="txn in transactionsStore.transactions" :key="txn.id">
          <ion-item :router-link="`/tabs/transactions/${txn.id}`">
            <ion-label>
              <h3>{{ txn.description }}</h3>
              <p>{{ txn.post_date }}</p>
            </ion-label>
            <ion-chip v-if="!txn.is_posted" slot="end" color="warning">Draft</ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="handleDelete(txn.id)">Delete</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!transactionsStore.hasMore">
        <ion-infinite-scroll-content loading-text="Loading more..." />
      </ion-infinite-scroll>

      <ion-text v-if="!transactionsStore.transactions.length && !transactionsStore.loading" color="medium"
        class="ion-padding ion-text-center">
        <p>No transactions found</p>
      </ion-text>

      <TransactionFilterSheet
        :is-open="showFilter"
        :filters="transactionsStore.filters"
        :accounts="accountsStore.accounts"
        @close="showFilter = false"
        @apply="handleApplyFilters"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonSearchbar, IonChip, IonText,
  IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
  IonItemSliding, IonItemOptions, IonItemOption, alertController,
} from '@ionic/vue';
import { addOutline, funnelOutline } from 'ionicons/icons';
import { useTransactionsStore } from '@/stores/transactions';
import { useAccountsStore } from '@/stores/accounts';
import TransactionFilterSheet from '@/components/TransactionFilterSheet.vue';

const transactionsStore = useTransactionsStore();
const accountsStore = useAccountsStore();
const searchText = ref('');
const showFilter = ref(false);

let searchTimeout: ReturnType<typeof setTimeout>;

function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    transactionsStore.filters.search = searchText.value;
    transactionsStore.fetchTransactions(true);
  }, 300);
}

async function handleRefresh(event: CustomEvent) {
  await transactionsStore.fetchTransactions(true);
  (event.target as HTMLIonRefresherElement).complete();
}

async function loadMore(event: CustomEvent) {
  await transactionsStore.fetchTransactions();
  (event.target as HTMLIonInfiniteScrollElement).complete();
}

function handleApplyFilters(filters: typeof transactionsStore.filters) {
  transactionsStore.filters = filters;
  transactionsStore.fetchTransactions(true);
}

async function handleDelete(id: number) {
  const alert = await alertController.create({
    header: 'Delete Transaction',
    message: 'Are you sure? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => transactionsStore.deleteTransaction(id),
      },
    ],
  });
  await alert.present();
}

onMounted(() => {
  transactionsStore.fetchTransactions(true);
  if (!accountsStore.accounts.length) accountsStore.fetchAccounts();
});
</script>
