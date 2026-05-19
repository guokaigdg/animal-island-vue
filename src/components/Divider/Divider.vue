<script setup lang="ts">
import type { DividerType } from './types';

withDefaults(defineProps<{ type?: DividerType }>(), {
    type: 'line-brown',
});
</script>

<template>
    <div class="animal-divider" :class="`animal-divider--${type}`" />
</template>

<style lang="less" scoped>
.animal-divider {
    width: 100%;
    height: 12px;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;

    &--line-brown { background-image: url('../../assets/img/dividers/divider-line-brown.svg'); }
    &--line-teal { background-image: url('../../assets/img/dividers/divider-line-teal.svg'); }
    &--line-white { background-image: url('../../assets/img/dividers/divider-line-white.png'); }
    &--line-yellow { background-image: url('../../assets/img/dividers/divider-line-yellow.svg'); }
    &--wave-yellow { background-image: url('../../assets/img/dividers/wave-yellow.svg'); }
}
</style>
