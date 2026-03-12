<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="login-container">
        <div class="logo-section ion-text-center ion-margin-bottom">
          <ion-icon :icon="walletOutline" size="large" color="primary" />
          <h1>Shillings</h1>
          <p>Double-entry accounting</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-input
              v-model="email"
              type="email"
              label="Email"
              label-placement="floating"
              required
              autocomplete="email"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="password"
              type="password"
              label="Password"
              label-placement="floating"
              required
              autocomplete="current-password"
            />
          </ion-item>

          <ion-button expand="block" type="submit" :disabled="loading" class="ion-margin-top">
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Sign In</span>
          </ion-button>

          <ion-button
            v-if="biometricAvailable"
            expand="block"
            fill="outline"
            class="ion-margin-top"
            @click="loginWithBiometric"
          >
            <ion-icon slot="start" :icon="fingerPrintOutline" />
            Use Face ID / Fingerprint
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner,
  toastController,
} from '@ionic/vue';
import { walletOutline, fingerPrintOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { isBiometricAvailable } from '@/services/biometric';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const biometricAvailable = ref(isBiometricAvailable());

async function handleLogin() {
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.replace('/tabs/dashboard');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message || 'Login failed',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}

async function loginWithBiometric() {
  // Implemented in Phase 11
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 20vh;
}
.logo-section ion-icon {
  font-size: 64px;
}
.logo-section h1 {
  margin: 8px 0 4px;
  font-weight: 700;
}
.logo-section p {
  color: var(--ion-color-medium);
  margin: 0 0 32px;
}
</style>
