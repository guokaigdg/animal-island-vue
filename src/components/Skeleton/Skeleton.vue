<script setup lang="ts">
import { computed } from 'vue';
import type { SkeletonVariant } from './types';

const DEFAULT_PARAGRAPH_WIDTHS = ['100%', '92%', '84%', '76%', '68%'];

interface Props {
    loading?: boolean;
    variant?: SkeletonVariant;
    active?: boolean;
    rows?: number;
    width?: number | string;
    rowWidths?: (number | string)[];
    widthValue?: number | string;
    heightValue?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    variant: 'text',
    active: true,
    rows: 3,
});

defineSlots<{ default?: () => unknown }>();

const paragraphWidths = computed<(number | string)[]>(() => {
    const widths = Array.isArray(props.rowWidths) ? props.rowWidths : DEFAULT_PARAGRAPH_WIDTHS;
    const rowCount = Math.max(1, props.rows);
    return Array.from({ length: rowCount }, (_, i) => {
        return widths[i] ?? widths[widths.length - 1] ?? '100%';
    });
});

const circleSize = computed(() => props.widthValue ?? props.heightValue ?? 44);
const rectWidth = computed(() => props.widthValue ?? '100%');
const rectHeight = computed(() => props.heightValue ?? 120);
const textWidth = computed(() => props.width ?? '100%');
</script>

<template>
    <!-- loading=false 且有 children 时直接渲染插槽内容 -->
    <template v-if="!loading && $slots.default">
        <slot />
    </template>

    <!-- paragraph 段落模式 -->
    <template v-else-if="variant === 'paragraph'">
        <div
            class="animal-skeleton animal-skeleton--vt-paragraph animal-skeleton--paragraph-block"
            :class="{ 'animal-skeleton--active': active }"
        >
            <div v-for="(w, i) in paragraphWidths" :key="i" class="animal-skeleton--line" :style="{ width: w }" />
        </div>
    </template>

    <!-- circle 圆形 -->
    <div
        v-else-if="variant === 'circle'"
        class="animal-skeleton animal-skeleton--vt-circle"
        :class="{ 'animal-skeleton--active': active }"
        :style="{ width: circleSize, height: circleSize }"
        aria-hidden="true"
    />

    <!-- rect 矩形 -->
    <div
        v-else-if="variant === 'rect'"
        class="animal-skeleton animal-skeleton--vt-rect"
        :class="{ 'animal-skeleton--active': active }"
        :style="{ width: rectWidth, height: rectHeight }"
        aria-hidden="true"
    />

    <!-- text 文字（默认） -->
    <div
        v-else
        class="animal-skeleton animal-skeleton--vt-text"
        :class="{ 'animal-skeleton--active': active }"
        :style="{ width: textWidth }"
        aria-hidden="true"
    />
</template>

<style lang="less" scoped>
// ============================================
// Skeleton — Animal Island Style
// 骨架屏加载占位组件，浅灰基调 + 银白流光
// ============================================

@bg-base: #eae5db;
@bg-line: #dfd9ce;
@shimmer-light: rgba(255, 252, 242, 0.55);
@shimmer-mid: rgba(255, 250, 235, 0.18);

@border-radius-sm: 12px;
@border-radius-base: 18px;

// ---------- Root ----------
.animal-skeleton {
    background: @bg-base;
    border-radius: @border-radius-sm;
    display: inline-block;
    line-height: 1;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    flex-shrink: 0;
}

// ---------- Active shimmer animation (银白流光) ----------
.animal-skeleton--active {
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, @shimmer-mid, @shimmer-light, @shimmer-mid, transparent);
        animation: animal-skeleton-shimmer 1.6s ease-in-out infinite;
    }
}

@keyframes animal-skeleton-shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

// ---------- Variants ----------
.animal-skeleton--vt-text {
    border-radius: 12px;
    height: 16px;
    margin-bottom: 8px;
}

.animal-skeleton--vt-circle {
    border-radius: 50%;
}

.animal-skeleton--vt-rect {
    border-radius: 18px;
}

.animal-skeleton--vt-paragraph {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 0;
    background: none;
}

.animal-skeleton--paragraph-block {
    background: none;
}

.animal-skeleton--line {
    height: 14px;
    border-radius: 12px;
    background: @bg-line;

    &:last-child {
        width: 60%;
    }
}
</style>
