<script setup lang="ts">
import { useAttrs } from 'vue';
import type { CheckboxOption, CheckboxSize, CheckboxValue } from './types';

const attrs = useAttrs();

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
</script>

<template>
    <div
        class="animal-checkbox-group"
        :class="[
            `animal-checkbox-group--${direction}`,
            { 'animal-checkbox-group--disabled': disabled },
        ]"
        role="group"
        v-bind="attrs"
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
        >
            <span class="animal-checkbox__cbx">
                <input
                    type="checkbox"
                    :checked="isChecked(opt.value)"
                    :disabled="disabled || opt.disabled"
                    @change="toggle(opt)"
                />
                <span class="animal-checkbox__splash" aria-hidden="true" />
                <svg class="animal-checkbox__check" fill="none" viewBox="0 0 15 14" :width="14" :height="14">
                    <path d="M2 8.36364L6.23077 12L13 2" />
                </svg>
            </span>
            <span class="animal-checkbox__label">{{ opt.label }}</span>
        </label>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@splash-color: @primary-color;

.animal-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-lg;
    font-family: @font-family;

    &--horizontal {
        flex-direction: row;
    }

    &--vertical {
        flex-direction: column;
        gap: @spacing-md;
    }

    &--disabled .animal-checkbox {
        cursor: not-allowed;
    }
}

.animal-checkbox {
    display: inline-flex;
    align-items: center;
    gap: @spacing-sm;
    cursor: pointer;
    user-select: none;
    position: relative;

    // ---------- Sizes ----------
    &--small {
        --cbx-size: 18px;
        --cbx-check-w: 10px;
        --cbx-check-h: 9px;
        .animal-checkbox__label {
            font-size: @font-size-sm;
        }
    }

    &--middle {
        --cbx-size: 22px;
        --cbx-check-w: 12px;
        --cbx-check-h: 11px;
        .animal-checkbox__label {
            font-size: @font-size-base;
        }
    }

    &--large {
        --cbx-size: 28px;
        --cbx-check-w: 15px;
        --cbx-check-h: 14px;
        .animal-checkbox__label {
            font-size: @font-size-lg;
        }
    }

    // ---------- Box (圆形) ----------
    &__cbx {
        position: relative;
        width: var(--cbx-size);
        height: var(--cbx-size);
        flex-shrink: 0;
        box-sizing: border-box;

        input[type='checkbox'] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            cursor: pointer;
            margin: 0;
            position: absolute;
            top: 0;
            left: 0;
            width: var(--cbx-size);
            height: var(--cbx-size);
            border: 2px solid #c4b89e;
            border-radius: 50%;
            background: rgb(247, 243, 223);
            transition: border-color @motion-duration-base @motion-ease;

            &:focus-visible {
                outline: 2px solid @focus-yellow;
                outline-offset: 2px;
            }
        }

        .animal-checkbox__splash {
            display: block;
            width: var(--cbx-size);
            height: var(--cbx-size);
            background: none;
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
            transform: translate3d(0, 0, 0);
            pointer-events: none;
        }

        .animal-checkbox__check {
            position: absolute;
            top: 50%;
            left: 50%;
            width: var(--cbx-check-w);
            height: var(--cbx-check-h);
            transform: translate(-50%, -54%);
            z-index: 1;
            pointer-events: none;

            path {
                stroke: #fff;
                stroke-width: 3;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 19;
                stroke-dashoffset: 19;
                transition: stroke-dashoffset 0.3s ease;
                transition-delay: 0.2s;
            }
        }

        input:checked {
            border-color: @primary-color-active;
        }

        input:checked ~ .animal-checkbox__splash {
            animation: animal-cbx-splash 0.6s ease forwards;
        }

        input:checked ~ .animal-checkbox__check path {
            stroke-dashoffset: 0;
        }
    }

    // ---------- Label ----------
    &__label {
        color: #725d42;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: color @motion-duration-fast;
    }

    // ---------- Checked ----------
    &--checked {
        .animal-checkbox__cbx input {
            background: @primary-color;
        }
        .animal-checkbox__label {
            color: #794f27;
        }
    }

    // ---------- Disabled ----------
    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;

        .animal-checkbox__cbx input {
            background: #f0ece2;
            border-color: #d4c9b4;
        }

        .animal-checkbox__cbx input:checked ~ .animal-checkbox__splash {
            animation: none;
        }

        .animal-checkbox__cbx .animal-checkbox__check path {
            stroke: #c4b89e;
        }

        .animal-checkbox__label {
            color: #c4b89e;
        }
    }
}

@keyframes animal-cbx-splash {
    40% {
        background: @splash-color;
        box-shadow:
            0 -18px 0 -8px @splash-color,
            16px -8px 0 -8px @splash-color,
            16px 8px 0 -8px @splash-color,
            0 18px 0 -8px @splash-color,
            -16px 8px 0 -8px @splash-color,
            -16px -8px 0 -8px @splash-color;
    }

    100% {
        background: @splash-color;
        box-shadow:
            0 -36px 0 -10px transparent,
            32px -16px 0 -10px transparent,
            32px 16px 0 -10px transparent,
            0 36px 0 -10px transparent,
            -32px 16px 0 -10px transparent,
            -32px -16px 0 -10px transparent;
    }
}
</style>
