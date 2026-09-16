<script setup lang="ts">
import { computed } from 'vue';
import type { FooterProps } from './types';

const props = withDefaults(defineProps<FooterProps>(), {
    text: 'All Rights Reserved.',
});

// 年份缺省取当前年份（对齐 React：year ?? new Date().getFullYear()）
const displayYear = computed(() => props.year ?? new Date().getFullYear());
</script>

<template>
    <footer class="animal-footer">
        © {{ displayYear }} {{ text }}
    </footer>
</template>

<style lang="less" scoped>
.animal-footer {
    color: #807d75;
    font-size: 12px;
    padding: 16px 0;
    text-align: center;
}
</style>
