<script setup lang="ts">
import { computed } from 'vue';
import { ICON_SVG } from './_svg-data';

const props = defineProps<{
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    class?: string;
    style?: string | Record<string, unknown>;
    title?: string;
}>();

const data = ICON_SVG['Headphones'];

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
    if (!data) return {};
    return parseSvgAttrs(data.attrs);
});

const svgElementProps = computed(() => {
    const base = { ...svgAttrs.value };
    if (props.color !== undefined) base.stroke = props.color;
    if (props.strokeWidth !== undefined) base.strokeWidth = String(props.strokeWidth);
    return base;
});

const sizeStr = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size);
const svgStyle = computed(() => ({ width: sizeStr.value, height: sizeStr.value }));
</script>

<template>
    <svg v-if="data" v-bind="svgElementProps" :class="props.class" :style="svgStyle" v-html="data.inner" />
</template>
