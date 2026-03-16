<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="!selectMode">Transactions</ion-title>
        <ion-title v-else>{{ selectedIds.length }} selected</ion-title>
        <ion-buttons slot="start" v-if="selectMode">
          <ion-button @click="exitSelectMode">Cancel</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button v-if="selectMode && selectedIds.length > 0" @click="selectAll">All</ion-button>
          <ion-button v-if="!selectMode" @click="showFilter = true">
            <ion-icon slot="icon-only" :icon="funnelOutline" />
          </ion-button>
          <ion-button v-if="!selectMode" router-link="/tabs/transactions/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar v-if="!selectMode">
        <ion-searchbar v-model="searchText" placeholder="Search transactions" @ionInput="handleSearch" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh" :disabled="selectMode">
        <ion-refresher-content />
      </ion-refresher>

      <ion-list>
        <ion-item v-for="txn in transactionsStore.transactions" :key="txn.id"
          :button="true"
          @click="selectMode ? toggleSelection(txn.id) : undefined"
          :router-link="selectMode ? undefined : `/tabs/transactions/${txn.id}`"
          @contextmenu.prevent="enterSelectMode(txn.id)"
        >
          <ion-checkbox v-if="selectMode" slot="start" :checked="selectedIds.includes(txn.id)"
            @ionChange="toggleSelection(txn.id)" />
          <ion-label>
            <h3>{{ txn.description }}</h3>
            <p>{{ txn.post_date }}</p>
          </ion-label>
          <ion-chip v-if="!txn.is_posted" slot="end" color="warning">Draft</ion-chip>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!transactionsStore.hasMore || selectMode">
        <ion-infinite-scroll-content loading-text="Loading more..." />
      </ion-infinite-scroll>

      <ion-text v-if="!transactionsStore.transactions.length && !transactionsStore.loading" color="medium"
        class="ion-padding ion-text-center">
        <p>No transactions found</p>
      </ion-text>

      <!-- Bulk action bar -->
      <div v-if="selectMode && selectedIds.length > 0" class="bulk-action-bar">
        <ion-button fill="solid" color="success" size="small" @click="bulkAction('post')">Post</ion-button>
        <ion-button fill="solid" color="warning" size="small" @click="bulkAction('void')">Void</ion-button>
        <ion-button fill="solid" color="danger" size="small" @click="bulkAction('delete')">Delete</ion-button>
      </div>

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
  IonIcon, IonList, IonItem, IonLabel, IonSearchbar, IonChip, IonText, IonCheckbox,
  IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
  alertController, toastController,
} from '@ionic/vue';
import { addOutline, funnelOutline } from 'ionicons/icons';
import { useTransactionsStore } from '@/stores/transactions';
import { useAccountsStore } from '@/stores/accounts';
import TransactionFilterSheet from '@/components/TransactionFilterSheet.vue';
import api from '@/services/api';

const transactionsStore = useTransactionsStore();
const accountsStore = useAccountsStore();
const searchText = ref('');
const showFilter = ref(false);
const selectMode = ref(false);
const selectedIds = ref<number[]>([]);

function enterSelectMode(id: number) {
  selectMode.value = true;
  selectedIds.value = [id];
}

function exitSelectMode() {
  selectMode.value = false;
  selectedIds.value = [];
}

function toggleSelection(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) selectedIds.value.splice(idx, 1);
  else selectedIds.value.push(id);
}

function selectAll() {
  selectedIds.value = transactionsStore.transactions.map((t: any) => t.id);
}

async function bulkAction(action: 'post' | 'void' | 'delete') {
  const alert = await alertController.create({
    header: `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedIds.value.length} transactions?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Confirm',
        role: 'destructive',
        handler: async () => {
          try {
            const response = await api.post('/transactions/bulk', {
              action,
              transaction_ids: selectedIds.value,
            });
            const data = response.data;
            const toast = await toastController.create({
              message: `${data.success?.length ?? 0} succeeded, ${data.failed?.length ?? 0} failed`,
              duration: 3000,
              color: (data.failed?.length ?? 0) > 0 ? 'warning' : 'success',
            });
            await toast.present();
            exitSelectMode();
            transactionsStore.fetchTransactions(true);
          } catch {
            const toast = await toastController.create({ message: 'Bulk action failed', duration: 3000, color: 'danger' });
            await toast.present();
          }
        },
      },
    ],
  });
  await alert.present();
}

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

onMounted(() => {
  transactionsStore.fetchTransactions(true);
  if (!accountsStore.accounts.length) accountsStore.fetchAccounts();
});
</script>

<style scoped>
.bulk-action-bar {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background: var(--ion-background-color, #fff);
  border-top: 1px solid var(--ion-color-light);
  z-index: 10;
  justify-content: center;
}
</style>
