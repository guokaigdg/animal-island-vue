<script setup lang="ts">
import type { FooterType } from './types';

interface Props {
    type?: FooterType;
    seamless?: boolean;
}

withDefaults(defineProps<Props>(), { type: 'tree', seamless: false });
</script>

<template>
    <div
        class="animal-footer"
        :class="[`animal-footer--${type}`, { 'animal-footer--seamless': seamless }]"
    />
</template>

<style lang="less" scoped>
.animal-footer {
    width: 100%;
    height: 80px;
    background-repeat: no-repeat;

    &--sea {
        background: url('../../assets/img/footer/footer-sea.svg') center / contain no-repeat;
    }
    &--tree {
        background: url('../../assets/img/footer/footer-tree.webp') bottom center / cover no-repeat;
    }
    &--seamless {
        background-repeat: repeat-x;
        background-size: auto 100%;
        background-position: left bottom;
    }
}
</style>
