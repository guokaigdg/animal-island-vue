<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component, type PropType } from 'vue';
import type { DividerType } from './types';

// icon 收的是图标组件本身（对齐 React 的 icon={<FishIcon size={24} />}），
// 图标尺寸由图标组件自己的 size 决定，这里只按 iconSize 算「图标 + 连接线」的循环节奏。
const props = defineProps({
    type: { type: String as PropType<DividerType>, default: 'dashed-brown' },
    icon: { type: [Object, Function] as PropType<Component>, default: undefined },
    iconSize: { type: Number, default: 24 },
    iconGap: { type: Number, default: 8 },
});

const el = ref<HTMLElement | null>(null);
const cycles = ref(1);

const iconMode = computed(() => !!props.icon);
const cycleWidth = computed(() => props.iconSize + props.iconGap);

function updateCycles() {
    const node = el.value;
    if (!node) return;
    cycles.value = Math.max(1, Math.floor(node.clientWidth / cycleWidth.value));
}

let resizeObserver: ResizeObserver | undefined;

function ensureObserver() {
    if (typeof ResizeObserver === 'undefined' || !el.value || resizeObserver) return;
    resizeObserver = new ResizeObserver(updateCycles);
    resizeObserver.observe(el.value);
}

onMounted(() => {
    if (!iconMode.value) return;
    updateCycles();
    ensureObserver();
});

watch([iconMode, () => props.iconSize, () => props.iconGap], () => {
    if (!iconMode.value) {
        resizeObserver?.disconnect();
        resizeObserver = undefined;
        return;
    }
    updateCycles();
    ensureObserver();
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});

const rootClass = computed(() => [
    'animal-divider',
    iconMode.value ? 'animal-divider--icon' : `animal-divider--${props.type}`,
]);
</script>

<template>
    <div ref="el" :class="rootClass" :aria-hidden="iconMode ? 'true' : undefined">
        <template v-if="iconMode">
            <div v-for="c in cycles" :key="c" class="animal-divider__icon-cycle">
                <component :is="icon" />
                <span v-if="c < cycles" class="animal-divider__icon-gap" :style="{ width: iconGap + 'px' }">
                    <span class="animal-divider__icon-line" />
                </span>
            </div>
        </template>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-divider {
    width: 100%;
    height: 12px;
    background-position: center;
    background-repeat: repeat-x;
    background-size: 12px 2px;
    // 默认 type=dashed-brown
    background-image: linear-gradient(to right, #c4b89e 50%, transparent 50%);
}

.animal-divider--dashed-brown {
    background-image: linear-gradient(to right, #c4b89e 50%, transparent 50%);
}

// thin — 1px 实心细线
.animal-divider--thin {
    height: 1px;
    background-image: none;
    background: #e8dec7;
}

// hairline — 1px 细密虚线（6px 节奏）
.animal-divider--hairline {
    height: 1px;
    background-size: 6px 1px;
    background-image: linear-gradient(to right, #d5c3a2 50%, transparent 50%);
}

// wave-yellow — 黄色波浪线（内联 SVG data-URI，40px 周期，round 线帽）
.animal-divider--wave-yellow {
    height: 14px;
    background-size: 40px 14px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 14' preserveAspectRatio='none'%3E%3Cpath d='M0 7 Q10 0 20 7 T40 7' fill='none' stroke='%23f5d04a' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
}

// squiggle — 主题青色波浪线（内联 SVG data-URI，120px 固定宽度平铺，首尾水平衔接无缝）
.animal-divider--squiggle {
    height: 10px;
    background-size: 120px 10px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 10'%3E%3Cpath d='M0 2.5 C 30 2.5, 30 7.5, 60 7.5 C 90 7.5, 90 2.5, 120 2.5' fill='none' stroke='%2319c8b9' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E");
}

// ---------- icon divider（单图标相连分割线：图标 + 连接线循环铺满） ----------
.animal-divider--icon {
    display: flex;
    width: 100%;
    overflow: hidden;
    align-items: center;
    min-height: 20px;
}

.animal-divider__icon-cycle {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
}

// 图标间距：容纳连接线的空隙，连接线在其中水平居中（两侧留白，视觉位于两图标中间）
.animal-divider__icon-gap {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.animal-divider__icon-line {
    flex: 0 0 auto;
    width: 4px;
    height: 2px;
    background: #c4b89e;
}
</style>
