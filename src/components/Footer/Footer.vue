<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Icon } from '../Icon';
import { ICON_LIST } from '../Icon/src/_svg-data';
import type { FooterProps } from './types';

const props = withDefaults(defineProps<FooterProps>(), {
    size: 24,
});

// All 101 icon names
const FULL_NAMES: string[] = ICON_LIST.map((item) => item.name);

const containerRef = ref<HTMLElement | null>(null);
const cycles = ref(1);
let resizeObserver: ResizeObserver | null = null;

const iconNames = props.name ? [props.name] : FULL_NAMES;
const cycleWidth = iconNames.length * props.size;

const updateCycles = () => {
    const el = containerRef.value;
    if (!el) return;
    cycles.value = Math.max(1, Math.ceil(el.clientWidth / cycleWidth) + 1);
};

onMounted(() => {
    updateCycles();
    if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
        resizeObserver = new ResizeObserver(updateCycles);
        resizeObserver.observe(containerRef.value);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
});

watch(
    () => [props.size, props.name],
    () => {
        updateCycles();
    }
);
</script>

<template>
    <div ref="containerRef" class="animal-footer">
        <div v-for="c in cycles" :key="c" class="animal-footer__cycle" :aria-hidden="c > 1 ? true : undefined">
            <Icon v-for="iconName in iconNames" :key="iconName" :name="iconName as never" :size="props.size" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.animal-footer {
    width: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    user-select: none;

    &__cycle {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }
}
</style>
