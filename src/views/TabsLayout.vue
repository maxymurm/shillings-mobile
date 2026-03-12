<template>
  <ion-page>
    <SyncBar />
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="accounts" href="/tabs/accounts">
          <ion-icon :icon="walletOutline" />
          <ion-label>Accounts</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="new-transaction" href="/tabs/transactions/create">
          <ion-icon :icon="addCircle" class="fab-icon" color="primary" />
        </ion-tab-button>
        <ion-tab-button tab="contacts" href="/tabs/contacts">
          <ion-icon :icon="peopleOutline" />
          <ion-label>Contacts</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon :icon="ellipsisHorizontalOutline" />
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel,
} from '@ionic/vue';
import { homeOutline, walletOutline, addCircle, peopleOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import SyncBar from '@/components/SyncBar.vue';
</script>

<style scoped>
.fab-icon {
  font-size: 32px;
}
</style>
