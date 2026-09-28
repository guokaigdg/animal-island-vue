<script setup lang="ts">
import { computed } from 'vue';
import type { FooterProps } from './types';

const props = withDefaults(defineProps<FooterProps>(), {
    text: 'All Rights Reserved.',
});

// 年份默认取当前年份（动态获取），传入 year 可覆盖
const displayYear = computed(() => props.year ?? new Date().getFullYear());
</script>

<template>
    <footer class="animal-footer">© {{ displayYear }} {{ props.text }}</footer>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-footer {
    color: #807d75;
    font-size: 12px;
    padding: 16px 0;
    text-align: center;
}
</style>
