<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import type { IconName } from './types';

interface Props {
    name: IconName;
    size?: number | string;
    bounce?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 24,
    bounce: false,
});

const sizeStyle = computed<CSSProperties>(() => ({
    width: typeof props.size === 'number' ? `${props.size}px` : props.size,
    height: typeof props.size === 'number' ? `${props.size}px` : props.size,
}));
</script>

<template>
    <span
        class="animal-icon"
        :class="[`animal-icon--${name}`, { 'animal-icon--bounce': bounce }]"
        :style="sizeStyle"
    />
</template>

<style lang="less" scoped>
.animal-icon {
    display: inline-block;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    &--bounce:hover {
        animation: animal-icon-bounce 0.3s ease-in-out forwards;
    }

    &--icon-miles { background-image: url('../../assets/img/icons/icon-miles.svg'); }
    &--icon-camera { background-image: url('../../assets/img/icons/icon-camera.svg'); }
    &--icon-chat { background-image: url('../../assets/img/icons/icon-chat.svg'); }
    &--icon-critterpedia { background-image: url('../../assets/img/icons/icon-critterpedia.svg'); }
    &--icon-design { background-image: url('../../assets/img/icons/icon-design.svg'); }
    &--icon-diy { background-image: url('../../assets/img/icons/icon-diy.svg'); }
    &--icon-helicopter { background-image: url('../../assets/img/icons/icon-helicopter.svg'); }
    &--icon-map { background-image: url('../../assets/img/icons/icon-map.svg'); }
    &--icon-shopping { background-image: url('../../assets/img/icons/icon-shopping.svg'); }
    &--icon-variant { background-image: url('../../assets/img/icons/icon-variant.svg'); }
}

@keyframes animal-icon-bounce {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(-5deg); }
    100% { transform: scale(1.1) rotate(-4deg); }
}
</style>
