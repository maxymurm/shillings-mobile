<template>
  <ion-modal :is-open="isOpen" @did-dismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Account</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="search" placeholder="Search accounts" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <template v-for="group in filteredGroups" :key="group.type">
          <ion-list-header>
            <ion-label>{{ group.type }}</ion-label>
          </ion-list-header>
          <ion-item v-for="account in group.accounts" :key="account.id" button
            @click="selectAccount(account)">
            <ion-label>{{ account.name }}</ion-label>
            <ion-note slot="end">{{ account.code }}</ion-note>
          </ion-item>
        </template>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonSearchbar, IonList, IonListHeader, IonItem, IonLabel, IonNote,
} from '@ionic/vue';
import { useAccountsStore } from '@/stores/accounts';
import type { Account } from '@/types';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{
  close: [];
  select: [account: Account];
}>();

const accountsStore = useAccountsStore();
const search = ref('');

const filteredGroups = computed(() => {
  const types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  const query = search.value.toLowerCase();
  return types
    .map((type) => ({
      type,
      accounts: accountsStore.accounts.filter(
        (a) => a.account_type?.classification === type &&
          (a.name.toLowerCase().includes(query) || a.code?.toLowerCase().includes(query)),
      ),
    }))
    .filter((g) => g.accounts.length > 0);
});

function selectAccount(account: Account) {
  emit('select', account);
  emit('close');
}

onMounted(() => {
  if (!accountsStore.accounts.length) accountsStore.fetchAccounts();
});
</script>
