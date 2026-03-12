<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>Account</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>
            <h3>{{ user?.name ?? '—' }}</h3>
            <p>{{ user?.email ?? '' }}</p>
          </ion-label>
        </ion-item>

        <ion-list-header>
          <ion-label>Company</ion-label>
        </ion-list-header>
        <ion-item v-for="company in companies" :key="company.id" button @click="switchCompany(company.id)">
          <ion-label>{{ company.name }}</ion-label>
          <ion-icon v-if="company.id === selectedCompanyId" :icon="checkmarkCircle" slot="end" color="primary" />
        </ion-item>

        <ion-list-header>
          <ion-label>App</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>Version</ion-label>
          <ion-note slot="end">1.0.0</ion-note>
        </ion-item>
      </ion-list>

      <ion-button expand="block" color="danger" fill="outline" class="ion-margin-top" @click="handleLogout">
        Sign Out
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader,
  IonItem, IonLabel, IonNote, IonButton, IonIcon,
} from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const companies = computed(() => authStore.companies);
const selectedCompanyId = computed(() => authStore.selectedCompanyId);

async function switchCompany(id: number) {
  await authStore.selectCompany(id);
}

async function handleLogout() {
  await authStore.logout();
  router.replace('/login');
}
</script>
