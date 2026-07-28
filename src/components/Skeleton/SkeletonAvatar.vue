<script setup lang="ts">
interface Props {
    size?: 'small' | 'middle' | 'large';
    shape?: 'circle' | 'square';
    active?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'middle' as const,
    shape: 'circle' as const,
    active: true,
});
</script>

<template>
    <div
        class="animal-skeleton"
        :class="{
            'animal-skeleton--active': active,
            [`animal-skeleton--avatar-${size}`]: true,
            'animal-skeleton--avatar-circle': shape === 'circle',
            'animal-skeleton--avatar-square': shape === 'square',
        }"
        :style="{
            width: (size === 'small' ? 32 : size === 'large' ? 56 : 44) + 'px',
            height: (size === 'small' ? 32 : size === 'large' ? 56 : 44) + 'px',
            borderRadius: shape === 'circle' ? '50%' : '12px',
        }"
        aria-hidden="true"
    />
</template>

<style lang="less" scoped>
// ============================================
// SkeletonAvatar — 继承 Skeleton 基础样式
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
