<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import type { RadioOption, RadioSize, RadioValue } from './types';

const attrs = useAttrs();

interface Props {
    modelValue?: RadioValue;
    options: RadioOption[];
    size?: RadioSize;
    disabled?: boolean;
    direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    size: 'middle',
    disabled: false,
    direction: 'horizontal',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: RadioValue): void;
    (e: 'change', value: RadioValue): void;
}>();

const groupRef = ref<HTMLDivElement | null>(null);

// 当前聚焦的索引（用于 roving tabindex）
const focusedIndex = ref<number>(
    Math.max(0, props.options.findIndex((o) => o.value === props.modelValue))
);

watch(
    () => props.modelValue,
    (val) => {
        const idx = props.options.findIndex((o) => o.value === val);
        if (idx >= 0) focusedIndex.value = idx;
    }
);

const enabledIndices = computed(() =>
    props.options
        .map((opt, idx) => ({ opt, idx }))
        .filter(({ opt }) => !props.disabled && !opt.disabled)
        .map(({ idx }) => idx)
);

const currentEnabledPos = computed(() =>
    enabledIndices.value.indexOf(focusedIndex.value)
);

function isChecked(value: RadioValue) {
    return props.modelValue === value;
}

function select(option: RadioOption) {
    if (props.disabled || option.disabled) return;
    emit('update:modelValue', option.value);
    emit('change', option.value);
}

function focusCircle(idx: number) {
    nextTick(() => {
        const circles = groupRef.value?.querySelectorAll('[data-radio-circle]');
        (circles?.[idx] as HTMLElement | undefined)?.focus();
    });
}

function onKeyDown(e: KeyboardEvent) {
    if (enabledIndices.value.length === 0) return;
    let nextPos = -1;
    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            nextPos = (currentEnabledPos.value + 1) % enabledIndices.value.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            nextPos =
                (currentEnabledPos.value - 1 + enabledIndices.value.length) %
                enabledIndices.value.length;
            break;
        case 'Home':
            e.preventDefault();
            nextPos = 0;
            break;
        case 'End':
            e.preventDefault();
            nextPos = enabledIndices.value.length - 1;
            break;
        default:
            return;
    }

    if (nextPos >= 0) {
        const nextIdx = enabledIndices.value[nextPos];
        focusedIndex.value = nextIdx;
        select(props.options[nextIdx]);
        focusCircle(nextIdx);
    }
}

function onCircleKeyDown(e: KeyboardEvent, option: RadioOption) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        select(option);
    }
}

function onClickItem(opt: RadioOption, idx: number) {
    if (props.disabled || opt.disabled) return;
    focusedIndex.value = idx;
    select(opt);
}
</script>

<template>
    <div
        ref="groupRef"
        class="animal-radio-group"
        :class="[
            `animal-radio-group--${direction}`,
            { 'animal-radio-group--disabled': disabled },
        ]"
        role="radiogroup"
        @keydown="onKeyDown"
        v-bind="attrs"
    >
        <label
            v-for="(opt, idx) in options"
            :key="String(opt.value)"
            class="animal-radio"
            :class="[
                `animal-radio--${size}`,
                {
                    'animal-radio--checked': isChecked(opt.value),
                    'animal-radio--disabled': disabled || opt.disabled,
                },
            ]"
            @click="onClickItem(opt, idx)"
        >
            <span
                class="animal-radio__circle"
                data-radio-circle
                role="radio"
                :aria-checked="isChecked(opt.value)"
                :aria-disabled="(disabled || opt.disabled) || undefined"
                :tabindex="idx === focusedIndex && !(disabled || opt.disabled) ? 0 : -1"
                @focus="!(disabled || opt.disabled) && (focusedIndex = idx)"
                @keydown="onCircleKeyDown($event, opt)"
            >
                <span v-if="isChecked(opt.value)" class="animal-radio__mark">
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
            <span class="animal-radio__label">{{ opt.label }}</span>
        </label>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-md;
    font-family: @font-family;

    &--horizontal { flex-direction: row; }
    &--vertical { flex-direction: column; gap: @spacing-sm; }
    &--disabled { cursor: not-allowed; }
}

.animal-radio {
    display: inline-flex;
    align-items: center;
    gap: @spacing-sm;
    cursor: pointer;
    user-select: none;
    transition: all @motion-duration-base @motion-ease;

    &__circle {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgb(247, 243, 223);
        border: 2px solid #c4b89e;
        border-radius: 8px;
        outline: none;
        transition: all @motion-duration-base @motion-ease;

        &:focus-visible {
            outline: 2px solid @focus-yellow;
            outline-offset: 2px;
        }
    }

    &__mark {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        line-height: 1;
        animation: animal-radio-pop @motion-duration-fast @motion-ease;
    }

    &__label {
        color: #725d42;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: color @motion-duration-fast;
    }

    // Sizes
    &--small {
        .animal-radio__circle {
            width: 18px; height: 18px;
            border-radius: @border-radius-sm - 4;
        }
        .animal-radio__mark { width: 10px; height: 10px; }
        .animal-radio__label { font-size: @font-size-sm; }
    }
    &--middle {
        .animal-radio__circle {
            width: 22px; height: 22px;
            border-radius: @border-radius-sm - 2;
        }
        .animal-radio__mark { width: 12px; height: 12px; }
        .animal-radio__label { font-size: @font-size-base; }
    }
    &--large {
        .animal-radio__circle {
            width: 28px; height: 28px;
            border-radius: @border-radius-sm;
        }
        .animal-radio__mark { font-size: 16px; }
        .animal-radio__label { font-size: @font-size-lg; }
    }

    // Checked
    &--checked:not(.animal-radio--disabled) {
        .animal-radio__circle {
            background: @primary-color;
            border-color: @primary-color-active;
        }
        .animal-radio__label { color: #794f27; }
    }

    // Disabled
    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;
        .animal-radio__circle {
            background: #f0ece2;
            border-color: #d4c9b4;
            transform: none !important;
            box-shadow: none !important;
        }
        .animal-radio__label { color: #c4b89e; }
    }
}

.animal-radio-group--disabled .animal-radio {
    cursor: not-allowed;
}

@keyframes animal-radio-pop {
    0% { transform: scale(0.4); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}
</style>
