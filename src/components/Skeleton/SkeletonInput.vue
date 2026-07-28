<script setup lang="ts">
interface Props {
    size?: 'small' | 'middle' | 'large';
    active?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'middle',
    active: true,
});

const INPUT_SIZE: Record<string, { width: number; height: number }> = {
    small: { width: 160, height: 32 },
    middle: { width: 200, height: 40 },
    large: { width: 240, height: 48 },
};
</script>

<template>
    <div
        class="animal-skeleton"
        :class="{
            'animal-skeleton--active': active,
            [`animal-skeleton--input-${size}`]: true,
        }"
        :style="{
            width: INPUT_SIZE[size].width + 'px',
            height: INPUT_SIZE[size].height + 'px',
            borderRadius: '50px',
        }"
        aria-hidden="true"
    />
</template>

<style lang="less" scoped>
// ============================================
// SkeletonInput — 继承 Skeleton 基础样式
// ============================================

@bg-base: #eae5db;
@shimmer-light: rgba(255, 252, 242, 0.55);
@shimmer-mid: rgba(255, 250, 235, 0.18);

.animal-skeleton {
    background: @bg-base;
    border-radius: 12px;
    display: inline-block;
    line-height: 1;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    flex-shrink: 0;
}

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
</style>
