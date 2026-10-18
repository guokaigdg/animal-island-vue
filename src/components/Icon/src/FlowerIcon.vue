<script setup lang="ts">
import { computed } from 'vue';
import { ICON_SVG } from './_svg-data';
import { parseSvgAttrs, resolveStrokeWidth, scaleInnerStrokes } from './_icon-runtime';

const props = defineProps<{
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    fill?: string;
    class?: string;
    style?: string | Record<string, unknown>;
    title?: string;
}>();

const data = ICON_SVG['Flower'];

const svgAttrs = computed<Record<string, string>>(() => (data ? parseSvgAttrs(data.attrs) : {}));

const svgElementProps = computed(() => {
    const base: Record<string, string> = { ...svgAttrs.value };
    if (props.color !== undefined) base.stroke = props.color;
    // 必须写 kebab：Vue 对 SVG 走 setAttribute，而 SVG 属性名区分大小写，
    // setAttribute('strokeWidth') 会造出一个 SVG 不认识的大写属性，strokeWidth prop 直接失效。
    if (props.strokeWidth !== undefined) base['stroke-width'] = String(resolveStrokeWidth(props.strokeWidth));
    if (props.fill !== undefined) base.fill = props.fill;
    return base;
});

// 内层描边也要跟着 strokeWidth 等比缩放，否则粗细层次会丢失（对齐上游 scaledStroke）
const innerHtml = computed(() => (data ? scaleInnerStrokes(data.inner, props.strokeWidth) : ''));

const sizeStr = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));
const svgStyle = computed(() => ({ width: sizeStr.value, height: sizeStr.value }));
</script>

<template>
    <svg v-if="data" v-bind="svgElementProps" :class="props.class" :style="svgStyle" v-html="innerHtml" />
</template>
