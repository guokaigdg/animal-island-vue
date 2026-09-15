<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { ICON_SVG } from './src/_svg-data';
import type { IconProps } from './types';

const props = withDefaults(defineProps<IconProps>(), {
    size: 24,
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

// Parse React svg attrs string into object
function parseSvgAttrs(attrStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /([a-zA-Z-]+)=(?:"([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrStr)) !== null) {
        result[m[1]] = m[2] !== undefined ? m[2] : m[3];
    }
    return result;
}

const svgAttrs = computed<Record<string, string>>(() => {
    if (!svgData.value) return {};
    return parseSvgAttrs(svgData.value.attrs);
});

const svgInner = computed(() => svgData.value?.inner || '');

// Build SVG element props (override with color/strokeWidth if provided)
const svgElementProps = computed<Record<string, unknown>>(() => {
    const base: Record<string, string> = { ...svgAttrs.value };
    if (props.color !== undefined) base.stroke = props.color;
    if (props.strokeWidth !== undefined) base.strokeWidth = String(props.strokeWidth);
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
const classes = computed(() => {
    const list = ['animal-island-icon'];
    if (props.bounce) list.push('animal-island-icon--bounce');
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
.animal-island-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
}

.animal-island-icon--bounce {
    &:hover {
        animation: animal-island-icon-bounce 0.3s ease-in-out forwards;
    }
}

@keyframes animal-island-icon-bounce {
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
