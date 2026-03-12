<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/accounts" />
        </ion-buttons>
        <ion-title>{{ account?.name ?? 'Account' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="account">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ account.account_type?.classification }}</ion-card-subtitle>
            <ion-card-title>{{ formatAmount(account.balance_num ?? 0) }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p v-if="account.description">{{ account.description }}</p>
            <p>Code: {{ account.code }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Sub-accounts -->
        <div v-if="children.length">
          <ion-list-header>
            <ion-label>Sub-Accounts</ion-label>
          </ion-list-header>
          <ion-list>
            <ion-item v-for="child in children" :key="child.id" :router-link="`/tabs/accounts/${child.id}`">
              <ion-label>{{ child.name }}</ion-label>
              <ion-note slot="end">{{ formatAmount(child.balance_num ?? 0) }}</ion-note>
            </ion-item>
          </ion-list>
        </div>

        <!-- Recent Splits -->
        <ion-list-header>
          <ion-label>Recent Transactions</ion-label>
        </ion-list-header>
        <ion-list>
          <ion-item v-for="split in recentSplits" :key="split.id"
            :router-link="`/tabs/transactions/${split.transaction_id}`">
            <ion-label>
              <h3>{{ split.transaction?.description ?? 'Transaction' }}</h3>
              <p>{{ split.transaction?.post_date }}</p>
            </ion-label>
            <ion-note slot="end" :color="split.amount_num >= 0 ? 'success' : 'danger'">
              {{ formatAmount(split.amount_num) }}
            </ion-note>
          </ion-item>
          <ion-item v-if="!recentSplits.length">
            <ion-label color="medium">No transactions yet</ion-label>
          </ion-item>
        </ion-list>
      </div>
      <ion-text v-else color="medium" class="ion-text-center">
        <p>Loading...</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText,
} from '@ionic/vue';
import api from '@/services/api';
import { formatCurrency } from '@/utils/money';
import type { Account, Split } from '@/types';

const route = useRoute();
const account = ref<Account | null>(null);
const children = ref<Account[]>([]);
const recentSplits = ref<Split[]>([]);

function formatAmount(num: number): string {
  return formatCurrency(num, 100);
}

onMounted(async () => {
  const id = route.params.id;
  try {
    const [acctRes, splitsRes] = await Promise.all([
      api.get(`/accounts/${id}`),
      api.get(`/accounts/${id}/splits`, { params: { per_page: 10 } }).catch(() => ({ data: { data: [] } })),
    ]);
    account.value = acctRes.data.data ?? acctRes.data;
    recentSplits.value = splitsRes.data.data ?? splitsRes.data ?? [];
    // Fetch children
    const childrenRes = await api.get('/accounts', { params: { parent_id: id } }).catch(() => ({ data: { data: [] } }));
    children.value = (childrenRes.data.data ?? childrenRes.data ?? []).filter(
      (a: Account) => a.parent_id === Number(id),
    );
  } catch { /* offline */ }
});
</script>
