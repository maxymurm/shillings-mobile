<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/contacts" />
        </ion-buttons>
        <ion-title>{{ contact?.name ?? 'Contact' }}</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="activeTab" @ionChange="activeTab = ($event.detail.value as string)">
          <ion-segment-button value="info"><ion-label>Info</ion-label></ion-segment-button>
          <ion-segment-button value="transactions"><ion-label>Transactions</ion-label></ion-segment-button>
          <ion-segment-button value="documents"><ion-label>Documents</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!contact" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- Info Tab -->
      <div v-else-if="activeTab === 'info'">
        <ion-card>
          <ion-card-header>
            <ion-chip :color="typeColor(contact.type)">{{ contact.type }}</ion-chip>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item v-if="contact.email">
                <ion-icon :icon="mailOutline" slot="start" />
                <ion-label>{{ contact.email }}</ion-label>
              </ion-item>
              <ion-item v-if="contact.phone">
                <ion-icon :icon="callOutline" slot="start" />
                <ion-label>{{ contact.phone }}</ion-label>
              </ion-item>
              <ion-item v-if="contact.address">
                <ion-icon :icon="locationOutline" slot="start" />
                <ion-label class="ion-text-wrap">{{ contact.address }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Transactions Tab -->
      <div v-else-if="activeTab === 'transactions'">
        <ion-list v-if="transactions.length">
          <ion-item v-for="txn in transactions" :key="txn.id" :router-link="`/tabs/transactions/${txn.id}`" detail>
            <ion-label>
              <h3>{{ txn.description }}</h3>
              <p>{{ txn.post_date }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <div v-else class="ion-text-center ion-padding">
          <p>No transactions</p>
        </div>
      </div>

      <!-- Documents Tab -->
      <div v-else-if="activeTab === 'documents'">
        <ion-list v-if="documents.length">
          <ion-item v-for="doc in documents" :key="doc.id" :router-link="`/tabs/documents/${doc.id}`" detail>
            <ion-label>
              <h3>{{ doc.number }}</h3>
              <p>{{ doc.type }} — {{ doc.issued_at }}</p>
            </ion-label>
            <ion-chip slot="end" :color="statusColor(doc.status)">{{ doc.status }}</ion-chip>
          </ion-item>
        </ion-list>
        <div v-else class="ion-text-center ion-padding">
          <p>No documents</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardContent,
  IonList, IonItem, IonIcon, IonChip, IonSpinner,
} from '@ionic/vue';
import { mailOutline, callOutline, locationOutline } from 'ionicons/icons';
import api from '@/services/api';
import { useContactsStore } from '@/stores/contacts';
import type { Contact, Transaction, Document } from '@/types';

const route = useRoute();
const contactStore = useContactsStore();
const contact = ref<Contact | null>(null);
const transactions = ref<Transaction[]>([]);
const documents = ref<Document[]>([]);
const activeTab = ref('info');

function typeColor(type: string): string {
  switch (type) {
    case 'customer': return 'primary';
    case 'vendor': return 'tertiary';
    case 'employee': return 'success';
    default: return 'medium';
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'draft': return 'medium';
    case 'sent': return 'primary';
    case 'paid': return 'success';
    case 'overdue': return 'danger';
    default: return 'medium';
  }
}

onMounted(async () => {
  const id = Number(route.params.id);
  contact.value = contactStore.getContactById(id) ?? null;

  try {
    if (!contact.value) {
      const response = await api.get(`/contacts/${id}`);
      contact.value = response.data.data ?? response.data;
    }
    const [txnRes, docRes] = await Promise.all([
      api.get(`/contacts/${id}/transactions`).catch(() => ({ data: [] })),
      api.get(`/contacts/${id}/documents`).catch(() => ({ data: [] })),
    ]);
    transactions.value = txnRes.data.data ?? txnRes.data;
    documents.value = docRes.data.data ?? docRes.data;
  } catch { /* offline */ }
});
</script>
