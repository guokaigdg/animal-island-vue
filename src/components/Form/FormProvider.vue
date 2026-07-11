<script setup lang="ts">
import { provide, computed } from 'vue';
import { FormContextKey } from './context';
import type { FormContextValue, FormInstance, FormProviderProps } from './types';

const props = defineProps<FormProviderProps>();

const ctxValue = computed<FormContextValue>(() => ({
    form: props.form as FormContextValue['form'],
    prefixCls: 'island-form',
    layout: 'vertical',
    labelAlign: 'left',
    size: 'middle',
    disabled: false,
    colon: true,
    requiredMark: false,
}));

provide(FormContextKey, ctxValue.value);
</script>

<template>
    <slot />
</template>
