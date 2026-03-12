<template>
  <div class="split-editor">
    <div v-for="(split, index) in splits" :key="index" class="split-row">
      <ion-card>
        <ion-card-content>
          <ion-item button @click="openAccountPicker(index)">
            <ion-label>
              <p>Account</p>
              <h3>{{ split.accountName || 'Select account...' }}</h3>
            </ion-label>
          </ion-item>

          <div class="split-controls">
            <ion-segment v-model="split.action" @ionChange="emitUpdate">
              <ion-segment-button value="DEBIT">
                <ion-label>Debit</ion-label>
              </ion-segment-button>
              <ion-segment-button value="CREDIT">
                <ion-label>Credit</ion-label>
              </ion-segment-button>
            </ion-segment>

            <MoneyInput
              :amount-num="split.amount_num"
              :amount-denom="split.amount_denom"
              label="Amount"
              @update:amount-num="(v) => { split.amount_num = v; emitUpdate(); }"
              @update:amount-denom="(v) => { split.amount_denom = v; emitUpdate(); }"
            />
          </div>

          <ion-item>
            <ion-input v-model="split.memo" label="Memo (optional)" label-placement="floating"
              @ionInput="emitUpdate" />
          </ion-item>

          <ion-button v-if="splits.length > 2" fill="clear" color="danger" size="small"
            @click="removeSplit(index)">
            <ion-icon slot="start" :icon="trashOutline" />
            Remove
          </ion-button>
        </ion-card-content>
      </ion-card>
    </div>

    <ion-button expand="block" fill="outline" @click="addSplit" class="ion-margin-top">
      <ion-icon slot="start" :icon="addOutline" />
      Add Split
    </ion-button>

    <div class="balance-indicator" :class="{ balanced: isBalanced, unbalanced: !isBalanced }">
      <ion-icon :icon="isBalanced ? checkmarkCircleOutline : alertCircleOutline" />
      <span v-if="isBalanced">Balanced ✓</span>
      <span v-else>Unbalanced by {{ imbalanceDisplay }}</span>
    </div>

    <AccountPicker
      :is-open="showAccountPicker"
      @close="showAccountPicker = false"
      @select="handleAccountSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonSegment, IonSegmentButton,
} from '@ionic/vue';
import { addOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import MoneyInput from '@/components/MoneyInput.vue';
import AccountPicker from '@/components/AccountPicker.vue';
import { toDecimal, formatCurrency } from '@/utils/money';
import type { Account } from '@/types';

export interface SplitEntry {
  account_id: number | null;
  accountName: string;
  action: 'DEBIT' | 'CREDIT';
  amount_num: number;
  amount_denom: number;
  memo: string;
}

const props = defineProps<{
  modelValue: SplitEntry[];
}>();

const emit = defineEmits<{
  'update:modelValue': [splits: SplitEntry[]];
}>();

const splits = ref<SplitEntry[]>(props.modelValue.length
  ? [...props.modelValue]
  : [
      { account_id: null, accountName: '', action: 'DEBIT', amount_num: 0, amount_denom: 100, memo: '' },
      { account_id: null, accountName: '', action: 'CREDIT', amount_num: 0, amount_denom: 100, memo: '' },
    ]);

const showAccountPicker = ref(false);
const activeIndex = ref(0);

const totalDebits = computed(() =>
  splits.value.filter((s) => s.action === 'DEBIT').reduce((sum, s) => sum + s.amount_num, 0),
);
const totalCredits = computed(() =>
  splits.value.filter((s) => s.action === 'CREDIT').reduce((sum, s) => sum + s.amount_num, 0),
);
const isBalanced = computed(() => totalDebits.value === totalCredits.value && totalDebits.value > 0);
const imbalanceDisplay = computed(() => {
  const diff = Math.abs(totalDebits.value - totalCredits.value);
  return formatCurrency(diff, 100);
});

function emitUpdate() {
  emit('update:modelValue', [...splits.value]);
}

function addSplit() {
  splits.value.push({ account_id: null, accountName: '', action: 'DEBIT', amount_num: 0, amount_denom: 100, memo: '' });
  emitUpdate();
}

function removeSplit(index: number) {
  splits.value.splice(index, 1);
  emitUpdate();
}

function openAccountPicker(index: number) {
  activeIndex.value = index;
  showAccountPicker.value = true;
}

function handleAccountSelect(account: Account) {
  splits.value[activeIndex.value].account_id = account.id;
  splits.value[activeIndex.value].accountName = account.name;
  emitUpdate();
}
</script>

<style scoped>
.split-row { margin-bottom: 8px; }
.split-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}
.balance-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  margin-top: 8px;
  border-radius: 8px;
  font-weight: 600;
}
.balance-indicator.balanced {
  background: var(--ion-color-success-tint);
  color: var(--ion-color-success-shade);
}
.balance-indicator.unbalanced {
  background: var(--ion-color-danger-tint);
  color: var(--ion-color-danger-shade);
}
.balance-indicator ion-icon { font-size: 20px; }
</style>
