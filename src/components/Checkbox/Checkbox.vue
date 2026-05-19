<script setup lang="ts">
import type { CheckboxOption, CheckboxSize, CheckboxValue } from './types';

interface Props {
    modelValue?: CheckboxValue[];
    options: CheckboxOption[];
    size?: CheckboxSize;
    disabled?: boolean;
    direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    size: 'middle',
    disabled: false,
    direction: 'horizontal',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: CheckboxValue[]): void;
    (e: 'change', value: CheckboxValue[]): void;
}>();

function isChecked(value: CheckboxValue) {
    return props.modelValue.includes(value);
}

function toggle(option: CheckboxOption) {
    if (props.disabled || option.disabled) return;
    const next = isChecked(option.value)
        ? props.modelValue.filter((v) => v !== option.value)
        : [...props.modelValue, option.value];
    emit('update:modelValue', next);
    emit('change', next);
}

function onKeyDown(e: KeyboardEvent, option: CheckboxOption) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(option);
    }
}
</script>

<template>
    <div
        class="animal-checkbox-group"
        :class="[
            `animal-checkbox-group--${direction}`,
            { 'animal-checkbox-group--disabled': disabled },
        ]"
    >
        <label
            v-for="opt in options"
            :key="String(opt.value)"
            class="animal-checkbox"
            :class="[
                `animal-checkbox--${size}`,
                {
                    'animal-checkbox--checked': isChecked(opt.value),
                    'animal-checkbox--disabled': disabled || opt.disabled,
                },
            ]"
            @click="toggle(opt)"
        >
            <span
                role="checkbox"
                :aria-checked="isChecked(opt.value)"
                :tabindex="(disabled || opt.disabled) ? -1 : 0"
                class="animal-checkbox__box"
                @keydown="onKeyDown($event, opt)"
            >
                <span v-if="isChecked(opt.value)" class="animal-checkbox__mark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M2 8L6 12L14 4"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </span>
            </span>
            <span class="animal-checkbox__label">{{ opt.label }}</span>
        </label>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    font-family: @font-family;

    &--horizontal { flex-direction: row; gap: @spacing-md; }
    &--vertical { flex-direction: column; gap: @spacing-sm; }
    &--disabled { cursor: not-allowed; }
}

.animal-checkbox {
    display: inline-flex;
    align-items: center;
    gap: @spacing-sm;
    user-select: none;
    cursor: pointer;
    transition: all @motion-duration-base @motion-ease;

    &__box {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid @shadow-soft-hover;
        background: rgb(247, 243, 223);
        outline: none;
        transition: all @motion-duration-base @motion-ease;

        &:focus-visible {
            outline: 2px solid @warning-color;
            outline-offset: 2px;
        }
    }

    &__mark {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        line-height: 1;
        animation: animal-checkbox-pop @motion-duration-fast @motion-ease;
    }

    &__label {
        color: @warm-color-soft;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: color @motion-duration-base @motion-ease;
    }

    // Sizes
    &--small {
        .animal-checkbox__box { width: 18px; height: 18px; border-radius: 12px; }
        .animal-checkbox__mark { width: 10px; height: 10px; }
        .animal-checkbox__label { font-size: 12px; }
    }
    &--middle {
        .animal-checkbox__box { width: 22px; height: 22px; border-radius: 14px; }
        .animal-checkbox__mark { width: 12px; height: 12px; }
        .animal-checkbox__label { font-size: 14px; }
    }
    &--large {
        .animal-checkbox__box { width: 28px; height: 28px; border-radius: 16px; }
        .animal-checkbox__mark { font-size: 16px; }
        .animal-checkbox__label { font-size: 16px; }
    }

    // Checked
    &--checked:not(.animal-checkbox--disabled) {
        .animal-checkbox__box {
            background: @primary-color;
            border-color: @primary-color-active;
        }
    }

    // Disabled
    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;

        .animal-checkbox__box {
            background: #f0ece2;
            border-color: @border-color-light;
        }
        .animal-checkbox__label { color: @text-color-disabled; }
    }
}

@keyframes animal-checkbox-pop {
    0% { transform: scale(0.4); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}
</style>
