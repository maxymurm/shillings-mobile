<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/tabs/transactions/${$route.params.id}`" />
        </ion-buttons>
        <ion-title>Edit Transaction</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loaded">
        <form @submit.prevent="handleSubmit">
          <ion-item>
            <ion-input v-model="form.description" label="Description" label-placement="floating" required />
          </ion-item>
          <ion-item>
            <ion-input v-model="form.post_date" type="date" label="Date" label-placement="floating" required />
          </ion-item>
          <ion-item>
            <ion-input v-model="form.reference" label="Reference (optional)" label-placement="floating" />
          </ion-item>
          <ion-item>
            <ion-textarea v-model="form.notes" label="Notes (optional)" label-placement="floating" />
          </ion-item>

          <SplitEditor v-model="splits" />

          <ion-button expand="block" type="submit" :disabled="loading || !canSubmit" class="ion-margin-top">
            {{ loading ? 'Saving...' : 'Update Transaction' }}
          </ion-button>

          <ion-button expand="block" fill="outline" color="danger" class="ion-margin-top" @click="handleDelete">
            Delete Transaction
          </ion-button>
        </form>
      </div>
      <ion-text v-else color="medium" class="ion-text-center">
        <p>Loading...</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonTextarea, IonButton, IonText,
  toastController, alertController,
} from '@ionic/vue';
import SplitEditor from '@/components/SplitEditor.vue';
import type { SplitEntry } from '@/components/SplitEditor.vue';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const loaded = ref(false);

const form = ref({
  description: '',
  post_date: '',
  reference: '',
  notes: '',
});

const splits = ref<SplitEntry[]>([]);

const totalDebits = computed(() =>
  splits.value.filter((s) => s.action === 'DEBIT').reduce((sum, s) => sum + s.amount_num, 0),
);
const totalCredits = computed(() =>
  splits.value.filter((s) => s.action === 'CREDIT').reduce((sum, s) => sum + s.amount_num, 0),
);
const isBalanced = computed(() => totalDebits.value === totalCredits.value && totalDebits.value > 0);
const canSubmit = computed(() =>
  form.value.description && form.value.post_date && isBalanced.value &&
  splits.value.every((s) => s.account_id),
);

onMounted(async () => {
  try {
    const response = await api.get(`/transactions/${route.params.id}`);
    const txn = response.data.data ?? response.data;
    form.value = {
      description: txn.description,
      post_date: txn.post_date,
      reference: txn.reference || '',
      notes: txn.notes || '',
    };
    splits.value = txn.splits.map((s: any) => ({
      account_id: s.account_id,
      accountName: s.account?.name ?? `Account #${s.account_id}`,
      action: s.action,
      amount_num: s.amount_num,
      amount_denom: s.amount_denom,
      memo: s.memo || '',
    }));
    loaded.value = true;
  } catch { /* offline */ }
});

async function handleSubmit() {
  loading.value = true;
  try {
    await api.put(`/transactions/${route.params.id}`, {
      ...form.value,
      splits: splits.value.map((s) => ({
        account_id: s.account_id,
        action: s.action,
        amount_num: s.amount_num,
        amount_denom: s.amount_denom,
        memo: s.memo || null,
      })),
    });
    const toast = await toastController.create({ message: 'Transaction updated', duration: 2000, color: 'success' });
    await toast.present();
    router.back();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message || 'Failed to update',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}

async function handleDelete() {
  const alert = await alertController.create({
    header: 'Delete Transaction',
    message: 'Are you sure? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await api.delete(`/transactions/${route.params.id}`);
            const toast = await toastController.create({ message: 'Transaction deleted', duration: 2000 });
            await toast.present();
            router.replace('/tabs/transactions');
          } catch {
            const toast = await toastController.create({ message: 'Failed to delete', duration: 3000, color: 'danger' });
            await toast.present();
          }
        },
      },
    ],
  });
  await alert.present();
}
</script>
