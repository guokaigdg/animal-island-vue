<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SwitchSize } from './types';

interface Props {
    modelValue?: boolean;
    defaultChecked?: boolean;
    size?: SwitchSize;
    disabled?: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    defaultChecked: false,
    size: 'default',
    disabled: false,
    loading: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'change', value: boolean): void;
}>();

defineSlots<{
    checked?: () => unknown;
    unchecked?: () => unknown;
}>();

const innerChecked = ref(props.defaultChecked);
const isControlled = computed(() => props.modelValue !== undefined);
const isChecked = computed(() => (isControlled.value ? !!props.modelValue : innerChecked.value));

function handleClick() {
    if (props.disabled || props.loading) return;
    const next = !isChecked.value;
    if (!isControlled.value) innerChecked.value = next;
    emit('update:modelValue', next);
    emit('change', next);
}
</script>

<template>
    <button
        type="button"
        role="switch"
        :aria-checked="isChecked"
        :disabled="disabled"
        class="animal-switch"
        :class="{
            'animal-switch--checked': isChecked,
            'animal-switch--small': size === 'small',
            'animal-switch--disabled': disabled,
            'animal-switch--loading': loading,
        }"
        @click="handleClick"
    >
        <span class="animal-switch__handle">
            <span v-if="loading" class="animal-switch__spinner" />
        </span>
        <span class="animal-switch__inner">
            <slot v-if="isChecked" name="checked" />
            <slot v-else name="unchecked" />
        </span>
    </button>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 52px;
    height: 28px;
    padding: 0;
    background: @shadow-soft;
    border: 2.5px solid @shadow-soft-hover;
    border-radius: 50px;
    cursor: pointer;
    transition: all @motion-duration-base @motion-ease;
    outline: none;
    box-shadow: inset 0 2px 4px rgba(114, 93, 66, 0.15);

    &:hover:not(.animal-switch--disabled) {
        border-color: @shadow-soft-strong;
    }
    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 2px;
    }

    &__handle {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 2px;
        width: 21px;
        height: 21px;
        background: rgb(247, 243, 223);
        border: 2.5px solid @shadow-soft-hover;
        border-radius: 50%;
        transition: all @motion-duration-base @motion-ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__inner {
        display: block;
        padding: 0 8px 0 28px;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        line-height: 1;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        letter-spacing: 0.02em;
    }

    &__spinner {
        display: inline-block;
        width: 11px;
        height: 11px;
        border: 2px solid @shadow-soft-strong;
        border-right-color: transparent;
        border-radius: 50%;
        animation: animal-switch-spin 0.6s linear infinite;
    }

    // ---------- Checked ----------
    &--checked {
        background: #86d67a;
        border-color: @success-color;
        box-shadow: inset 0 2px 4px rgba(90, 158, 30, 0.2);

        &:hover:not(.animal-switch--disabled) {
            border-color: @success-color-active;
            background: #7ccc70;
        }

        .animal-switch__handle {
            left: calc(100% - 24px);
            border-color: @success-color;
        }
        .animal-switch__inner { padding: 0 28px 0 8px; }
        .animal-switch__spinner { border-color: @success-color; border-right-color: transparent; }
    }

    // ---------- Size: small ----------
    &--small {
        min-width: 38px;
        height: 20px;

        .animal-switch__handle {
            width: 14px;
            height: 14px;
            left: 1px;
        }
        &.animal-switch--checked .animal-switch__handle {
            left: calc(100% - 16px);
        }
        .animal-switch__inner { padding: 0 6px 0 20px; font-size: 9px; }
        &.animal-switch--checked .animal-switch__inner { padding: 0 20px 0 6px; }
    }

    // ---------- Disabled ----------
    &--disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    // ---------- Loading ----------
    &--loading {
        pointer-events: none;
        opacity: 0.7;
    }
}

@keyframes animal-switch-spin {
    to { transform: rotate(360deg); }
}
</style>
