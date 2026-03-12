<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/contacts" />
        </ion-buttons>
        <ion-title>New Contact</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-select v-model="form.type" label="Type" label-placement="stacked" interface="popover">
            <ion-select-option value="customer">Customer</ion-select-option>
            <ion-select-option value="vendor">Vendor</ion-select-option>
            <ion-select-option value="employee">Employee</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input v-model="form.name" label="Name" label-placement="stacked" placeholder="Full name" required />
        </ion-item>
        <ion-item>
          <ion-input v-model="form.email" label="Email" label-placement="stacked" type="email" placeholder="email@example.com" />
        </ion-item>
        <ion-item>
          <ion-input v-model="form.phone" label="Phone" label-placement="stacked" type="tel" placeholder="+1 234 567 890" />
        </ion-item>
        <ion-item>
          <ion-textarea v-model="form.address" label="Address" label-placement="stacked" placeholder="Street, City, State, ZIP" :rows="3" />
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" :disabled="!form.name || saving" @click="save">
        <ion-spinner v-if="saving" name="crescent" />
        <span v-else>Save Contact</span>
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonList, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonButton, IonSpinner,
} from '@ionic/vue';
import { useContactsStore } from '@/stores/contacts';

const router = useRouter();
const store = useContactsStore();
const saving = ref(false);

const form = ref({
  name: '',
  type: 'customer' as 'customer' | 'vendor' | 'employee',
  email: '',
  phone: '',
  address: '',
});

async function save() {
  saving.value = true;
  try {
    await store.createContact({
      name: form.value.name,
      type: form.value.type,
      email: form.value.email || null,
      phone: form.value.phone || null,
      address: form.value.address || null,
    });
    router.back();
  } finally {
    saving.value = false;
  }
}
</script>
