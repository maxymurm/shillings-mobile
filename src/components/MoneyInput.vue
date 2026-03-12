<template>
  <div class="money-input">
    <ion-input
      v-model="displayValue"
      type="number"
      inputmode="decimal"
      step="0.01"
      min="0"
      :label="label"
      :label-placement="labelPlacement"
      @ionInput="handleInput"
    />
    <span v-if="currencyCode" class="currency-code">{{ currencyCode }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonInput } from '@ionic/vue';
import { toDecimal, fromDecimal } from '@/utils/money';

const props = withDefaults(defineProps<{
  amountNum: number;
  amountDenom: number;
  currencyCode?: string;
  label?: string;
  labelPlacement?: 'floating' | 'start' | 'end' | 'stacked' | 'fixed';
}>(), {
  label: 'Amount',
  labelPlacement: 'floating',
});

const emit = defineEmits<{
  'update:amountNum': [value: number];
  'update:amountDenom': [value: number];
}>();

const displayValue = ref(String(toDecimal(props.amountNum, props.amountDenom)));

watch(() => props.amountNum, (num) => {
  displayValue.value = String(toDecimal(num, props.amountDenom));
});

function handleInput() {
  const val = parseFloat(displayValue.value) || 0;
  const { amount_num, amount_denom } = fromDecimal(val);
  emit('update:amountNum', amount_num);
  emit('update:amountDenom', amount_denom);
}
</script>

<style scoped>
.money-input {
  display: flex;
  align-items: center;
  gap: 8px;
}
.money-input ion-input {
  flex: 1;
}
.currency-code {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-medium);
  min-width: 36px;
}
</style>
