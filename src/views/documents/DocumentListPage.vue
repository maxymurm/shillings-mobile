<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>Documents</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="typeFilter" @ionChange="typeFilter = ($event.detail.value as string)">
          <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
          <ion-segment-button value="invoice"><ion-label>Invoices</ion-label></ion-segment-button>
          <ion-segment-button value="bill"><ion-label>Bills</ion-label></ion-segment-button>
          <ion-segment-button value="quote"><ion-label>Quotes</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <ion-list>
        <ion-item
          v-for="doc in filteredDocs"
          :key="doc.id"
          :router-link="`/tabs/documents/${doc.id}`"
          detail
        >
          <ion-label>
            <h3>{{ doc.number }}</h3>
            <p>{{ doc.contact?.name ?? '' }} — {{ doc.issued_at }}</p>
          </ion-label>
          <div slot="end" class="doc-badges">
            <ion-chip :color="typeChipColor(doc.type)" class="doc-chip">{{ doc.type }}</ion-chip>
            <ion-chip :color="statusColor(doc.status)" class="doc-chip">{{ doc.status }}</ion-chip>
          </div>
        </ion-item>
      </ion-list>

      <div v-if="!store.loading && !filteredDocs.length" class="ion-text-center ion-padding">
        <p>No documents found</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button router-link="/tabs/documents/create">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonChip,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonIcon,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useDocumentsStore } from '@/stores/documents';

const store = useDocumentsStore();
const typeFilter = ref('all');

const filteredDocs = computed(() => {
  if (typeFilter.value === 'all') return store.documents;
  return store.documents.filter((d) => d.type === typeFilter.value);
});

function typeChipColor(type: string): string {
  switch (type) {
    case 'invoice': return 'primary';
    case 'bill': return 'warning';
    case 'quote': return 'tertiary';
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

async function handleRefresh(event: CustomEvent) {
  await store.fetchDocuments();
  (event.target as HTMLIonRefresherElement).complete();
}

onMounted(() => store.fetchDocuments());
</script>

<style scoped>
.doc-badges {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}

.doc-chip {
  font-size: 10px;
  height: 20px;
}
</style>
