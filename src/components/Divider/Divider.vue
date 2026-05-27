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

    // ---------- Dashed (CSS-only, no asset) ----------
    // 12px 节奏 + 6px dash + 6px gap，居中绘制 2px 粗细的破折线
    &--dashed-brown,
    &--dashed-teal,
    &--dashed-white,
    &--dashed-yellow {
        background-repeat: repeat-x;
        background-position: center;
        background-size: 12px 2px;
    }
    &--dashed-brown { background-image: linear-gradient(to right, #c4b89e 50%, transparent 50%); }
    &--dashed-teal { background-image: linear-gradient(to right, #19c8b9 50%, transparent 50%); }
    &--dashed-white { background-image: linear-gradient(to right, #ffffff 50%, transparent 50%); }
    &--dashed-yellow { background-image: linear-gradient(to right, #f5d04a 50%, transparent 50%); }
}
</style>
