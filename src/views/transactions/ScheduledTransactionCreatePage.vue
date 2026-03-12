<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/scheduled" />
        </ion-buttons>
        <ion-title>New Scheduled Transaction</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input v-model="form.description" label="Description" label-placement="stacked" placeholder="Rent, Salary, etc." required />
        </ion-item>
        <ion-item>
          <ion-select v-model="form.frequency" label="Frequency" label-placement="stacked" interface="popover">
            <ion-select-option value="daily">Daily</ion-select-option>
            <ion-select-option value="weekly">Weekly</ion-select-option>
            <ion-select-option value="monthly">Monthly</ion-select-option>
            <ion-select-option value="yearly">Yearly</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input v-model="form.next_due_date" label="Next Due Date" label-placement="stacked" type="date" required />
        </ion-item>
        <ion-item>
          <ion-input v-model="form.amount" label="Amount" label-placement="stacked" type="number" step="0.01" placeholder="0.00" />
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" :disabled="!form.description || saving" @click="save">
        <ion-spinner v-if="saving" name="crescent" />
        <span v-else>Create</span>
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSpinner,
} from '@ionic/vue';
import { useScheduledTransactionsStore } from '@/stores/scheduledTransactions';
import { fromDecimal } from '@/utils/money';

const router = useRouter();
const store = useScheduledTransactionsStore();
const saving = ref(false);

const form = ref({
  description: '',
  frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  next_due_date: new Date().toISOString().split('T')[0],
  amount: '0',
});

async function save() {
  saving.value = true;
  try {
    const fraction = fromDecimal(Number(form.value.amount));
    await store.createScheduled({
      description: form.value.description,
      frequency: form.value.frequency,
      next_due_date: form.value.next_due_date,
      amount_num: fraction.amount_num,
      amount_denom: fraction.amount_denom,
      enabled: true,
    });
    router.back();
  } finally {
    saving.value = false;
  }
}
</script>
