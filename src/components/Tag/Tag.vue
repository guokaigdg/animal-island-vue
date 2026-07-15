<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TagColor, TagSize, TagVariant } from './types';

defineOptions({ inheritAttrs: false });

interface Props {
    size?: TagSize;
    variant?: TagVariant;
    color?: TagColor;
    closable?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    variant: 'solid',
    color: 'default',
    closable: false,
    disabled: false,
});

const emit = defineEmits<{ (e: 'close', event: MouseEvent): void }>();

defineSlots<{ default?: () => unknown }>();

const attrs = useAttrs();

const isInteractive = computed(() => !!attrs.onClick && !props.disabled);

function triggerClick(event: Event) {
    if (props.disabled) return;
    const handler = attrs.onClick;
    if (typeof handler === 'function') {
        (handler as (event: Event) => void)(event);
    }
}

function handleClick(event: MouseEvent) {
    triggerClick(event);
}

function handleKeydown(event: KeyboardEvent) {
    if (!isInteractive.value) return;
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerClick(event);
    }
}

function handleClose(event: MouseEvent) {
    event.stopPropagation();
    if (props.disabled) return;
    emit('close', event);
}
</script>

<template>
    <span
        class="animal-tag"
        :class="[
            attrs.class,
            `animal-tag--${size}`,
            `animal-tag--${variant}`,
            color !== 'default' ? [`animal-tag--${color}`, 'animal-tag--colored'] : [],
            {
                'animal-tag--disabled': disabled,
                'animal-tag--clickable': isInteractive,
            },
        ]"
        :style="attrs.style"
        :role="isInteractive ? 'button' : undefined"
        :tabindex="isInteractive ? 0 : undefined"
        @click="handleClick"
        @keydown="handleKeydown"
    >
        <span class="animal-tag__text">
            <slot />
        </span>
        <button
            v-if="closable"
            type="button"
            class="animal-tag__close"
            aria-label="close"
            :disabled="disabled"
            @click="handleClose"
        >
            ×
        </button>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-tag {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
    font-family: inherit;
    font-weight: 600;
    border-radius: 999px;
    border: 1.5px solid transparent;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;

    // ---------- Size ----------
    &--small {
        height: 24px;
        line-height: 21px;
        padding: 0 10px;
        font-size: 12px;
    }
    &--medium {
        height: 29px;
        line-height: 26px;
        padding: 0 12px;
        font-size: 13px;
    }
    &--large {
        height: 34px;
        line-height: 31px;
        padding: 0 16px;
        font-size: 15px;
    }

    // ---------- Variant ----------
    &--solid {
        background: rgb(247, 243, 223);
        color: #8f734f;
        border-color: #d4c4a8;
    }
    &--outlined {
        background: transparent;
        color: #8f734f;
        border-color: #c4b89e;
    }
    &--dashed {
        background: transparent;
        color: #8f734f;
        border-style: dashed;
        border-color: #c4b89e;
    }

    // ---------- Color tokens ----------
    &--app-pink {
        --animal-tag-color: #f8a6b2;
    }
    &--purple {
        --animal-tag-color: #b77dee;
    }
    &--app-blue {
        --animal-tag-color: #889df0;
    }
    &--app-yellow {
        --animal-tag-color: #f7cd67;
    }
    &--app-orange {
        --animal-tag-color: #e59266;
    }
    &--app-teal {
        --animal-tag-color: #82d5bb;
    }
    &--app-green {
        --animal-tag-color: #8ac68a;
    }
    &--app-red {
        --animal-tag-color: #fc736d;
    }
    &--lime-green {
        --animal-tag-color: #d1da49;
    }
    &--yellow-green {
        --animal-tag-color: #ecdf52;
    }
    &--brown {
        --animal-tag-color: #9a835a;
    }
    &--warm-peach-pink {
        --animal-tag-color: #e18c6f;
    }

    // ---------- Color applied per variant ----------
    &--colored.animal-tag--solid {
        background: var(--animal-tag-color);
        border-color: var(--animal-tag-color);
        color: #fff;
    }
    &--colored.animal-tag--outlined {
        color: var(--animal-tag-color);
        border-color: var(--animal-tag-color);
        background: transparent;
    }
    &--colored.animal-tag--dashed {
        color: var(--animal-tag-color);
        border-color: var(--animal-tag-color);
        background: transparent;
    }

    // ---------- Text ----------
    &__text {
        color: inherit;
    }

    // ---------- Close button ----------
    &__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 2px;
        margin-right: -4px;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        background: rgba(0, 0, 0, 0.08);
        color: inherit;
        font-size: 14px;
        line-height: 1;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.18);
        }
        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }

    // ---------- Interactive ----------
    &--clickable {
        cursor: pointer;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(61, 52, 40, 0.12);
        }
        &:active {
            transform: translateY(0);
        }
        &:focus-visible {
            outline: 2px solid var(--animal-focus-yellow, #f5c31c);
            outline-offset: 2px;
        }
    }

    // ---------- Disabled ----------
    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
}
</style>
