<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue';
import type { TooltipPlacement, TooltipTrigger, TooltipVariant } from './types';

const attrs = useAttrs();

interface Props {
    title?: string;
    placement?: TooltipPlacement;
    trigger?: TooltipTrigger;
    variant?: TooltipVariant;
    bordered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    placement: 'top',
    trigger: 'hover',
    variant: 'default',
    bordered: true,
});

const ISLAND_CLIP_PATH =
    'M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006 C0.704,0.01,0.796,0.017,0.825,0.027 L0.827,0.028 C0.872,0.045,0.939,0.044,0.978,0.17 C1,0.254,1,0.365,0.99,0.505 L0.988,0.513 C0.979,0.558,0.971,0.598,0.965,0.633 C0.956,0.689,0.979,0.77,0.964,0.865 C0.953,0.928,0.921,0.966,0.869,0.979 C0.821,0.986,0.773,0.992,0.726,0.995 L0.712,0.996 L0.694,0.997 C0.648,1,0.586,1,0.507,1 L0.501,1 L0.464,1 C0.385,1,0.325,0.998,0.283,0.995 C0.234,0.992,0.184,0.987,0.133,0.979 C0.081,0.966,0.05,0.928,0.039,0.865 C0.023,0.77,0.047,0.689,0.037,0.633 C0.031,0.595,0.023,0.552,0.013,0.505 C-0.006,0.365,-0.002,0.254,0.024,0.17 C0.064,0.045,0.13,0.045,0.174,0.028 L0.175,0.028 C0.204,0.017,0.303,0.009,0.474,0.005 L0.501,0.005';
const ISLAND_BG = 'rgb(247, 243, 223)';
const ISLAND_STROKE = '#c4b89e';

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const uid = Math.random().toString(36).slice(2, 10);
const clipId = `animal-tooltip-clip-${uid}`;

function show() {
    if (timer) clearTimeout(timer);
    visible.value = true;
}
function hide() {
    timer = setTimeout(() => (visible.value = false), 100);
}
function toggle() {
    visible.value = !visible.value;
}

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
});

const placementClass = computed(() =>
    `animal-tooltip__bubble--${props.placement.replace(/-/g, '_')}`
);

const isIsland = computed(() => props.variant === 'island');

const triggerHandlers = computed(() => {
    if (props.trigger === 'hover') {
        return { onMouseenter: show, onMouseleave: hide };
    }
    if (props.trigger === 'focus') {
        return { onFocusin: show, onFocusout: hide };
    }
    return { onClick: toggle };
});
</script>

<template>
    <span class="animal-tooltip" v-bind="attrs">
        <span class="animal-tooltip__trigger" v-bind="triggerHandlers">
            <slot />
        </span>
        <div
            class="animal-tooltip__bubble"
            :class="[
                placementClass,
                {
                    'animal-tooltip__bubble--island': isIsland,
                    'animal-tooltip__bubble--bordered': bordered,
                    'animal-tooltip__bubble--borderless': !bordered,
                    'animal-tooltip__bubble--visible': visible,
                },
            ]"
            role="tooltip"
            :aria-hidden="!visible"
            @mouseenter="trigger === 'hover' ? show() : null"
            @mouseleave="trigger === 'hover' ? hide() : null"
        >
            <template v-if="isIsland">
                <div class="animal-tooltip__island-body">
                    <svg
                        style="position: absolute; width: 0; height: 0"
                        aria-hidden="true"
                    >
                        <clipPath :id="clipId" clipPathUnits="objectBoundingBox">
                            <path :d="ISLAND_CLIP_PATH" />
                        </clipPath>
                    </svg>
                    <svg
                        v-if="bordered"
                        class="animal-tooltip__island-svg"
                        viewBox="0 0 1 1"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            :d="ISLAND_CLIP_PATH"
                            :fill="ISLAND_BG"
                            :stroke="ISLAND_STROKE"
                            stroke-width="2"
                            vector-effect="non-scaling-stroke"
                            stroke-linejoin="round"
                        />
                    </svg>
                    <div
                        class="animal-tooltip__island-content"
                        :style="{ clipPath: `url(#${clipId})` }"
                    >
                        <div class="animal-tooltip__content">
                            <slot name="title">{{ title }}</slot>
                        </div>
                    </div>
                </div>
                <span class="animal-tooltip__tail" aria-hidden="true" />
            </template>
            <div v-else class="animal-tooltip__content">
                <slot name="title">{{ title }}</slot>
            </div>
        </div>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@tooltip-bg: rgb(247, 243, 223);
@tooltip-border: #c4b89e;
@tooltip-gap: 10px;
@tooltip-arrow-size: 8px;
@island-arrow-size: 10px;

