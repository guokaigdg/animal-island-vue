<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { ICON_SVG } from './src/_svg-data';
import { parseSvgAttrs, resolveStrokeWidth, scaleInnerStrokes } from './src/_icon-runtime';
import type { IconProps } from './types';

const props = withDefaults(defineProps<IconProps>(), {
    size: 24,
    color: '#2A2A2A',
    strokeWidth: 3.5,
    bounce: false,
});

const attrs = useAttrs();

// Find SVG data for the icon name
const svgData = computed(() => {
    if (props.name && ICON_SVG[props.name]) {
        return ICON_SVG[props.name];
    }
    return null;
});

const isCustomIcon = computed(() => !!props.icon);

const svgAttrs = computed<Record<string, string>>(() => {
    if (!svgData.value) return {};
    return parseSvgAttrs(svgData.value.attrs);
});

// 内层描边也要跟着 strokeWidth 等比缩放，否则粗细层次会丢失（对齐上游 scaledStroke）
const svgInner = computed(() => (svgData.value ? scaleInnerStrokes(svgData.value.inner, props.strokeWidth) : ''));

// Build SVG element props (override with color/strokeWidth/fill if provided)
const svgElementProps = computed<Record<string, unknown>>(() => {
    const base: Record<string, string> = { ...svgAttrs.value };
    if (props.color !== undefined) base.stroke = props.color;
    // 必须写 kebab：Vue 对 SVG 元素走 setAttribute，而 SVG 属性名区分大小写，
    // setAttribute('strokeWidth') 会造出一个 SVG 不认识的大写属性，strokeWidth prop 直接失效。
    if (props.strokeWidth !== undefined) base['stroke-width'] = String(resolveStrokeWidth(props.strokeWidth));
    if (props.fill !== undefined) base.fill = props.fill;
    return base;
});

const sizeStr = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));

/** 用户透传的 style（React：{...style} 覆盖 size 默认宽高），与 svgStyle 合并 */
const userStyle = computed<Record<string, unknown>>(() => {
    const raw = attrs.style;
    if (raw === undefined || raw === null) return {};
    return typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
});

const svgStyle = computed(() => ({
    width: sizeStr.value,
    height: sizeStr.value,
    ...userStyle.value,
}));

/**
 * 透传属性，剔除本组件已单独处理的 class / style。
 * 对齐 React 端 `<IconCmp ... {...(rest as SVGProps)} />`：name / icon / src 三种模式都应把
 * id / data-* / aria-* 等透传到渲染出的元素上。
 */
const restAttrs = computed<Record<string, unknown>>(() => {
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'class' || key === 'style') continue;
        rest[key] = value;
    }
    return rest;
});

/**
 * Mode 1（icon 自定义组件）透传属性。
 * 对齐 React：`passthrough = {...rest}`，并在显式传入时用 color→stroke、strokeWidth 覆盖内置默认值。
 */
const iconPassthrough = computed<Record<string, unknown>>(() => ({
    ...restAttrs.value,
    ...(props.color !== undefined ? { stroke: props.color } : null),
    ...(props.strokeWidth !== undefined ? { strokeWidth: String(props.strokeWidth) } : null),
}));

const labeled = computed(() => !!attrs['aria-label']);

// Compute class
// 规范前缀是 animal-icon（全库 animal-* 约定）。旧的 animal-island-icon 一并保留，
// 改名对消费方是破坏性的，不能只换新的就把写死了旧类名的样式打断。
const classes = computed(() => {
    const list = ['animal-icon', 'animal-island-icon'];
    if (props.bounce) list.push('animal-icon--bounce', 'animal-island-icon--bounce');
    if (attrs.class) list.push(String(attrs.class));
    return list.filter(Boolean).join(' ');
});

// For src mode（对齐 React：{...style} 覆盖 size 默认宽高）
const spanStyle = computed(() => ({
    width: sizeStr.value,
    height: sizeStr.value,
    ...(props.src ? { backgroundImage: `url(${props.src})` } : null),
    ...userStyle.value,
}));

defineOptions({ inheritAttrs: false });
</script>

<template>
    <!-- Mode 1: custom icon component (passed via icon prop) -->
    <component
        :is="props.icon"
        v-if="isCustomIcon"
        :class="classes"
        :style="svgStyle"
        :aria-hidden="labeled ? undefined : true"
        :role="labeled ? 'img' : undefined"
        v-bind="iconPassthrough"
    />

    <!-- Mode 2: name-based icon -->
    <svg
        v-else-if="svgData"
        v-bind="{ ...svgElementProps, ...restAttrs }"
        :class="classes"
        :style="svgStyle"
        :aria-hidden="labeled ? undefined : true"
        :role="labeled ? 'img' : undefined"
        v-html="svgInner"
    />

    <!-- Mode 3: src (image url) -->
    <span v-else :class="classes" :style="spanStyle" v-bind="restAttrs" />
</template>

<style lang="less">
// 选择器同时挂新旧两个类名：组件渲染时会同时输出 animal-icon 与 animal-island-icon，
// 老样式写死 .animal-island-icon 的消费方不必改就能继续生效。
.animal-icon,
.animal-island-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
}

.animal-icon--bounce,
.animal-island-icon--bounce {
    &:hover {
        animation: animal-icon-bounce 0.3s ease-in-out forwards;
    }
}

@keyframes animal-icon-bounce {
    0% {
        transform: scale(1) rotate(0deg);
    }
    50% {
        transform: scale(1.2) rotate(-5deg);
    }
    100% {
        transform: scale(1.1) rotate(-4deg);
    }
}
</style>
