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

// 唯一 name（类似 React 的 useId）
const idBase = `animal-radio-${Math.random().toString(36).slice(2, 10)}`;
const inputRefs = ref<Array<HTMLInputElement | null>>([]);

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

function handleChange(opt: RadioOption) {
    select(opt);
}

function handleKeyDown(e: KeyboardEvent) {
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
        nextTick(() => inputRefs.value[nextIdx]?.focus());
    }
}

function setRef(el: unknown, idx: number) {
    inputRefs.value[idx] = el as HTMLInputElement | null;
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
        @keydown="handleKeyDown"
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
        >
            <span class="animal-radio__cbx">
                <input
                    :ref="(el) => setRef(el, idx)"
                    type="radio"
                    :name="idBase"
                    :checked="isChecked(opt.value)"
                    :disabled="disabled || opt.disabled"
                    :tabindex="idx === focusedIndex && !(disabled || opt.disabled) ? 0 : -1"
                    @change="handleChange(opt)"
                    @focus="!(disabled || opt.disabled) && (focusedIndex = idx)"
                />
                <span class="animal-radio__splash" aria-hidden="true" />
                <svg class="animal-radio__check" fill="none" viewBox="0 0 15 14" :width="14" :height="14">
                    <path d="M2 8.36364L6.23077 12L13 2" />
                </svg>
            </span>
            <span class="animal-radio__label">{{ opt.label }}</span>
        </label>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@splash-color: @primary-color;

.animal-radio-group {
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

    &--disabled .animal-radio {
        cursor: not-allowed;
    }
}

.animal-radio {
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
        .animal-radio__label {
            font-size: @font-size-sm;
        }
    }

    &--middle {
        --cbx-size: 22px;
        --cbx-check-w: 12px;
        --cbx-check-h: 11px;
        .animal-radio__label {
            font-size: @font-size-base;
        }
    }

    &--large {
        --cbx-size: 28px;
        --cbx-check-w: 15px;
        --cbx-check-h: 14px;
        .animal-radio__label {
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

        input[type='radio'] {
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

        .animal-radio__splash {
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

        .animal-radio__check {
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

        input:checked ~ .animal-radio__splash {
            animation: animal-radio-splash 0.6s ease forwards;
        }

        input:checked ~ .animal-radio__check path {
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
        .animal-radio__cbx input {
            background: @primary-color;
        }
        .animal-radio__label {
            color: #794f27;
        }
    }

    // ---------- Disabled ----------
    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;

        .animal-radio__cbx input {
            background: #f0ece2;
            border-color: #d4c9b4;
        }

        .animal-radio__cbx input:checked ~ .animal-radio__splash {
            animation: none;
        }

        .animal-radio__cbx .animal-radio__check path {
            stroke: #c4b89e;
        }

        .animal-radio__label {
            color: #c4b89e;
        }
    }
}

@keyframes animal-radio-splash {
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
