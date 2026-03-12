<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Contacts</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/contacts/create">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="store.searchQuery" placeholder="Search contacts..." :debounce="300" />
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="store.filterType ?? 'all'" @ionChange="onFilterChange">
          <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
          <ion-segment-button value="customer"><ion-label>Customers</ion-label></ion-segment-button>
          <ion-segment-button value="vendor"><ion-label>Vendors</ion-label></ion-segment-button>
          <ion-segment-button value="employee"><ion-label>Employees</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <ion-list>
        <ion-item
          v-for="contact in store.filteredContacts"
          :key="contact.id"
          :router-link="`/tabs/contacts/${contact.id}`"
          detail
        >
          <ion-avatar slot="start">
            <div class="avatar-letter">{{ contact.name.charAt(0).toUpperCase() }}</div>
          </ion-avatar>
          <ion-label>
            <h3>{{ contact.name }}</h3>
            <p>{{ contact.email ?? contact.phone ?? '' }}</p>
          </ion-label>
          <ion-chip slot="end" :color="typeColor(contact.type)">
            {{ contact.type }}
          </ion-chip>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!store.hasMore">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>

      <div v-if="!store.loading && !store.filteredContacts.length" class="ion-text-center ion-padding">
        <p>No contacts found</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonSearchbar, IonSegment, IonSegmentButton, IonList, IonItem, IonLabel,
  IonAvatar, IonChip, IonIcon, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useContactsStore } from '@/stores/contacts';

const store = useContactsStore();

function typeColor(type: string): string {
  switch (type) {
    case 'customer': return 'primary';
    case 'vendor': return 'tertiary';
    case 'employee': return 'success';
    default: return 'medium';
  }
}

function onFilterChange(event: CustomEvent) {
  const val = event.detail.value;
  store.filterType = val === 'all' ? null : val;
}

async function handleRefresh(event: CustomEvent) {
  await store.fetchContacts(true);
  (event.target as HTMLIonRefresherElement).complete();
}

async function loadMore(event: CustomEvent) {
  await store.fetchContacts();
  (event.target as HTMLIonInfiniteScrollElement).complete();
}

onMounted(() => store.fetchContacts(true));
</script>

<style scoped>
.avatar-letter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  font-weight: bold;
  font-size: 18px;
  border-radius: 50%;
}
</style>
