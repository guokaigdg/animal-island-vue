<script setup lang="ts">
import type { FooterType } from './types';

interface Props {
    type?: FooterType;
}

withDefaults(defineProps<Props>(), { type: 'tree' });
</script>

<template>
    <div class="animal-footer" :class="`animal-footer--${type}`" />
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
}
</style>
