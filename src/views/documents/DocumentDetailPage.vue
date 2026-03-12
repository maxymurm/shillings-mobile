<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/documents" />
        </ion-buttons>
        <ion-title>{{ doc?.number ?? 'Document' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!doc" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>
      <div v-else>
        <!-- Header -->
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              <ion-chip :color="typeChipColor(doc.type)">{{ doc.type }}</ion-chip>
              <ion-chip :color="statusColor(doc.status)">{{ doc.status }}</ion-chip>
            </ion-card-subtitle>
            <ion-card-title>{{ doc.number }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item v-if="doc.contact">
                <ion-label>
                  <p>Contact</p>
                  <h3>{{ doc.contact.name }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>Issued</p>
                  <h3>{{ doc.issued_at }}</h3>
                </ion-label>
                <ion-label slot="end">
                  <p>Due</p>
                  <h3>{{ doc.due_at }}</h3>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Line Items -->
        <ion-card v-if="doc.items?.length">
          <ion-card-header>
            <ion-card-subtitle>Line Items</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="line-items">
              <div class="line-header">
                <span class="desc">Description</span>
                <span class="qty">Qty</span>
                <span class="price">Price</span>
                <span class="amount">Amount</span>
              </div>
              <div v-for="item in doc.items" :key="item.id" class="line-row">
                <span class="desc">{{ item.description }}</span>
                <span class="qty">{{ item.quantity }}</span>
                <span class="price">{{ formatItemPrice(item) }}</span>
                <span class="amount">{{ formatItemAmount(item) }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Total -->
        <ion-card>
          <ion-card-content>
            <div class="total-row">
              <strong>Total</strong>
              <strong>{{ formatTotal() }}</strong>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel, IonChip, IonSpinner,
} from '@ionic/vue';
import api from '@/services/api';
import { useDocumentsStore } from '@/stores/documents';
import { toDecimal, formatCurrency } from '@/utils/money';
import type { Document, DocumentItem } from '@/types';

const route = useRoute();
const docStore = useDocumentsStore();
const doc = ref<Document | null>(null);

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

function formatItemPrice(item: DocumentItem): string {
  return formatCurrency(toDecimal(item.price_num, item.price_denom));
}

function formatItemAmount(item: DocumentItem): string {
  const amount = toDecimal(item.price_num * item.quantity, item.price_denom);
  return formatCurrency(amount);
}

function formatTotal(): string {
  if (!doc.value) return '';
  return formatCurrency(toDecimal(doc.value.total_num, doc.value.total_denom));
}

onMounted(async () => {
  const id = Number(route.params.id);
  doc.value = docStore.getDocumentById(id) ?? null;
  try {
    if (!doc.value) {
      const response = await api.get(`/documents/${id}`);
      doc.value = response.data.data ?? response.data;
    }
  } catch { /* offline */ }
});
</script>

<style scoped>
.line-items {
  font-size: 13px;
}

.line-header, .line-row {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr;
  gap: 4px;
  padding: 6px 0;
}

.line-header {
  font-weight: bold;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.qty, .price, .amount {
  text-align: right;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
</style>
