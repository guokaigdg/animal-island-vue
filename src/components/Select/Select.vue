<script setup lang="ts">
import { computed, ref, useAttrs, watch, onBeforeUnmount, type CSSProperties } from 'vue';
import type { SelectOption } from './types';

const attrs = useAttrs();

interface Props {
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '请选择',
    disabled: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
}>();

const open = ref(false);
const mounted = ref(false);
const hoveredKey = ref<string | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const dropdownStyle = ref<CSSProperties>({});

const currentLabel = computed(
    () => props.options.find((o) => o.key === props.modelValue)?.label || props.placeholder,
);

function handleToggle() {
    if (props.disabled) return;
    open.value = !open.value;
}

function handleSelect(key: string) {
    emit('update:modelValue', key);
    emit('change', key);
    open.value = false;
    mounted.value = false;
}

function handleClickOutside(e: MouseEvent) {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
        open.value = false;
        mounted.value = false;
    }
}

watch(open, (isOpen) => {
    if (isOpen && wrapperRef.value) {
        document.addEventListener('mousedown', handleClickOutside);

        const rect = wrapperRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = props.options.length * 44 + 24;
        const newStyle: CSSProperties = { position: 'absolute' };

        if (rect.right + 200 > viewportWidth) {
            newStyle.right = '100%';
            newStyle.marginRight = '6px';
            newStyle.left = 'auto';
        } else {
            newStyle.left = '100%';
            newStyle.marginLeft = '6px';
            newStyle.right = 'auto';
        }

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            newStyle.top = 'auto';
            newStyle.bottom = '100%';
            newStyle.marginBottom = '6px';
        } else if (spaceBelow < dropdownHeight) {
            newStyle.top = '100%';
            newStyle.marginTop = '6px';
            newStyle.bottom = 'auto';
        } else if (rect.top < dropdownHeight) {
            newStyle.top = '100%';
            newStyle.marginTop = '6px';
            newStyle.bottom = 'auto';
        } else {
            newStyle.top = '50%';
            newStyle.transform = 'translateY(-50%)';
            newStyle.bottom = 'auto';
        }
        dropdownStyle.value = newStyle;
        requestAnimationFrame(() => { mounted.value = true; });
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
        mounted.value = false;
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <div
        ref="wrapperRef"
        class="animal-select"
        :class="{ 'animal-select--disabled': disabled }"
        v-bind="attrs"
    >
        <div
            class="animal-select__trigger"
            :class="{ 'animal-select__trigger--disabled': disabled }"
            @click="handleToggle"
        >
            <span
                class="animal-select__value"
                :class="{ 'animal-select__value--placeholder': !modelValue }"
            >
                {{ currentLabel }}
            </span>
            <span
                class="animal-select__arrow"
                :class="{ 'animal-select__arrow--open': open }"
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </div>
        <div
            v-if="open && mounted"
            class="animal-select__dropdown"
            :style="dropdownStyle"
        >
            <div
                v-for="option in options"
                :key="option.key"
                class="animal-select__option"
                :class="{
                    'animal-select__option--active': modelValue === option.key,
                    'animal-select__option--hovered': hoveredKey === option.key,
                }"
                @click="handleSelect(option.key)"
                @mouseenter="hoveredKey = option.key"
                @mouseleave="hoveredKey = null"
            >
                <span class="animal-select__spacer" />
                {{ option.label }}
                <div
                    v-if="modelValue === option.key"
                    class="animal-select__highlight"
                />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-select {
    position: relative;
    display: inline-block;
    min-width: 140px;
    font-family: @font-family;
    user-select: none;

    &__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: @spacing-sm 13px;
        background: #fff;
        border: 2px solid #e8dcc8;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border-color: #d4c4a8;
            background: #fffdf7;
        }

        &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #f5f5f0;

            &:hover {
                background: #f5f5f0 !important;
                border-color: #e8dcc8 !important;
            }
        }
    }

    &__value {
        font-size: @font-size-base;
        color: #725d42;
        font-weight: 600;

        &--placeholder {
            color: #a09080;
            font-weight: 400;
        }
    }

    &__arrow {
        display: flex;
        align-items: center;
        color: #a09080;
        transition: transform 0.2s;

        &--open {
            transform: rotate(180deg);
            color: @primary-color;
        }
    }

    &__dropdown {
        background: #ffeea0;
        border-radius: 28px;
        padding: @spacing-md 0;
        z-index: 100;
        overflow: visible;
        opacity: 0;
        animation: animal-select-fade-in 0.2s ease forwards;
    }

    &__option {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 30px 10px 14px;
        font-size: @font-size-base;
        font-weight: 500;
        color: #725d42;
        cursor: pointer;
        white-space: nowrap;

        &--active {
            z-index: 1;
            font-weight: 700;
        }

        &--hovered {
            font-weight: 700;

            &::before {
                content: '';
                position: absolute;
                left: -12px;
                top: 50%;
                transform: translateY(-50%);
                width: 35px;
                height: 35px;
                background: url('../../assets/img/cursor/select-cursor.svg') no-repeat center / contain;
                animation: animal-select-cursor-in 0.5s ease-out forwards;
            }
        }
    }

    &__spacer {
        width: 16px;
        font-size: 12px;
    }

    &__highlight {
        position: absolute;
        left: 0;
        right: 0;
        top: 56%;
        transform: translateY(-50%);
        height: 14px;
        margin: 0 20px;
        background: #ffcc00;
        border-radius: 7px;
        z-index: -1;
        opacity: 0.3;
    }
}

@keyframes animal-select-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes animal-select-cursor-in {
    0% { opacity: 0; transform: translateY(-50%) translateX(-20px) rotate(-15deg); }
    60% { opacity: 1; transform: translateY(-50%) translateX(5px) rotate(5deg); }
    100% { opacity: 1; transform: translateY(-50%) translateX(0) rotate(0deg); }
}
</style>
