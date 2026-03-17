<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button v-if="selectedAccountId" @click.prevent="clearSelection" default-href="/tabs/reports" />
          <ion-back-button v-else default-href="/tabs/reports" />
        </ion-buttons>
        <ion-title>{{ selectedAccountId ? selectedAccountName : 'Account Register' }}</ion-title>
        <ion-buttons slot="end" v-if="selectedAccountId">
          <ion-button @click="exportCsv" title="Export CSV">
            <ion-icon slot="icon-only" :icon="downloadOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- ═══════════════════════════════════════════════════════════════════
           ACCOUNTS LISTING (Landing View)
           ═══════════════════════════════════════════════════════════════════ -->
      <div v-if="!selectedAccountId" class="accounts-landing">
        <!-- Search bar -->
        <div class="account-search-wrap">
          <ion-searchbar
            v-model="accountSearch"
            placeholder="Search accounts..."
            :debounce="200"
          />
          <ion-chip color="medium" class="account-count-chip">
            {{ filteredAccountCount }} accounts
          </ion-chip>
        </div>

        <div v-if="!accounts.length" class="ion-text-center ion-padding">
          <ion-spinner />
        </div>

        <div v-else>
          <!-- Collapsible type groups -->
          <div
            v-for="group in filteredAccountsByType"
            :key="group.type"
            class="type-group"
          >
            <!-- Group header (clickable to collapse) -->
            <div
              class="type-group-header"
              :class="typeColorClass(group.type)"
              @click="toggleCollapse(group.type)"
            >
              <div class="type-group-left">
                <ion-icon
                  :icon="chevronForwardOutline"
                  class="collapse-icon"
                  :class="{ collapsed: isCollapsed(group.type) }"
                />
                <span class="type-label">{{ group.type }}</span>
                <ion-chip size="small" color="light">{{ group.accounts.length }}</ion-chip>
              </div>
              <span class="type-balance" :class="typeColorClass(group.type)">
                {{ formatGroupBalance(group.accounts) }}
              </span>
            </div>

            <!-- Accounts list (collapsible) -->
            <ion-list v-if="!isCollapsed(group.type)" class="type-group-list">
              <ion-item
                v-for="acct in group.accounts"
                :key="acct.id"
                button
                @click="selectAccount(acct.id)"
                class="account-row"
              >
                <div slot="start" class="account-code-badge">{{ acct.code }}</div>
                <ion-label>
                  <h3 class="account-name">{{ acct.name }}</h3>
                </ion-label>
                <ion-chip slot="end" size="small" color="medium" class="currency-badge">
                  {{ acct.currency?.code || 'USD' }}
                </ion-chip>
                <ion-note slot="end" class="account-balance" :class="balanceColorClass(acct)">
                  {{ formatAccountBalance(acct) }}
                </ion-note>
                <ion-icon slot="end" :icon="chevronForwardOutline" color="medium" />
              </ion-item>
            </ion-list>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════
           REGISTER DETAIL VIEW
           ═══════════════════════════════════════════════════════════════════ -->
      <div v-else class="register-detail">
        <!-- Account header card -->
        <div class="account-header-card" :class="typeColorClass(selectedAccountType)">
          <div class="account-header-left">
            <div class="account-header-code">{{ selectedAccountCode }}</div>
            <div class="account-header-name">{{ selectedAccountName }}</div>
            <ion-chip size="small" :color="typeChipColor(selectedAccountType)">
              {{ selectedAccountType }}
            </ion-chip>
            <ion-chip size="small" color="medium">{{ selectedAccountCurrency }}</ion-chip>
          </div>
          <div class="account-header-right">
            <div class="account-header-balance" :class="balanceColorClass(selectedAccount)">
              {{ formatAccountBalance(selectedAccount) }}
            </div>
            <div class="account-header-stats">
              {{ entries.length }} transactions
            </div>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="filter-bar">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search transactions..."
            :debounce="400"
            @ionInput="load(true)"
          />

          <!-- Date range row -->
          <div class="filter-dates">
            <ion-item lines="none" class="date-item">
              <ion-label>From</ion-label>
              <ion-datetime-button datetime="start-dt" slot="end" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="start-dt" presentation="date" v-model="startDate" @ionChange="load(true)" />
              </ion-modal>
            </ion-item>
            <ion-item lines="none" class="date-item">
              <ion-label>To</ion-label>
              <ion-datetime-button datetime="end-dt" slot="end" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="end-dt" presentation="date" v-model="endDate" @ionChange="load(true)" />
              </ion-modal>
            </ion-item>
          </div>

          <!-- Date presets + unreconciled toggle -->
          <div class="filter-presets">
            <ion-chip
              v-for="preset in datePresets"
              :key="preset.value"
              :color="activePreset === preset.value ? 'success' : 'medium'"
              @click="setDatePreset(preset.value)"
            >
              {{ preset.label }}
            </ion-chip>
            <ion-chip
              :color="unreconciledOnly ? 'warning' : 'medium'"
              @click="toggleUnreconciled"
            >
              Unreconciled
            </ion-chip>
          </div>
        </div>

        <!-- Sort controls -->
        <div class="sort-bar">
          <span class="sort-label">Sort:</span>
          <ion-chip
            v-for="col in sortColumns"
            :key="col.value"
            :color="sortColumn === col.value ? 'success' : 'light'"
            size="small"
            @click="toggleSort(col.value)"
          >
            {{ col.label }}
            <ion-icon
              v-if="sortColumn === col.value"
              :icon="sortDir === 'asc' ? arrowUpOutline : arrowDownOutline"
            />
          </ion-chip>
        </div>

        <!-- Loading / empty states -->
        <div v-if="loading && !entries.length" class="ion-text-center ion-padding">
          <ion-spinner />
        </div>
        <div v-else-if="!entries.length" class="empty-state">
          <ion-icon :icon="folderOpenOutline" />
          <p>No transactions for this account</p>
        </div>

        <!-- Transaction list -->
        <div v-else class="register-list">
          <ion-list>
            <ion-item-sliding v-for="entry in entries" :key="entry.id">
              <ion-item
                class="register-row"
                :class="{
                  'void-row': entry.is_void,
                  'even-row': entries.indexOf(entry) % 2 === 0,
                }"
                button
                @click="showRowActions(entry)"
              >
                <!-- Reconcile indicator (clickable) -->
                <div
                  slot="start"
                  class="reconcile-badge"
                  :class="reconcileClass(entry)"
                  @click.stop="cycleReconcile(entry)"
                >
                  {{ reconcileIcon(entry) }}
                </div>

                <ion-label>
                  <h3 class="entry-description">
                    {{ entry.description }}
                    <span v-if="entry.is_void" class="void-badge">VOID</span>
                    <span v-else-if="entry.is_posted" class="posted-badge">POSTED</span>
                  </h3>
                  <p class="entry-meta">
                    <span class="entry-date">{{ entry.date }}</span>
                    <span v-if="entry.num" class="entry-num">#{{ entry.num }}</span>
                    <span
                      v-if="entry.transfer_account"
                      class="entry-transfer"
                      @click.stop="jumpToAccount(entry.transfer_account_id)"
                    >
                      → {{ entry.transfer_account }}
                    </span>
                  </p>
                </ion-label>

                <div slot="end" class="entry-amounts">
                  <span v-if="entry.action === 'DEBIT'" class="debit-amount">
                    {{ formatAmount(entry) }}
                  </span>
                  <span v-else class="credit-amount">
                    {{ formatAmount(entry) }}
                  </span>
                  <span class="balance-amount" :class="balanceClass(entry)">
                    {{ formatBalance(entry) }}
                  </span>
                </div>
              </ion-item>

              <!-- Slide actions -->
              <ion-item-options side="end">
                <ion-item-option color="primary" @click="editTransaction(entry)">
                  <ion-icon slot="icon-only" :icon="createOutline" />
                </ion-item-option>
                <ion-item-option color="secondary" @click="duplicateEntry(entry)">
                  <ion-icon slot="icon-only" :icon="copyOutline" />
                </ion-item-option>
                <ion-item-option color="warning" @click="voidEntry(entry)" v-if="!entry.is_void">
                  <ion-icon slot="icon-only" :icon="banOutline" />
                </ion-item-option>
                <ion-item-option color="danger" @click="deleteEntry(entry)" v-if="!entry.is_posted">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>

          <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!hasMore">
            <ion-infinite-scroll-content />
          </ion-infinite-scroll>
        </div>

        <!-- Footer tally -->
        <div class="register-footer">
          <div class="footer-stats">
            <span>{{ entries.length }} transactions</span>
            <ion-chip v-if="isFiltered" color="warning" size="small">FILTERED</ion-chip>
          </div>
          <div class="footer-totals">
            <span class="total-debit">Dr: {{ totalDebit }}</span>
            <span class="total-credit">Cr: {{ totalCredit }}</span>
            <span class="total-balance" :class="finalBalanceClass">= {{ finalBalance }}</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
  IonItem, IonLabel, IonNote, IonList, IonSpinner, IonIcon, IonChip,
  IonInfiniteScroll, IonInfiniteScrollContent, IonItemSliding, IonItemOptions, IonItemOption,
  IonSearchbar, IonDatetimeButton, IonDatetime, IonModal,
  alertController, toastController, actionSheetController,
} from '@ionic/vue';
import {
  chevronForwardOutline, downloadOutline, folderOpenOutline,
  arrowUpOutline, arrowDownOutline,
  createOutline, copyOutline, banOutline, trashOutline,
} from 'ionicons/icons';
import { useAccountsStore } from '@/stores/accounts';
import { useRouter } from 'vue-router';
import {
  fetchAccountRegister, toggleReconcileState, voidTransaction,
  duplicateTransaction, deleteTransaction, exportAccountRegisterCsv,
  type AccountRegisterEntry,
} from '@/services/reports';
import { toDecimal, formatCurrency } from '@/utils/money';
import { storeToRefs } from 'pinia';