.animal-tooltip {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
    font-family: @font-family;
}
.animal-tooltip__trigger {
    display: inline-flex;
}

.animal-tooltip__bubble {
    position: absolute;
    z-index: 100;
    box-sizing: border-box;
    width: max-content;
    max-width: 240px;
    padding: 6px 12px;
    background: @tooltip-bg;
    border-radius: @border-radius-sm;
    box-shadow: @shadow-base;
    color: #725d42;
    font-size: @font-size-sm;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.01em;
    opacity: 0;
    pointer-events: none;
    transition: opacity @motion-duration-base @motion-ease,
        transform @motion-duration-base @motion-ease;

    &--visible {
        opacity: 1;
        pointer-events: auto;
    }

    &::after {
        content: '';
        position: absolute;
        width: @tooltip-arrow-size;
        height: @tooltip-arrow-size;
        background: @tooltip-bg;
        border-radius: 2px;
    }
}

.animal-tooltip__content {
    position: relative;
    z-index: 1;
    white-space: pre-line;
    word-break: break-word;
}

// Border config
.animal-tooltip__bubble:not(.animal-tooltip__bubble--island).animal-tooltip__bubble--bordered {
    border: @border-width solid @tooltip-border;
}
.animal-tooltip__bubble--borderless:not(.animal-tooltip__bubble--island)::after {
    border: none !important;
}

// Island variant
.animal-tooltip__bubble--island {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    max-width: 280px;

    &::after { display: none; }
}

.animal-tooltip__island-body {
    position: relative;
    width: max-content;
    max-width: 280px;
}
.animal-tooltip__island-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    z-index: 0;
}
.animal-tooltip__island-content {
    position: relative;
    z-index: 1;
    padding: 12px 20px;

    .animal-tooltip__content {
        font-weight: 600;
        line-height: 1.55;
        text-align: center;
    }
}

.animal-tooltip__bubble--island.animal-tooltip__bubble--bordered .animal-tooltip__island-body {
    padding: 2px;
    filter: drop-shadow(0 4px 14px rgba(121, 79, 39, 0.14));
}
.animal-tooltip__bubble--island.animal-tooltip__bubble--bordered .animal-tooltip__island-content {
    background: transparent;
}
.animal-tooltip__bubble--island.animal-tooltip__bubble--borderless .animal-tooltip__island-content {
    background: @tooltip-bg;
    filter: drop-shadow(0 4px 14px rgba(121, 79, 39, 0.14));
}

.animal-tooltip__tail {
    position: absolute;
    z-index: 2;
    pointer-events: none;
}

// Borderless island — circle
.animal-tooltip__bubble--island.animal-tooltip__bubble--borderless .animal-tooltip__tail {
    width: 14px;
    height: 14px;
    background: @tooltip-bg;
    border-radius: 50%;
}

// Bordered island — diamond
.animal-tooltip__bubble--island.animal-tooltip__bubble--bordered .animal-tooltip__tail {
    width: @island-arrow-size;
    height: @island-arrow-size;
    background: @tooltip-bg;
    border-radius: 2px;
}

// =========== Tail positions for island variant ============
@tail-positions: top, top_start, top_end, bottom, bottom_start, bottom_end,
    left, left_start, left_end, right, right_start, right_end;

// Borderless island tails
.animal-tooltip__bubble--island.animal-tooltip__bubble--borderless {
    &.animal-tooltip__bubble--top .animal-tooltip__tail { bottom: -5px; left: 50%; transform: translateX(-50%); }
    &.animal-tooltip__bubble--top_start .animal-tooltip__tail { bottom: -5px; left: 20px; }
    &.animal-tooltip__bubble--top_end .animal-tooltip__tail { bottom: -5px; right: 20px; }
    &.animal-tooltip__bubble--bottom .animal-tooltip__tail { top: -5px; left: 50%; transform: translateX(-50%); }
    &.animal-tooltip__bubble--bottom_start .animal-tooltip__tail { top: -5px; left: 20px; }
    &.animal-tooltip__bubble--bottom_end .animal-tooltip__tail { top: -5px; right: 20px; }
    &.animal-tooltip__bubble--left .animal-tooltip__tail { right: -5px; top: 50%; transform: translateY(-50%); }
    &.animal-tooltip__bubble--left_start .animal-tooltip__tail { right: -5px; top: 16px; }
    &.animal-tooltip__bubble--left_end .animal-tooltip__tail { right: -5px; bottom: 16px; }
    &.animal-tooltip__bubble--right .animal-tooltip__tail { left: -5px; top: 50%; transform: translateY(-50%); }
    &.animal-tooltip__bubble--right_start .animal-tooltip__tail { left: -5px; top: 16px; }
    &.animal-tooltip__bubble--right_end .animal-tooltip__tail { left: -5px; bottom: 16px; }
}

