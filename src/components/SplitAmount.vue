<template>
  <span :class="['split-amount', amountClass]">
    {{ formattedAmount }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/money';

const props = defineProps<{
  amountNum: number;
  amountDenom: number;
  currencyCode?: string;
  action?: 'DEBIT' | 'CREDIT';
}>();

const formattedAmount = computed(() =>
  formatCurrency(props.amountNum, props.amountDenom, props.currencyCode),
);

const amountClass = computed(() => {
  if (props.action === 'DEBIT') return 'debit';
  if (props.action === 'CREDIT') return 'credit';
  return props.amountNum >= 0 ? 'debit' : 'credit';
});
</script>

<style scoped>
.split-amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.debit { color: var(--ion-color-success); }
.credit { color: var(--ion-color-danger); }
</style>
