<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button detail router-link="/tabs/reports/balance-sheet">
          <ion-icon :icon="pieChartOutline" slot="start" />
          <ion-label>
            <h3>Balance Sheet</h3>
            <p>Assets, Liabilities & Equity</p>
          </ion-label>
        </ion-item>
        <ion-item button detail router-link="/tabs/reports/income-statement">
          <ion-icon :icon="trendingUpOutline" slot="start" />
          <ion-label>
            <h3>Income Statement</h3>
            <p>Income vs Expenses by month</p>
          </ion-label>
        </ion-item>
        <ion-item button detail router-link="/tabs/reports/cash-flow">
          <ion-icon :icon="swapHorizontalOutline" slot="start" />
          <ion-label>
            <h3>Cash Flow</h3>
            <p>Cash flow over time</p>
          </ion-label>
        </ion-item>
        <ion-item button detail router-link="/tabs/reports/trial-balance">
          <ion-icon :icon="documentTextOutline" slot="start" />
          <ion-label>
            <h3>Trial Balance</h3>
            <p>All accounts with balances</p>
          </ion-label>
        </ion-item>
        <ion-item button detail router-link="/tabs/reports/account-register">
          <ion-icon :icon="listOutline" slot="start" />
          <ion-label>
            <h3>Account Register</h3>
            <p>Transaction history by account</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonIcon, IonLabel,
} from '@ionic/vue';
import { documentTextOutline, pieChartOutline, trendingUpOutline, swapHorizontalOutline, listOutline } from 'ionicons/icons';
</script>
