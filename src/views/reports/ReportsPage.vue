<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button detail @click="viewReport('trial-balance')">
          <ion-icon :icon="documentTextOutline" slot="start" />
          <ion-label>Trial Balance</ion-label>
        </ion-item>
        <ion-item button detail @click="viewReport('balance-sheet')">
          <ion-icon :icon="pieChartOutline" slot="start" />
          <ion-label>Balance Sheet</ion-label>
        </ion-item>
        <ion-item button detail @click="viewReport('income-statement')">
          <ion-icon :icon="trendingUpOutline" slot="start" />
          <ion-label>Income Statement</ion-label>
        </ion-item>
        <ion-item button detail @click="viewReport('cash-flow')">
          <ion-icon :icon="swapHorizontalOutline" slot="start" />
          <ion-label>Cash Flow</ion-label>
        </ion-item>
      </ion-list>
      <ion-text color="medium" class="ion-text-center ion-margin-top">
        <p>Full report views coming in Phase 8</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonIcon, IonLabel, IonText, toastController,
} from '@ionic/vue';
import { documentTextOutline, pieChartOutline, trendingUpOutline, swapHorizontalOutline } from 'ionicons/icons';

async function viewReport(type: string) {
  const toast = await toastController.create({
    message: `${type} report will be implemented in Phase 8`,
    duration: 2000,
  });
  await toast.present();
}
</script>
