<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list>
        <ion-item v-for="contact in contacts" :key="contact.id">
          <ion-label>
            <h3>{{ contact.name }}</h3>
            <p>{{ contact.type }} — {{ contact.email ?? '' }}</p>
          </ion-label>
        </ion-item>
        <ion-item v-if="!contacts.length">
          <ion-label color="medium">No contacts found</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent,
} from '@ionic/vue';
import api from '@/services/api';
import type { Contact } from '@/types';

const contacts = ref<Contact[]>([]);

async function fetchContacts() {
  try {
    const response = await api.get('/contacts');
    contacts.value = response.data.data ?? response.data;
  } catch { /* offline */ }
}

async function handleRefresh(event: CustomEvent) {
  await fetchContacts();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(fetchContacts);
</script>
