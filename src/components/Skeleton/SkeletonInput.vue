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
