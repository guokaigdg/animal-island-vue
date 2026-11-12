<script setup lang="ts">
import { computed, toRaw, useAttrs } from 'vue';
import { ICON_MAP } from './_icons';
import type { IconProps } from './types';

const props = withDefaults(defineProps<IconProps>(), {
    size: 24,
    color: '#2A2A2A',
    strokeWidth: 3.5,
    bounce: false,
});

const attrs = useAttrs();

const isCustomIcon = computed(() => !!props.icon);

/**
 * toRaw：组件放进 ref 里再传进来时会被包成 reactive 代理，
 * 直接用会让 Vue 抱怨「Component that was made a reactive object」。
 */
const customIcon = computed(() => (props.icon ? toRaw(props.icon) : undefined));

/** 按名渲染：图标名 → naive-icons-vue 的图标组件 */
const namedIcon = computed(() => (props.name ? ICON_MAP[props.name] : undefined));

/** 用户透传的 style（React：{...style} 覆盖 size 默认宽高），与 svgStyle 合并 */
const userStyle = computed<Record<string, unknown>>(() => {
    const raw = attrs.style;
    if (raw === undefined || raw === null) return {};
    return typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
});

const sizeStr = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));

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
 * 交给图标组件的 props。
 *
 * naive-icons-vue 的图标约定是 size / color / strokeWidth / fill，按这套契约传，
 * 组件内部再换算成 svg 的 width / height / stroke / stroke-width，
 * 内层描边也会跟着 strokeWidth 等比缩放，粗细层次保持不变。
 */
const iconProps = computed<Record<string, unknown>>(() => ({
    ...restAttrs.value,
    size: props.size,
    color: props.color,
    strokeWidth: props.strokeWidth,
    fill: props.fill,
    // 上游只在 title 时给 role="img"；这里给「只带 aria-label」的情况补一个，
    // 让有 aria-label 的图标保持可访问性语义。
    ...(attrs['aria-label'] && !attrs.role ? { role: 'img' } : null),
}));

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
    <component :is="customIcon" v-if="isCustomIcon" :class="classes" :style="svgStyle" v-bind="iconProps" />

    <!-- Mode 2: name-based icon -->
    <component :is="namedIcon" v-else-if="namedIcon" :class="classes" :style="svgStyle" v-bind="iconProps" />

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
