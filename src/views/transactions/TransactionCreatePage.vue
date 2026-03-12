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

        <ion-text color="medium" class="ion-padding-top">
          <p>Splits will be implemented in Phase 5</p>
        </ion-text>

        <ion-button expand="block" type="submit" :disabled="loading" class="ion-margin-top">
          {{ loading ? 'Saving...' : 'Save Transaction' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonButton, IonText, toastController,
} from '@ionic/vue';
import api from '@/services/api';

const router = useRouter();
const loading = ref(false);
const form = ref({
  description: '',
  post_date: new Date().toISOString().split('T')[0],
});

async function handleSubmit() {
  loading.value = true;
  try {
    await api.post('/transactions', form.value);
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
