<script setup lang="ts">
interface Props {
    size?: 'small' | 'middle' | 'large';
    active?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'middle',
    active: true,
});

const BTN_SIZE: Record<string, { width: number; height: number }> = {
    small: { width: 80, height: 32 },
    middle: { width: 100, height: 45 },
    large: { width: 130, height: 48 },
};
</script>

<template>
    <div
        class="animal-skeleton animal-skeleton--btn"
        :class="{
            'animal-skeleton--active': active,
            [`animal-skeleton--btn-${size}`]: true,
        }"
        :style="{
            width: BTN_SIZE[size].width + 'px',
            height: BTN_SIZE[size].height + 'px',
            borderRadius: '50px',
        }"
        aria-hidden="true"
    />
</template>

<style lang="less" scoped>
.animal-skeleton--btn {
    border-radius: 50px;
}
</style>
