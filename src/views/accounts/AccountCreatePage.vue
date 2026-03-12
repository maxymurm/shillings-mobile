<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/accounts" />
        </ion-buttons>
        <ion-title>New Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <ion-item>
          <ion-input v-model="form.name" label="Account Name" label-placement="floating" required />
        </ion-item>

        <ion-item>
          <ion-input v-model="form.code" label="Account Code" label-placement="floating" />
        </ion-item>

        <ion-item>
          <ion-select v-model="form.account_type_id" label="Account Type" label-placement="floating">
            <ion-select-option v-for="t in accountTypes" :key="t.id" :value="t.id">
              {{ t.classification }} — {{ t.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-select v-model="form.parent_id" label="Parent Account (optional)" label-placement="floating">
            <ion-select-option :value="null">None (Top Level)</ion-select-option>
            <ion-select-option v-for="a in parentOptions" :key="a.id" :value="a.id">
              {{ a.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-textarea v-model="form.description" label="Description" label-placement="floating" />
        </ion-item>

        <ion-button expand="block" type="submit" :disabled="loading" class="ion-margin-top">
          {{ loading ? 'Creating...' : 'Create Account' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton,
  toastController,
} from '@ionic/vue';
import { useAccountsStore } from '@/stores/accounts';

const router = useRouter();
const accountsStore = useAccountsStore();
const loading = ref(false);

const form = ref({
  name: '',
  code: '',
  account_type_id: undefined as number | undefined,
  parent_id: undefined as number | undefined,
  description: '',
});

const accountTypes = computed(() => accountsStore.accountTypes);
const parentOptions = computed(() => accountsStore.accounts);

onMounted(() => {
  if (!accountsStore.accountTypes.length) accountsStore.fetchAccountTypes();
  if (!accountsStore.accounts.length) accountsStore.fetchAccounts();
});

async function handleSubmit() {
  loading.value = true;
  try {
    await accountsStore.createAccount(form.value);
    const toast = await toastController.create({ message: 'Account created', duration: 2000, color: 'success' });
    await toast.present();
    router.back();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message || 'Failed to create account',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}
</script>
