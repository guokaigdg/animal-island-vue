<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
    question?: string;
    answer?: string;
    defaultExpanded?: boolean;
    expanded?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    expanded: undefined,
    defaultExpanded: false,
    disabled: false,
});

const emit = defineEmits<{
    (e: 'update:expanded', value: boolean): void;
    (e: 'change', value: boolean): void;
}>();

defineSlots<{
    question?: () => unknown;
    default?: () => unknown;
}>();

const isControlled = computed(() => props.expanded !== undefined);
const innerExpanded = ref(props.defaultExpanded);
const expandedState = computed(() =>
    isControlled.value ? !!props.expanded : innerExpanded.value,
);

watch(
    () => props.expanded,
    (v) => {
        if (isControlled.value) innerExpanded.value = !!v;
    },
);

function toggle() {
    if (props.disabled) return;
    const next = !expandedState.value;
    if (!isControlled.value) innerExpanded.value = next;
    emit('update:expanded', next);
    emit('change', next);
}
</script>

<template>
    <div
        class="animal-collapse"
        :class="{
            'animal-collapse--expanded': expandedState,
            'animal-collapse--disabled': disabled,
        }"
    >
        <button
            class="animal-collapse__header"
            :disabled="disabled"
            :aria-expanded="expandedState"
            @click="toggle"
        >
            <span class="animal-collapse__icon">{{ expandedState ? '−' : '+' }}</span>
            <span class="animal-collapse__title">
                <slot name="question">{{ question }}</slot>
            </span>
            <span class="animal-collapse__arrow">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                        fill="currentColor"
                        d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
                    />
                </svg>
            </span>
        </button>
        <div
            class="animal-collapse__panel"
            :style="{ gridTemplateRows: expandedState ? '1fr' : '0fr' }"
        >
            <div class="animal-collapse__content">
                <slot>{{ answer }}</slot>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-collapse {
    position: relative;
    background: @bg-color;
    border-radius: @border-radius-base;
    border: @border-width solid @border-color;
    overflow: hidden;
    transition: border-color @motion-duration-base @motion-ease;
    margin-bottom: @spacing-md;

    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &__header {
        display: flex;
        align-items: center;
        gap: @spacing-md;
        width: 100%;
        padding: @spacing-lg @spacing-xl;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: @font-family;

        &:disabled {
            cursor: not-allowed;
        }
    }

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: @primary-color;
        color: #fff;
        border-radius: 50%;
        font-size: 18px;
        font-weight: 700;
        line-height: 1;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(25, 200, 185, 0.3);
        transition: background-color @motion-duration-base @motion-ease,
            transform @motion-duration-base @motion-ease;
    }

    &__title {
        flex: 1;
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-color;
        line-height: 1.35;
    }

    &__arrow {
        color: @primary-color;
        opacity: 0.5;
        transition: opacity @motion-duration-base @motion-ease,
            transform @motion-duration-base @motion-ease;
        display: inline-flex;
    }

    &--expanded {
        .animal-collapse__icon {
            background: @primary-color-active;
            transform: rotate(180deg);
        }
        .animal-collapse__arrow {
            opacity: 1;
            transform: rotate(45deg);
        }
        .animal-collapse__content {
            padding-bottom: @spacing-xl;
        }
    }

    &__panel {
        display: grid;
        transition: grid-template-rows 0.3s @motion-ease;
        will-change: grid-template-rows;
    }

    &__content {
        overflow: hidden;
        padding: 0 @spacing-xl;
        color: @text-color-secondary;
        font-size: @font-size-base;
        line-height: 1.7;
        transition: padding @motion-duration-base @motion-ease;
    }
}
</style>
