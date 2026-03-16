<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/transactions" />
        </ion-buttons>
        <ion-title>New Transaction</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
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

        <ion-item-group>
          <ion-item-divider><ion-label>Receipt (optional)</ion-label></ion-item-divider>
          <ion-item v-if="receiptPreview">
            <ion-thumbnail slot="start">
              <img :src="receiptPreview" alt="Receipt" />
            </ion-thumbnail>
            <ion-button fill="clear" color="danger" slot="end" @click="receiptPreview = null; receiptData = null">
              Remove
            </ion-button>
          </ion-item>
          <ion-item v-else>
            <ion-button fill="outline" size="small" @click="takePhoto">
              <ion-icon :icon="cameraOutline" slot="start" /> Camera
            </ion-button>
            <ion-button fill="outline" size="small" @click="choosePhoto" style="margin-left: 8px">
              <ion-icon :icon="imageOutline" slot="start" /> Gallery
            </ion-button>
          </ion-item>
        </ion-item-group>

        <ion-button expand="block" type="submit" :disabled="loading || !canSubmit" class="ion-margin-top">
          {{ loading ? 'Saving...' : 'Save Transaction' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonTextarea, IonButton, IonItemGroup, IonItemDivider,
  IonLabel, IonThumbnail, IonIcon, toastController,
} from '@ionic/vue';
import { cameraOutline, imageOutline } from 'ionicons/icons';
import SplitEditor from '@/components/SplitEditor.vue';
import type { SplitEntry } from '@/components/SplitEditor.vue';
import { captureReceipt, pickFromGallery } from '@/services/camera';
import api from '@/services/api';

const router = useRouter();
const loading = ref(false);
const form = ref({
  description: '',
  post_date: new Date().toISOString().split('T')[0],
  reference: '',
  notes: '',
});

const splits = ref<SplitEntry[]>([
  { account_id: null, accountName: '', action: 'DEBIT' as const, amount_num: 0, amount_denom: 100, memo: '' },
  { account_id: null, accountName: '', action: 'CREDIT' as const, amount_num: 0, amount_denom: 100, memo: '' },
]);

const receiptPreview = ref<string | null>(null);
const receiptData = ref<string | null>(null);

async function takePhoto() {
  const base64 = await captureReceipt();
  if (base64) { receiptData.value = base64; receiptPreview.value = `data:image/jpeg;base64,${base64}`; }
}

async function choosePhoto() {
  const base64 = await pickFromGallery();
  if (base64) { receiptData.value = base64; receiptPreview.value = `data:image/jpeg;base64,${base64}`; }
}

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

async function handleSubmit() {
  loading.value = true;
  try {
    await api.post('/transactions', {
      ...form.value,
      receipt_image: receiptData.value || undefined,
      splits: splits.value.map((s) => ({
        account_id: s.account_id,
        action: s.action,
        amount_num: s.amount_num,
        amount_denom: s.amount_denom,
        memo: s.memo || null,
      })),
    });
    const toast = await toastController.create({ message: 'Transaction saved', duration: 2000, color: 'success' });
    await toast.present();
    router.back();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message || 'Failed to save',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}
</script>