// Bordered island tails
.animal-tooltip__bubble--island.animal-tooltip__bubble--bordered {
    &.animal-tooltip__bubble--top .animal-tooltip__tail {
        bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--top_start .animal-tooltip__tail {
        bottom: -5px; left: 20px; transform: rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--top_end .animal-tooltip__tail {
        bottom: -5px; right: 20px; transform: rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--bottom .animal-tooltip__tail {
        top: -5px; left: 50%; transform: translateX(-50%) rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--bottom_start .animal-tooltip__tail {
        top: -5px; left: 20px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--bottom_end .animal-tooltip__tail {
        top: -5px; right: 20px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--left .animal-tooltip__tail {
        right: -5px; top: 50%; transform: translateY(-50%) rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--left_start .animal-tooltip__tail {
        right: -5px; top: 16px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--left_end .animal-tooltip__tail {
        right: -5px; bottom: 16px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--right .animal-tooltip__tail {
        left: -5px; top: 50%; transform: translateY(-50%) rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--right_start .animal-tooltip__tail {
        left: -5px; top: 16px; transform: rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
    &.animal-tooltip__bubble--right_end .animal-tooltip__tail {
        left: -5px; bottom: 16px; transform: rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}

// =========== Bubble positions ============
.animal-tooltip__bubble--top {
    bottom: calc(100% + @tooltip-gap);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    &.animal-tooltip__bubble--visible { transform: translateX(-50%) translateY(0); }
    &::after {
        bottom: -5px; left: 50%;
        transform: translateX(-50%) rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--top_start {
    bottom: calc(100% + @tooltip-gap); left: 0;
    transform: translateY(4px);
    &.animal-tooltip__bubble--visible { transform: translateY(0); }
    &::after {
        bottom: -5px; left: 16px; transform: rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--top_end {
    bottom: calc(100% + @tooltip-gap); right: 0;
    transform: translateY(4px);
    &.animal-tooltip__bubble--visible { transform: translateY(0); }
    &::after {
        bottom: -5px; right: 16px; transform: rotate(45deg);
        border-right: @border-width solid @tooltip-border;
        border-bottom: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--bottom {
    top: calc(100% + @tooltip-gap); left: 50%;
    transform: translateX(-50%) translateY(-4px);
    &.animal-tooltip__bubble--visible { transform: translateX(-50%) translateY(0); }
    &::after {
        top: -5px; left: 50%;
        transform: translateX(-50%) rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--bottom_start {
    top: calc(100% + @tooltip-gap); left: 0;
    transform: translateY(-4px);
    &.animal-tooltip__bubble--visible { transform: translateY(0); }
    &::after {
        top: -5px; left: 16px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--bottom_end {
    top: calc(100% + @tooltip-gap); right: 0;
    transform: translateY(-4px);
    &.animal-tooltip__bubble--visible { transform: translateY(0); }
    &::after {
        top: -5px; right: 16px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--left {
    right: calc(100% + @tooltip-gap); top: 50%;
    transform: translateY(-50%) translateX(4px);
    &.animal-tooltip__bubble--visible { transform: translateY(-50%) translateX(0); }
    &::after {
        right: -5px; top: 50%;
        transform: translateY(-50%) rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--left_start {
    right: calc(100% + @tooltip-gap); top: 0;
    transform: translateX(4px);
    &.animal-tooltip__bubble--visible { transform: translateX(0); }
    &::after {
        right: -5px; top: 12px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--left_end {
    right: calc(100% + @tooltip-gap); bottom: 0;
    transform: translateX(4px);
    &.animal-tooltip__bubble--visible { transform: translateX(0); }
    &::after {
        right: -5px; bottom: 12px; transform: rotate(45deg);
        border-top: @border-width solid @tooltip-border;
        border-right: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--right {
    left: calc(100% + @tooltip-gap); top: 50%;
    transform: translateY(-50%) translateX(-4px);
    &.animal-tooltip__bubble--visible { transform: translateY(-50%) translateX(0); }
    &::after {
        left: -5px; top: 50%;
        transform: translateY(-50%) rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--right_start {
    left: calc(100% + @tooltip-gap); top: 0;
    transform: translateX(-4px);
    &.animal-tooltip__bubble--visible { transform: translateX(0); }
    &::after {
        left: -5px; top: 12px; transform: rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
.animal-tooltip__bubble--right_end {
    left: calc(100% + @tooltip-gap); bottom: 0;
    transform: translateX(-4px);
    &.animal-tooltip__bubble--visible { transform: translateX(0); }
    &::after {
        left: -5px; bottom: 12px; transform: rotate(45deg);
        border-bottom: @border-width solid @tooltip-border;
        border-left: @border-width solid @tooltip-border;
    }
}
</style>
