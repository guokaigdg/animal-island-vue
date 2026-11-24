<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

/** 提示位置使用绘图坐标，横向边界同时考虑局部滚动位置。 */
const props = withDefaults(
    defineProps<{
        /** 无障碍关联标识 */
        id: string;
        /** 数据点横坐标 */
        x: number;
        /** 数据点纵坐标 */
        y: number;
        /** 绘图区高度 */
        height: number;
        /** 当前可视宽度 */
        viewportWidth: number;
        /** 绘图区横向滚动距离 */
        scrollLeft: number;
        /** 锁定后才接收指针，防止悬浮提示抢先遮住待点击的数据点 */
        locked: boolean;
    }>(),
    { locked: false }
);

defineSlots<{
    default?: () => unknown;
}>();

const root = ref<HTMLElement | null>(null);
const measuredHeight = ref(0);
let observer: ResizeObserver | undefined;

function measure() {
    const element = root.value;
    if (element) measuredHeight.value = element.getBoundingClientRect().height;
}

onMounted(() => {
    // 不能假设提示只有两行：聚合、多行名称和自定义内容都可能改变实际高度。
    measure();
    if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure);
        if (root.value) observer.observe(root.value);
    }
});

onBeforeUnmount(() => observer?.disconnect());

watch(() => [props.x, props.y, props.height, props.viewportWidth, props.locked], () => {
    // 内容或位置变化后重新测量，限制提示始终位于绘图区内。
    measure();
});
</script>

<script lang="ts">
export default {
    name: 'ChartTooltip',
};
</script>

<template>
    <div
        :id="props.id"
        ref="root"
        role="tooltip"
        :class="['animal-chart__tooltip', props.locked && 'animal-chart__tooltip--locked']"
        :style="{
            left: Math.max(
                props.scrollLeft + 8,
                Math.min(
                    props.x + 16 + Math.min(260, Math.max(1, props.viewportWidth - 16)) <=
                        props.scrollLeft + props.viewportWidth - 8
                        ? props.x + 16
                        : props.x - Math.min(260, Math.max(1, props.viewportWidth - 16)) - 16,
                    props.scrollLeft + props.viewportWidth - Math.min(260, Math.max(1, props.viewportWidth - 16)) - 8
                )
            ) + 'px',
            top:
                Math.max(
                    8,
                    Math.min(
                        props.height - measuredHeight - 8,
                        props.y - measuredHeight - 14 >= 8 ? props.y - measuredHeight - 14 : props.y + 16
                    )
                ) + 'px',
            width: Math.min(260, Math.max(1, props.viewportWidth - 16)) + 'px',
            maxHeight: props.height - 16 + 'px',
        }"
    >
        <slot />
    </div>
</template>

<style lang="less">
@import '@/styles/variables.less';

.animal-chart__tooltip {
    position: absolute;
    box-sizing: border-box;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--animal-bg-color, #fffdf4);
    box-shadow: 0 4px 14px rgba(61, 52, 40, 0.16);
    overflow: auto;
    pointer-events: none;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--animal-text-color-disabled, #c8bba3) transparent;
    z-index: 1;
    font-size: 12px;
    overflow-wrap: anywhere;
    color: var(--animal-text-color, #794f27);
    line-height: 1.6;
    font-variant-numeric: tabular-nums;
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');

    span,
    strong,
    small {
        color: inherit;
    }
}

.animal-chart__tooltip--locked {
    pointer-events: auto;
}

.animal-chart__tooltip-title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--animal-border-color-light, #e8e2d6);
    font-size: 13px;
}

.animal-chart__tooltip-locked {
    font-size: 11px;
}

.animal-chart__tooltip-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 10px;

    .animal-chart__swatch {
        margin-top: 5px;
    }
}

.animal-chart__tooltip-value {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    flex: 1;
    min-width: 0;
    gap: 3px 12px;

    strong {
        text-align: right;
        max-width: 16ch;
    }

    small {
        grid-column: 1 / -1;
        font-size: 11px;
    }
}

.animal-chart__tooltip-hint {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--animal-border-color-light, #e8e2d6);
    font-size: 11px;
}
</style>
