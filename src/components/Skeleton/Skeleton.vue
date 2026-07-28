<script setup lang="ts">
import { computed } from 'vue';

const DEFAULT_PARAGRAPH_WIDTHS = ['100%', '92%', '84%', '76%', '68%'];

const props = defineProps({
    loading: { type: Boolean, default: true },
    variant: { type: String as import('vue').PropType<'text' | 'circle' | 'rect' | 'paragraph'>, default: 'text' },
    active: { type: Boolean, default: true },
    rows: { type: Number, default: 3 },
    width: { type: [Number, String] },
    rowWidths: { type: Array as import('vue').PropType<(number | string)[]> },
    widthValue: { type: [Number, String] },
    heightValue: { type: [Number, String] },
});

defineSlots<{ default?: () => unknown }>();

const isParagraph = computed(() => props.variant === 'paragraph');
const isCircle = computed(() => props.variant === 'circle');
const isRect = computed(() => props.variant === 'rect');

/** Vue 3 has a known issue where object-based :style bindings referencing
 *  auto-exposed multi-word camelCase props (e.g. widthValue) produce no output.
 *  Using string-based style as a reliable workaround. */
function styleStr(): string | undefined {
    const v = props.variant;
    if (v === 'paragraph') return undefined;
    if (v === 'circle') {
        const s = Number(props.widthValue ?? props.heightValue ?? 44);
        return `width:${s}px;height:${s}px`;
    }
    if (v === 'rect') {
        const w = props.widthValue ?? '100%';
        const h = props.heightValue ?? 120;
        return `width:${typeof w === 'number' ? w + 'px' : w};height:${typeof h === 'number' ? h + 'px' : h}`;
    }
    // text (default)
    const w = props.width ?? '100%';
    return `width:${typeof w === 'number' ? w + 'px' : w}`;
}

const paragraphWidths = computed<(number | string)[]>(() => {
    const widths = Array.isArray(props.rowWidths) ? props.rowWidths : DEFAULT_PARAGRAPH_WIDTHS;
    const rowCount = Math.max(1, props.rows);
    return Array.from({ length: rowCount }, (_, i) => {
        return widths[i] ?? widths[widths.length - 1] ?? '100%';
    });
});
</script>

<template>
    <!-- loading=false 时不显示骨架屏，有 children 则渲染插槽内容 -->
    <template v-if="!loading">
        <slot v-if="$slots.default" />
    </template>

    <!-- loading=true 时渲染骨架屏 -->
    <template v-else>
        <div
            class="animal-skeleton"
            :class="{
                'animal-skeleton--vt-text': variant === 'text' || (!isParagraph && !isCircle && !isRect),
                'animal-skeleton--vt-circle': variant === 'circle',
                'animal-skeleton--vt-rect': variant === 'rect',
                'animal-skeleton--vt-paragraph': variant === 'paragraph',
                'animal-skeleton--paragraph-block': variant === 'paragraph',
                'animal-skeleton--active': active,
            }"
            :style="styleStr()"
            aria-hidden="true"
        >
            <template v-if="isParagraph">
            <!-- paragraph 段落模式：在 div 内部渲染多行 -->
                <div
                    v-for="(w, i) in paragraphWidths"
                    :key="i"
                    class="animal-skeleton--line"
                    :style="{ width: w }"
                />
            </template>
        </div>
    </template>
</template>

<style lang="less" scoped>
// ============================================
// Skeleton — Animal Island Style
// 骨架屏加载占位组件，浅灰基调 + 银白流光
// ============================================

@bg-base: #eae5db;
@bg-line: #dfd9ce;
@shimmer-light: rgba(255, 252, 242, 0.55);
@shimmer-mid: rgba(255, 250, 235, 0.18);

@border-radius-sm: 12px;
@border-radius-base: 18px;

// ---------- Root ----------
.animal-skeleton {
    background: @bg-base;
    border-radius: @border-radius-sm;
    display: inline-block;
    line-height: 1;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    flex-shrink: 0;
}

// ---------- Active shimmer animation (银白流光) ----------
.animal-skeleton--active {
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, @shimmer-mid, @shimmer-light, @shimmer-mid, transparent);
        animation: animal-skeleton-shimmer 1.6s ease-in-out infinite;
    }
}

@keyframes animal-skeleton-shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

// ---------- Variants ----------
.animal-skeleton--vt-text {
    border-radius: 12px;
    height: 16px;
    margin-bottom: 8px;
}

.animal-skeleton--vt-circle {
    border-radius: 50%;
}

.animal-skeleton--vt-rect {
    border-radius: 18px;
}

.animal-skeleton--vt-paragraph {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 0;
    background: none;
}

.animal-skeleton--paragraph-block {
    background: none;
}

.animal-skeleton--line {
    height: 14px;
    border-radius: 12px;
    background: @bg-line;

    &:last-child {
        width: 60%;
    }
}
</style>
