<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>Account Register</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label position="stacked">Select Account</ion-label>
          <ion-select v-model="selectedAccountId" interface="popover" placeholder="Choose account..." @ionChange="load(true)">
            <ion-select-option v-for="acct in accounts" :key="acct.id" :value="acct.id">
              {{ acct.code }} — {{ acct.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="!selectedAccountId" class="ion-text-center ion-padding">
        <p>Select an account to view its register</p>
      </div>
      <div v-else-if="loading && !entries.length" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <div v-else>
        <ion-list>
          <ion-item v-for="entry in entries" :key="entry.id">
            <ion-label>
              <h3>{{ entry.description }}</h3>
              <p>{{ entry.date }}</p>
            </ion-label>
            <div slot="end" class="register-amounts">
              <span :class="entry.action === 'DEBIT' ? 'debit' : 'credit'">
                {{ formatAmount(entry) }}
              </span>
              <span class="balance">{{ formatBalance(entry) }}</span>
            </div>
          </ion-item>
        </ion-list>

        <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!hasMore">
          <ion-infinite-scroll-content />
        </ion-infinite-scroll>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/vue';
import { useAccountsStore } from '@/stores/accounts';
import { fetchAccountRegister, type AccountRegisterEntry } from '@/services/reports';
import { toDecimal, formatCurrency } from '@/utils/money';
import { storeToRefs } from 'pinia';

const accountsStore = useAccountsStore();
const { accounts } = storeToRefs(accountsStore);
const selectedAccountId = ref<number | null>(null);
const entries = ref<AccountRegisterEntry[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);

function formatAmount(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.amount_num, entry.amount_denom));
}

function formatBalance(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.balance_num, entry.balance_denom));
}

async function load(reset = false) {
  if (!selectedAccountId.value) return;
  if (reset) {
    page.value = 1;
    entries.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  loading.value = true;
  try {
    const data = await fetchAccountRegister(selectedAccountId.value, page.value);
    entries.value.push(...data);
    hasMore.value = data.length >= 15;
    page.value++;
  } catch { /* offline */ }
  finally { loading.value = false; }
}

async function loadMore(event: CustomEvent) {
  await load();
  (event.target as HTMLIonInfiniteScrollElement).complete();
}

onMounted(() => {
  if (!accounts.value.length) {
    accountsStore.fetchAccounts();
  }
});
</script>

<style scoped>
.register-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
}
.debit { color: var(--ion-color-success); }
.credit { color: var(--ion-color-danger); }
.balance { color: var(--ion-color-medium); font-size: 11px; }
</style>
