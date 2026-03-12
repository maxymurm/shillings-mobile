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
          <ion-label>Notifications</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>Transaction Reminders</ion-label>
          <ion-toggle slot="end" :checked="notifReminders" @ionChange="togglePref('pref_notifications_reminders', $event)" />
        </ion-item>
        <ion-item>
          <ion-label>Sync Notifications</ion-label>
          <ion-toggle slot="end" :checked="notifSync" @ionChange="togglePref('pref_notifications_sync', $event)" />
        </ion-item>
        <ion-item>
          <ion-label>Low Balance Alerts</ion-label>
          <ion-toggle slot="end" :checked="notifAlerts" @ionChange="togglePref('pref_notifications_alerts', $event)" />
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
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader,
  IonItem, IonLabel, IonNote, IonButton, IonIcon, IonToggle,
} from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { getNotificationPref, setNotificationPref, type NotificationPrefKey } from '@/services/pushNotifications';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const companies = computed(() => authStore.companies);
const selectedCompanyId = computed(() => authStore.selectedCompanyId);

const notifReminders = ref(true);
const notifSync = ref(true);
const notifAlerts = ref(true);

onMounted(async () => {
  notifReminders.value = await getNotificationPref('pref_notifications_reminders');
  notifSync.value = await getNotificationPref('pref_notifications_sync');
  notifAlerts.value = await getNotificationPref('pref_notifications_alerts');
});

async function togglePref(key: NotificationPrefKey, event: CustomEvent) {
  const enabled = event.detail.checked;
  await setNotificationPref(key, enabled);
  if (key === 'pref_notifications_reminders') notifReminders.value = enabled;
  if (key === 'pref_notifications_sync') notifSync.value = enabled;
  if (key === 'pref_notifications_alerts') notifAlerts.value = enabled;
}

async function switchCompany(id: number) {
  await authStore.selectCompany(id);
}

async function handleLogout() {
  await authStore.logout();
  router.replace('/login');
}
</script>
