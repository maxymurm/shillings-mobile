<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/documents" />
        </ion-buttons>
        <ion-title>New Invoice</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Contact selector -->
      <ion-list>
        <ion-item button @click="showContactPicker = true">
          <ion-label>
            <p>Contact</p>
            <h3>{{ selectedContact?.name ?? 'Select contact...' }}</h3>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Line Items -->
      <ion-list-header>
        <ion-label>Line Items</ion-label>
        <ion-button fill="clear" @click="addItem">Add Item</ion-button>
      </ion-list-header>

      <ion-card v-for="(item, idx) in items" :key="idx">
        <ion-card-content>
          <ion-item>
            <ion-input v-model="item.description" label="Description" label-placement="stacked" placeholder="Item description" />
          </ion-item>
          <div class="item-row">
            <ion-item class="qty-item">
              <ion-input v-model.number="item.quantity" label="Qty" label-placement="stacked" type="number" :min="1" />
            </ion-item>
            <ion-item class="price-item">
              <ion-input v-model="item.priceStr" label="Price" label-placement="stacked" type="number" step="0.01" />
            </ion-item>
          </div>
          <div class="item-footer">
            <span>{{ formatLineTotal(item) }}</span>
            <ion-button fill="clear" color="danger" size="small" @click="items.splice(idx, 1)">Remove</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Total -->
      <ion-card v-if="items.length">
        <ion-card-content>
          <div class="total-row">
            <strong>Total</strong>
            <strong>{{ formatGrandTotal() }}</strong>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" class="ion-margin-top" :disabled="!canSave || saving" @click="save">
        <ion-spinner v-if="saving" name="crescent" />
        <span v-else>Create Invoice</span>
      </ion-button>

      <!-- Contact Picker Modal -->
      <ion-modal :is-open="showContactPicker" @did-dismiss="showContactPicker = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Select Contact</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showContactPicker = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar v-model="contactSearch" placeholder="Search..." :debounce="200" />
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item
              v-for="c in filteredPickerContacts"
              :key="c.id"
              button
              @click="selectContact(c)"
            >
              <ion-label>{{ c.name }}</ion-label>
              <ion-chip slot="end" size="small">{{ c.type }}</ion-chip>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonList, IonListHeader, IonItem, IonLabel, IonInput, IonCard, IonCardContent,
  IonModal, IonSearchbar, IonChip, IonSpinner,
} from '@ionic/vue';
import { useContactsStore } from '@/stores/contacts';
import { useDocumentsStore } from '@/stores/documents';
import { fromDecimal, formatCurrency } from '@/utils/money';
import type { Contact } from '@/types';

interface LineItem {
  description: string;
  quantity: number;
  priceStr: string;
}

const router = useRouter();
const contactStore = useContactsStore();
const docStore = useDocumentsStore();
const saving = ref(false);
const showContactPicker = ref(false);
const contactSearch = ref('');
const selectedContact = ref<Contact | null>(null);
const items = ref<LineItem[]>([{ description: '', quantity: 1, priceStr: '0' }]);

const filteredPickerContacts = computed(() => {
  const q = contactSearch.value.toLowerCase();
  return contactStore.contacts.filter((c) => c.name.toLowerCase().includes(q));
});

const canSave = computed(() => {
  return selectedContact.value && items.value.some((i) => i.description && Number(i.priceStr) > 0);
});

function selectContact(c: Contact) {
  selectedContact.value = c;
  showContactPicker.value = false;
}

function addItem() {
  items.value.push({ description: '', quantity: 1, priceStr: '0' });
}

function formatLineTotal(item: LineItem): string {
  const total = item.quantity * Number(item.priceStr);
  return formatCurrency(total);
}

function formatGrandTotal(): string {
  const total = items.value.reduce((sum, i) => sum + i.quantity * Number(i.priceStr), 0);
  return formatCurrency(total);
}

async function save() {
  if (!selectedContact.value) return;
  saving.value = true;
  try {
    const lineItems = items.value
      .filter((i) => i.description && Number(i.priceStr) > 0)
      .map((i) => {
        const fraction = fromDecimal(Number(i.priceStr));
        return {
          description: i.description,
          quantity: i.quantity,
          price_num: fraction.amount_num,
          price_denom: fraction.amount_denom,
          account_id: 0, // Server will assign default
        };
      });

    const doc = await docStore.createInvoice({
      contact_id: selectedContact.value.id,
      items: lineItems,
    });

    if (doc) {
      router.replace(`/tabs/documents/${doc.id}`);
    } else {
      router.back();
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!contactStore.contacts.length) {
    contactStore.fetchContacts(true);
  }
});
</script>

<style scoped>
.item-row {
  display: flex;
  gap: 8px;
}

.qty-item { flex: 1; }
.price-item { flex: 2; }

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  font-weight: 500;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
</style>
