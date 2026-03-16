<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button v-if="selectedAccountId" @click.prevent="clearSelection" default-href="/tabs/reports" />
          <ion-back-button v-else default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>{{ selectedAccountId ? selectedAccountName : 'Account Register' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Account listing (landing view) -->
      <div v-if="!selectedAccountId">
        <div v-if="!accounts.length" class="ion-text-center ion-padding">
          <ion-spinner />
        </div>
        <div v-else>
          <div v-for="group in accountsByType" :key="group.type">
            <ion-list-header>
              <ion-label color="medium">{{ group.type }}</ion-label>
            </ion-list-header>
            <ion-list>
              <ion-item v-for="acct in group.accounts" :key="acct.id" button @click="selectAccount(acct.id)">
                <ion-label>
                  <h3>{{ acct.code }} — {{ acct.name }}</h3>
                </ion-label>
                <ion-note slot="end">{{ formatAccountBalance(acct) }}</ion-note>
              </ion-item>
            </ion-list>
          </div>
        </div>
      </div>

      <!-- Register detail view -->
      <div v-else>
        <ion-toolbar>
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search transactions..."
            :debounce="400"
            @ionInput="load(true)"
          />
        </ion-toolbar>
        <ion-toolbar>
          <ion-item lines="none">
            <ion-label>From</ion-label>
            <ion-datetime-button datetime="start-dt" slot="end" />
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="start-dt" presentation="date" v-model="startDate" @ionChange="load(true)" />
            </ion-modal>
          </ion-item>
          <ion-item lines="none">
            <ion-label>To</ion-label>
            <ion-datetime-button datetime="end-dt" slot="end" />
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="end-dt" presentation="date" v-model="endDate" @ionChange="load(true)" />
            </ion-modal>
          </ion-item>
        </ion-toolbar>

        <div v-if="loading && !entries.length" class="ion-text-center ion-padding">
          <ion-spinner />
        </div>
        <div v-else-if="!entries.length" class="ion-text-center ion-padding">
          <p>No transactions for this account</p>
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
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonLabel, IonNote, IonList, IonListHeader, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonSearchbar, IonDatetimeButton, IonDatetime, IonModal,
} from '@ionic/vue';
import { useAccountsStore } from '@/stores/accounts';
import { fetchAccountRegister, type AccountRegisterEntry } from '@/services/reports';
import { toDecimal, formatCurrency } from '@/utils/money';
import { storeToRefs } from 'pinia';

const accountsStore = useAccountsStore();
const { accounts, accountsByType } = storeToRefs(accountsStore);
const selectedAccountId = ref<number | null>(null);
const entries = ref<AccountRegisterEntry[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const searchQuery = ref('');
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

const selectedAccountName = computed(() => {
  const acct = accounts.value.find(a => a.id === selectedAccountId.value);
  return acct ? `${acct.code} — ${acct.name}` : 'Account Register';
});

function formatAmount(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.amount_num, entry.amount_denom));
}

function formatBalance(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.balance_num, entry.balance_denom));
}

function formatAccountBalance(acct: { balance_num?: number; balance_denom?: number }): string {
  if (acct.balance_num == null || acct.balance_denom == null) return '—';
  return formatCurrency(toDecimal(acct.balance_num, acct.balance_denom));
}

function selectAccount(id: number) {
  selectedAccountId.value = id;
  load(true);
}

function clearSelection() {
  selectedAccountId.value = null;
  entries.value = [];
  page.value = 1;
  hasMore.value = true;
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
    const data = await fetchAccountRegister(selectedAccountId.value, page.value, {
      search: searchQuery.value || undefined,
      start_date: startDate.value?.split('T')[0] || undefined,
      end_date: endDate.value?.split('T')[0] || undefined,
    });
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
