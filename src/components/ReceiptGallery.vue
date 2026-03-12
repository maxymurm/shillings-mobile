<template>
  <div>
    <div v-if="receipts.length" class="receipt-grid">
      <div v-for="(receipt, idx) in receipts" :key="idx" class="receipt-thumb" @click="viewReceipt(idx)">
        <img :src="'data:image/jpeg;base64,' + receipt" alt="Receipt" />
        <ion-button class="delete-btn" fill="clear" color="danger" size="small" @click.stop="removeReceipt(idx)">
          <ion-icon :icon="trashOutline" />
        </ion-button>
      </div>
    </div>

    <div class="capture-buttons">
      <ion-button fill="outline" size="small" @click="capture">
        <ion-icon :icon="cameraOutline" slot="start" />
        Camera
      </ion-button>
      <ion-button fill="outline" size="small" @click="pickGallery">
        <ion-icon :icon="imagesOutline" slot="start" />
        Gallery
      </ion-button>
    </div>

    <!-- Full-screen viewer -->
    <ion-modal :is-open="viewerOpen" @did-dismiss="viewerOpen = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Receipt</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="viewerOpen = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding viewer-content">
        <img v-if="viewerIndex !== null && receipts[viewerIndex]" :src="'data:image/jpeg;base64,' + receipts[viewerIndex]" class="full-receipt" />
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
} from '@ionic/vue';
import { cameraOutline, imagesOutline, trashOutline } from 'ionicons/icons';
import { captureReceipt, pickFromGallery } from '@/services/camera';

const receipts = defineModel<string[]>({ default: () => [] });
const viewerOpen = ref(false);
const viewerIndex = ref<number | null>(null);

async function capture() {
  const base64 = await captureReceipt();
  if (base64) receipts.value.push(base64);
}

async function pickGallery() {
  const base64 = await pickFromGallery();
  if (base64) receipts.value.push(base64);
}

function viewReceipt(idx: number) {
  viewerIndex.value = idx;
  viewerOpen.value = true;
}

function removeReceipt(idx: number) {
  receipts.value.splice(idx, 1);
}
</script>

<style scoped>
.receipt-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.receipt-thumb {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
}

.receipt-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
}

.capture-buttons {
  display: flex;
  gap: 8px;
}

.viewer-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-receipt {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
</style>