const router = useRouter();
const accountsStore = useAccountsStore();
const { accounts, accountsByType } = storeToRefs(accountsStore);

// Account list state
const accountSearch = ref('');
const collapsedTypes = ref<Record<string, boolean>>({});

// Register state
const selectedAccountId = ref<number | null>(null);
const entries = ref<AccountRegisterEntry[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);

// Filters
const searchQuery = ref('');
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);
const unreconciledOnly = ref(false);
const activePreset = ref('all');

// Sort
const sortColumn = ref('date');
const sortDir = ref<'asc' | 'desc'>('desc');

const datePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'this_week' },
  { label: 'Month', value: 'this_month' },
  { label: 'Year', value: 'this_year' },
  { label: 'All', value: 'all' },
];

const sortColumns = [
  { label: 'Date', value: 'date' },
  { label: 'Description', value: 'description' },
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
  { label: 'Balance', value: 'balance' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Computed: Account List
// ─────────────────────────────────────────────────────────────────────────────

const filteredAccountsByType = computed(() => {
  const search = accountSearch.value.toLowerCase();
  if (!search) return accountsByType.value;

  return accountsByType.value
    .map((group) => ({
      ...group,
      accounts: group.accounts.filter(
        (a: any) =>
          a.name.toLowerCase().includes(search) ||
          a.code.toLowerCase().includes(search)
      ),
    }))
    .filter((g) => g.accounts.length > 0);
});

const filteredAccountCount = computed(() =>
  filteredAccountsByType.value.reduce((sum, g) => sum + g.accounts.length, 0)
);

// ─────────────────────────────────────────────────────────────────────────────
// Computed: Selected Account
// ─────────────────────────────────────────────────────────────────────────────

const selectedAccount = computed(() =>
  accounts.value.find((a) => a.id === selectedAccountId.value)
);

const selectedAccountName = computed(() => selectedAccount.value?.name ?? 'Account Register');
const selectedAccountCode = computed(() => selectedAccount.value?.code ?? '');
const selectedAccountType = computed(() => selectedAccount.value?.account_type?.classification ?? 'ASSET');
const selectedAccountCurrency = computed(() => (selectedAccount.value as any)?.currency?.code ?? 'USD');

// ─────────────────────────────────────────────────────────────────────────────
// Computed: Filter state
// ─────────────────────────────────────────────────────────────────────────────

const isFiltered = computed(
  () => !!searchQuery.value || !!startDate.value || !!endDate.value || unreconciledOnly.value
);

// ─────────────────────────────────────────────────────────────────────────────
// Computed: Totals
// ─────────────────────────────────────────────────────────────────────────────

const totalDebit = computed(() => {
  const sum = entries.value
    .filter((e) => e.action === 'DEBIT')
    .reduce((acc, e) => acc + toDecimal(e.amount_num, e.amount_denom), 0);
  return formatCurrency(sum);
});

const totalCredit = computed(() => {
  const sum = entries.value
    .filter((e) => e.action === 'CREDIT')
    .reduce((acc, e) => acc + toDecimal(e.amount_num, e.amount_denom), 0);
  return formatCurrency(sum);
});

const finalBalance = computed(() => {
  if (!entries.value.length) return formatCurrency(0);
  const last = entries.value[entries.value.length - 1];
  return formatCurrency(toDecimal(last.balance_num, last.balance_denom));
});

const finalBalanceClass = computed(() => {
  if (!entries.value.length) return '';
  const last = entries.value[entries.value.length - 1];
  const val = toDecimal(last.balance_num, last.balance_denom);
  return val >= 0 ? 'positive' : 'negative';
});

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Collapse / Expand
// ─────────────────────────────────────────────────────────────────────────────

function toggleCollapse(type: string) {
  collapsedTypes.value[type] = !collapsedTypes.value[type];
}

function isCollapsed(type: string) {
  return !!collapsedTypes.value[type];
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Formatting
// ─────────────────────────────────────────────────────────────────────────────

function formatAmount(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.amount_num, entry.amount_denom));
}

function formatBalance(entry: AccountRegisterEntry): string {
  return formatCurrency(toDecimal(entry.balance_num, entry.balance_denom));
}

function formatAccountBalance(acct: { balance_num?: number; balance_denom?: number } | undefined): string {
  if (!acct || acct.balance_num == null || acct.balance_denom == null) return '—';
  return formatCurrency(toDecimal(acct.balance_num, acct.balance_denom));
}

function formatGroupBalance(accts: any[]): string {
  const total = accts.reduce((sum, a) => {
    if (a.balance_num == null || a.balance_denom == null) return sum;
    return sum + toDecimal(a.balance_num, a.balance_denom);
  }, 0);
  return formatCurrency(total);
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Styling helpers
// ─────────────────────────────────────────────────────────────────────────────

function typeColorClass(type: string) {
  const map: Record<string, string> = {
    ASSET: 'type-asset',
    LIABILITY: 'type-liability',
    EQUITY: 'type-equity',
    INCOME: 'type-income',
    EXPENSE: 'type-expense',
  };
  return map[type] || 'type-asset';
}

function typeChipColor(type: string) {
  const map: Record<string, string> = {
    ASSET: 'success',
    LIABILITY: 'danger',
    EQUITY: 'primary',
    INCOME: 'tertiary',
    EXPENSE: 'warning',
  };
  return map[type] || 'medium';
}

function balanceColorClass(acct: any) {
  if (!acct || acct.balance_num == null) return '';
  const val = toDecimal(acct.balance_num, acct.balance_denom);
  return val >= 0 ? 'positive' : 'negative';
}

function balanceClass(entry: AccountRegisterEntry) {
  const val = toDecimal(entry.balance_num, entry.balance_denom);
  return val >= 0 ? 'positive' : 'negative';
}

function reconcileClass(entry: AccountRegisterEntry) {
  const state = entry.reconciled_state || 'n';
  return `reconcile-${state}`;
}

function reconcileIcon(entry: AccountRegisterEntry) {
  const state = entry.reconciled_state || 'n';
  if (state === 'y') return '✓';
  if (state === 'c') return 'c';
  return 'n';
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Account selection
// ─────────────────────────────────────────────────────────────────────────────

function selectAccount(id: number) {
  selectedAccountId.value = id;
  load(true);
}

function clearSelection() {
  selectedAccountId.value = null;
  entries.value = [];
  page.value = 1;
  hasMore.value = true;
  searchQuery.value = '';
  startDate.value = undefined;
  endDate.value = undefined;
  unreconciledOnly.value = false;
  activePreset.value = 'all';
}

function jumpToAccount(accountId: number | undefined) {
  if (!accountId) return;
  clearSelection();
  selectAccount(accountId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Date presets
// ─────────────────────────────────────────────────────────────────────────────

function setDatePreset(preset: string) {
  activePreset.value = preset;
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      startDate.value = today;
      endDate.value = today;
      break;
    case 'this_week': {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      startDate.value = monday.toISOString().split('T')[0];
      endDate.value = today;
      break;
    }
    case 'this_month':
      startDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      endDate.value = today;
      break;
    case 'this_year':
      startDate.value = `${now.getFullYear()}-01-01`;
      endDate.value = today;
      break;
    case 'all':
    default:
      startDate.value = undefined;
      endDate.value = undefined;
      break;
  }
  load(true);
}

function toggleUnreconciled() {
  unreconciledOnly.value = !unreconciledOnly.value;
  load(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Sorting
// ─────────────────────────────────────────────────────────────────────────────

function toggleSort(column: string) {
  if (sortColumn.value === column) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDir.value = 'desc';
  }
  load(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Data loading
// ─────────────────────────────────────────────────────────────────────────────

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
      unreconciled_only: unreconciledOnly.value || undefined,
      sort_column: sortColumn.value,
      sort_dir: sortDir.value,
    });
    entries.value.push(...data);
    hasMore.value = data.length >= 15;
    page.value++;
  } catch {
    /* offline */
  } finally {
    loading.value = false;
  }
}

async function loadMore(event: CustomEvent) {
  await load();
  (event.target as HTMLIonInfiniteScrollElement).complete();
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Row actions
// ─────────────────────────────────────────────────────────────────────────────

async function showRowActions(entry: AccountRegisterEntry) {
  const buttons: any[] = [
    { text: 'Edit', icon: createOutline, handler: () => editTransaction(entry) },
    { text: 'Duplicate', icon: copyOutline, handler: () => duplicateEntry(entry) },
  ];
  if (!entry.is_void) {
    buttons.push({ text: 'Void', icon: banOutline, role: 'destructive', handler: () => voidEntry(entry) });
  }
  if (!entry.is_posted) {
    buttons.push({ text: 'Delete', icon: trashOutline, role: 'destructive', handler: () => deleteEntry(entry) });
  }
  buttons.push({ text: 'Cancel', role: 'cancel' });

  const sheet = await actionSheetController.create({
    header: entry.description,
    buttons,
  });
  await sheet.present();
}

async function cycleReconcile(entry: AccountRegisterEntry) {
  if (!entry.split_id) return;
  const current = entry.reconciled_state || 'n';
  const next = current === 'n' ? 'c' : current === 'c' ? 'y' : 'n';
  try {
    await toggleReconcileState(entry.id, entry.split_id, next);
    entry.reconciled_state = next;
    const toast = await toastController.create({
      message: `Reconcile: ${next === 'y' ? 'Reconciled' : next === 'c' ? 'Cleared' : 'Unreconciled'}`,
      duration: 1500,
      color: 'success',
    });
    await toast.present();
  } catch {
    const toast = await toastController.create({ message: 'Failed to update', duration: 2000, color: 'danger' });
    await toast.present();
  }
}

function editTransaction(entry: AccountRegisterEntry) {
  router.push(`/tabs/transactions/${entry.id}`);
}

async function duplicateEntry(entry: AccountRegisterEntry) {
  try {
    await duplicateTransaction(entry.id);
    const toast = await toastController.create({
      message: 'Transaction duplicated',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    load(true);
  } catch {
    const toast = await toastController.create({ message: 'Failed to duplicate', duration: 2000, color: 'danger' });
    await toast.present();
  }
}

async function voidEntry(entry: AccountRegisterEntry) {
  const alert = await alertController.create({
    header: 'Void Transaction',
    message: 'Enter a reason for voiding this transaction:',
    inputs: [{ name: 'reason', type: 'text', placeholder: 'Reason' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Void',
        role: 'destructive',
        handler: async (data: { reason?: string }) => {
          try {
            await voidTransaction(entry.id, data.reason || 'Voided');
            entry.is_void = true;
            const toast = await toastController.create({
              message: 'Transaction voided',
              duration: 2000,
              color: 'success',
            });
            await toast.present();
          } catch {
            const toast = await toastController.create({ message: 'Failed to void', duration: 2000, color: 'danger' });
            await toast.present();
          }
        },
      },
    ],
  });
  await alert.present();
}

async function deleteEntry(entry: AccountRegisterEntry) {
  const alert = await alertController.create({
    header: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await deleteTransaction(entry.id);
            entries.value = entries.value.filter((e) => e.id !== entry.id);
            const toast = await toastController.create({
              message: 'Transaction deleted',
              duration: 2000,
              color: 'success',
            });
            await toast.present();
          } catch {
            const toast = await toastController.create({ message: 'Failed to delete', duration: 2000, color: 'danger' });
            await toast.present();
          }
        },
      },
    ],
  });
  await alert.present();
}

// ─────────────────────────────────────────────────────────────────────────────
// Methods: Export
// ─────────────────────────────────────────────────────────────────────────────

async function exportCsv() {
  if (!selectedAccountId.value) return;
  try {
    const blob = await exportAccountRegisterCsv(selectedAccountId.value, {
      search: searchQuery.value || undefined,
      start_date: startDate.value?.split('T')[0] || undefined,
      end_date: endDate.value?.split('T')[0] || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `register-${selectedAccountCode.value}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    const toast = await toastController.create({ message: 'CSV exported', duration: 2000, color: 'success' });
    await toast.present();
  } catch {
    const toast = await toastController.create({ message: 'Export failed', duration: 2000, color: 'danger' });
    await toast.present();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!accounts.value.length) {
    accountsStore.fetchAccounts();
  }
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNT REGISTER - DARK MODE SAFE STYLING
   ═══════════════════════════════════════════════════════════════════════════ */

/* Account search */
.account-search-wrap {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  background: var(--ion-background-color);
}
.account-count-chip {
  white-space: nowrap;
  font-size: 12px;
}

/* Type groups */
.type-group {
  margin-bottom: 4px;
}
.type-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: var(--ion-color-light);
  border-left: 4px solid transparent;
}
.type-group-header.type-asset { border-left-color: var(--ion-color-success); background: rgba(var(--ion-color-success-rgb), 0.08); }
.type-group-header.type-liability { border-left-color: var(--ion-color-danger); background: rgba(var(--ion-color-danger-rgb), 0.08); }
.type-group-header.type-equity { border-left-color: var(--ion-color-primary); background: rgba(var(--ion-color-primary-rgb), 0.08); }
.type-group-header.type-income { border-left-color: var(--ion-color-tertiary); background: rgba(var(--ion-color-tertiary-rgb), 0.08); }
.type-group-header.type-expense { border-left-color: var(--ion-color-warning); background: rgba(var(--ion-color-warning-rgb), 0.08); }

.type-group-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.collapse-icon {
  transition: transform 0.2s;
}
.collapse-icon.collapsed {
  transform: rotate(90deg);
}
.type-label {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.type-balance {
  font-weight: 700;
  font-size: 14px;
}
.type-balance.type-asset { color: var(--ion-color-success); }
.type-balance.type-liability { color: var(--ion-color-danger); }
.type-balance.type-equity { color: var(--ion-color-primary); }
.type-balance.type-income { color: var(--ion-color-tertiary); }
.type-balance.type-expense { color: var(--ion-color-warning); }

.type-group-list {
  padding: 0;
}

/* Account rows */
.account-row {
  --padding-start: 12px;
}
.account-code-badge {
  font-family: monospace;
  font-size: 11px;
  background: var(--ion-color-light);
  border: 1px solid var(--ion-color-medium);
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
}
.account-name {
  font-weight: 600;
}
.currency-badge {
  font-size: 10px;
  margin-right: 8px;
}
.account-balance {
  font-weight: 700;
  font-family: monospace;
}
.account-balance.positive { color: var(--ion-color-success); }
.account-balance.negative { color: var(--ion-color-danger); }

/* ═══════════════════════════════════════════════════════════════════════════
   REGISTER DETAIL VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

/* Account header card */
.account-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin: 12px;
  border-radius: 12px;
  background: var(--ion-color-light);
  border-left: 5px solid transparent;
}
.account-header-card.type-asset { border-left-color: var(--ion-color-success); }
.account-header-card.type-liability { border-left-color: var(--ion-color-danger); }
.account-header-card.type-equity { border-left-color: var(--ion-color-primary); }
.account-header-card.type-income { border-left-color: var(--ion-color-tertiary); }
.account-header-card.type-expense { border-left-color: var(--ion-color-warning); }

.account-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.account-header-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--ion-color-medium);
}
.account-header-name {
  font-size: 18px;
  font-weight: 700;
}
.account-header-right {
  text-align: right;
}
.account-header-balance {
  font-size: 22px;
  font-weight: 700;
  font-family: monospace;
}
.account-header-balance.positive { color: var(--ion-color-success); }
.account-header-balance.negative { color: var(--ion-color-danger); }
.account-header-stats {
  font-size: 12px;
  color: var(--ion-color-medium);
}

/* Filter bar */
.filter-bar {
  padding: 0 12px;
}
.filter-dates {
  display: flex;
  gap: 8px;
}
.date-item {
  flex: 1;
  --padding-start: 8px;
  --inner-padding-end: 8px;
}
.filter-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
}

/* Sort bar */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  overflow-x: auto;
}
.sort-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  white-space: nowrap;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--ion-color-medium);
}
.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Register rows */
.register-row {
  --padding-start: 8px;
}
.register-row.void-row {
  opacity: 0.5;
}
.register-row.even-row {
  --background: var(--ion-color-light);
}

/* Reconcile badge */
.reconcile-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 8px;
}
.reconcile-n {
  background: var(--ion-color-light);
  color: var(--ion-color-medium);
  border: 1px solid var(--ion-color-medium);
}
.reconcile-c {
  background: rgba(var(--ion-color-primary-rgb), 0.15);
  color: var(--ion-color-primary);
  border: 1px solid var(--ion-color-primary);
}
.reconcile-y {
  background: var(--ion-color-success);
  color: white;
}

/* Entry content */
.entry-description {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.void-badge {
  font-size: 9px;
  font-weight: 700;
  background: var(--ion-color-danger);
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
}
.posted-badge {
  font-size: 9px;
  font-weight: 700;
  background: var(--ion-color-success);
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
}
.entry-meta {
  font-size: 12px;
  color: var(--ion-color-medium);
  display: flex;
  gap: 8px;
}
.entry-date {
  font-family: monospace;
}
.entry-num {
  color: var(--ion-color-medium-shade);
}
.entry-transfer {
  color: var(--ion-color-primary);
  cursor: pointer;
}

/* Amounts */
.entry-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: monospace;
  font-size: 13px;
}
.debit-amount {
  color: var(--ion-color-primary);
  font-weight: 600;
}
.credit-amount {
  color: var(--ion-color-warning);
  font-weight: 600;
}
.balance-amount {
  font-size: 11px;
}
.balance-amount.positive { color: var(--ion-color-success); }
.balance-amount.negative { color: var(--ion-color-danger); }

/* Footer */
.register-footer {
  position: sticky;
  bottom: 0;
  background: var(--ion-toolbar-background);
  border-top: 2px solid var(--ion-color-light);
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ion-color-medium);
}
.footer-totals {
  display: flex;
  gap: 12px;
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
}
.total-debit { color: var(--ion-color-primary); }
.total-credit { color: var(--ion-color-warning); }
.total-balance.positive { color: var(--ion-color-success); }
.total-balance.negative { color: var(--ion-color-danger); }
</style>
