<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/budgets" />
        </ion-buttons>
        <ion-title>New Budget</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button @click="showAccountPicker = true">
          <ion-label>
            <p>Account</p>
            <h3>{{ selectedAccount?.name ?? 'Select account...' }}</h3>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-input v-model="form.period" label="Period" label-placement="stacked" placeholder="2026-Q1, 2026-03, etc." />
        </ion-item>
        <ion-item>
          <ion-input v-model="form.amount" label="Budget Amount" label-placement="stacked" type="number" step="0.01" placeholder="0.00" />
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" :disabled="!selectedAccount || saving" @click="save">
        <ion-spinner v-if="saving" name="crescent" />
        <span v-else>Create Budget</span>
      </ion-button>

      <AccountPicker :is-open="showAccountPicker" @close="showAccountPicker = false" @select="onAccountSelect" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner,
} from '@ionic/vue';
import AccountPicker from '@/components/AccountPicker.vue';
import { useBudgetsStore } from '@/stores/budgets';
import { fromDecimal } from '@/utils/money';
import type { Account } from '@/types';

const router = useRouter();
const store = useBudgetsStore();
const saving = ref(false);
const showAccountPicker = ref(false);
const selectedAccount = ref<Account | null>(null);

const form = ref({ period: '', amount: '0' });

function onAccountSelect(account: Account) {
  selectedAccount.value = account;
  showAccountPicker.value = false;
}

async function save() {
  if (!selectedAccount.value) return;
  saving.value = true;
  try {
    const fraction = fromDecimal(Number(form.value.amount));
    await store.createBudget({
      account_id: selectedAccount.value.id,
      period: form.value.period,
      budgeted_num: fraction.amount_num,
      budgeted_denom: fraction.amount_denom,
    });
    router.back();
  } finally {
    saving.value = false;
  }
}
</script>
