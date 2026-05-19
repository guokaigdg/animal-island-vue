<script setup lang="ts">
import { computed } from 'vue';
import type { InputSize } from './types';

interface Props {
    modelValue?: string;
    size?: InputSize;
    allowClear?: boolean;
    status?: 'error' | 'warning';
    shadow?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    readonly?: boolean;
    maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    size: 'middle',
    allowClear: false,
    shadow: false,
    disabled: false,
    type: 'text',
    readonly: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string, event: Event): void;
    (e: 'clear'): void;
}>();

defineSlots<{
    prefix?: () => unknown;
    suffix?: () => unknown;
}>();

const showClear = computed(
    () => props.allowClear && !!props.modelValue && !props.disabled,
);

function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    emit('update:modelValue', value);
    emit('change', value, event);
}

function handleClear() {
    emit('update:modelValue', '');
    emit('clear');
}
</script>

<template>
    <span
        class="animal-input"
        :class="[
            `animal-input--${size}`,
            status && `animal-input--${status}`,
            { 'animal-input--shadow': shadow && !disabled, 'animal-input--disabled': disabled },
        ]"
    >
        <span v-if="$slots.prefix" class="animal-input__prefix"><slot name="prefix" /></span>
        <input
            class="animal-input__inner"
            :type="type"
            :value="modelValue"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :maxlength="maxlength"
            @input="handleInput"
        />
        <span
            v-if="showClear"
            class="animal-input__clear"
            role="button"
            tabindex="-1"
            @click="handleClear"
        >×</span>
        <span v-if="$slots.suffix" class="animal-input__suffix"><slot name="suffix" /></span>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-input {
    display: inline-flex;
    align-items: center;
    width: 100%;
    border: 2px solid @shadow-soft-hover;
    border-radius: 50px;
    background: rgb(247, 243, 223);
    transition: all @motion-duration-base @motion-ease;

    &:hover {
        border-color: @shadow-soft-strong;
    }

    &__inner {
        flex: 1;
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: @warm-color-soft;
        font-family: @font-family;
        font-weight: 500;
        letter-spacing: 0.01em;
        font-size: inherit;
        line-height: @line-height-base;

        &::placeholder {
            color: @text-color-disabled;
            font-weight: 400;
        }
        &:disabled {
            cursor: not-allowed;
            color: @text-color-disabled;
        }
    }

    &__prefix,
    &__suffix {
        display: inline-flex;
        align-items: center;
        color: #a0936e;
        flex-shrink: 0;
    }
    &__prefix { margin-right: 6px; }
    &__suffix { margin-left: 6px; }

    &__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-left: 4px;
        color: @text-color-disabled;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 50%;
        background: transparent;
        transition: all 0.15s @motion-ease;

        &:hover {
            color: @warm-color-soft;
            background: rgba(114, 93, 66, 0.1);
        }
    }

    // Sizes
    &--small {
        height: @height-sm;
        padding: 0 14px;
        font-size: @font-size-sm;
        border-radius: 40px;
    }
    &--middle {
        height: @height-base;
        padding: 0 18px;
        font-size: @font-size-base;
    }
    &--large {
        height: @height-lg;
        padding: 0 22px;
        font-size: @font-size-lg;
        border-radius: 50px;
        border-width: 2.5px;
    }

    // Status
    &--error {
        border-color: @error-color;
        &:hover { border-color: @error-color-hover; }
    }
    &--warning {
        border-color: @warning-color;
        &:hover { border-color: @warning-color-hover; }
    }

    // Disabled
    &--disabled {
        background: #ece8dc;
        border-color: @shadow-soft;
        opacity: 0.6;
        cursor: not-allowed;

        &:hover { border-color: @shadow-soft; }
    }

    // Shadow (varies by size + status)
    &--shadow.animal-input--small { box-shadow: 0 2px 0 0 @shadow-soft; }
    &--shadow.animal-input--middle { box-shadow: 0 3px 0 0 @shadow-soft; }
    &--shadow.animal-input--large { box-shadow: 0 4px 0 0 @shadow-soft; }
    &--shadow.animal-input--error { box-shadow: 0 3px 0 0 @error-color-active; }
    &--shadow.animal-input--warning { box-shadow: 0 3px 0 0 @warning-color-active; }
}
</style>
