<template>
  <ion-modal :is-open="isOpen" @did-dismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Filter Transactions</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-input v-model="localFilters.date_from" type="date" label="From Date" label-placement="floating" />
      </ion-item>
      <ion-item>
        <ion-input v-model="localFilters.date_to" type="date" label="To Date" label-placement="floating" />
      </ion-item>
      <ion-item>
        <ion-select v-model="localFilters.status" label="Status" label-placement="floating">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option value="posted">Posted</ion-select-option>
          <ion-select-option value="draft">Draft</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-select v-model="localFilters.account_id" label="Account" label-placement="floating">
          <ion-select-option :value="null">All Accounts</ion-select-option>
          <ion-select-option v-for="a in accounts" :key="a.id" :value="a.id">
            {{ a.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" @click="applyFilters">Apply Filters</ion-button>
      <ion-button expand="block" fill="clear" @click="clearFilters">Clear Filters</ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonItem, IonInput, IonSelect, IonSelectOption,
} from '@ionic/vue';
import type { Account } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  filters: {
    account_id: number | null;
    date_from: string;
    date_to: string;
    search: string;
    status: '' | 'posted' | 'draft';
  };
  accounts: Account[];
}>();

const emit = defineEmits<{
  close: [];
  apply: [filters: typeof props.filters];
}>();

const localFilters = ref({ ...props.filters });
watch(() => props.filters, (v) => { localFilters.value = { ...v }; });

function applyFilters() {
  emit('apply', { ...localFilters.value });
  emit('close');
}

function clearFilters() {
  localFilters.value = { account_id: null, date_from: '', date_to: '', search: '', status: '' };
  emit('apply', { ...localFilters.value });
  emit('close');
}
</script>
