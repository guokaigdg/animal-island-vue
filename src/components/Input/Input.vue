<script setup lang="ts">
import { computed } from 'vue';
import type { InputSize } from './types';

interface Props {
    modelValue?: string;
    size?: InputSize;
    prefix?: string;
    suffix?: string;
    allowClear?: boolean;
    status?: 'error' | 'warning';
    shadow?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    readonly?: boolean;
    maxlength?: number;
    clearAriaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    size: 'middle',
    prefix: undefined,
    suffix: undefined,
    allowClear: false,
    shadow: false,
    disabled: false,
    type: 'text',
    readonly: false,
    clearAriaLabel: '清除',
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

const showClear = computed(() => props.allowClear && !!props.modelValue && !props.disabled);

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
        <span v-if="prefix || $slots.prefix" class="animal-input__prefix">
            <slot name="prefix">{{ prefix }}</slot>
        </span>
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
        <button
            v-if="showClear"
            type="button"
            class="animal-input__clear"
            :aria-label="clearAriaLabel"
            @click="handleClear"
        >
            ×
        </button>
        <span v-if="suffix || $slots.suffix" class="animal-input__suffix">
            <slot name="suffix">{{ suffix }}</slot>
        </span>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-input {
    display: inline-flex;
    align-items: center;
    width: 100%;
    background: @bg-color-input;
    border-radius: 50px;
    transition: all @motion-duration-base @motion-ease;

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
    &__prefix {
        margin-right: 6px;
    }
    &__suffix {
        margin-left: 6px;
    }

    &__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-left: 4px;
        padding: 0;
        border: none;
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
    }

    // Status
    &--error {
        box-shadow: 0 3px 0 0 @error-color-active;
    }
    &--warning {
        box-shadow: 0 3px 0 0 @warning-color-active;
    }

    // Disabled
    &--disabled {
        background: #ece8dc;
        box-shadow: none;
        opacity: 0.6;
        cursor: not-allowed;
    }

    // Shadow (varies by size + status)
    &--shadow.animal-input--small {
        box-shadow: 0 2px 0 0 @shadow-soft;
    }
    &--shadow.animal-input--middle {
        box-shadow: 0 3px 0 0 @shadow-soft;
    }
    &--shadow.animal-input--large {
        box-shadow: 0 4px 0 0 @shadow-soft;
    }
}
</style>
