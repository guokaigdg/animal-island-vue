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
