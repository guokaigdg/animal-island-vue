<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import type { BadgeProps } from './types';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const slots = useSlots();

const props = withDefaults(defineProps<BadgeProps>(), {
    count: undefined,
    overflowCount: 99,
    showZero: false,
    dot: false,
    size: 'medium',
    color: 'app-red',
});

/** 全角 / CJK 字符在正圆里会顶破圆直径：CJK 部首与汉字、兼容汉字、全角与半角形式 */
const FULLWIDTH = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/;

/** 1 到 99 这类 1–2 位内容锁成正圆；「100」「99+」等 3 位以上、以及两格全角字回退为胶囊 */
const CIRCLE_MAX_LENGTH = 2;

/** 纯数字或纯数字字符串才参与封顶换算，其余内容原样展示 */
const toNumeric = (value: string | number | undefined): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
    return null;
};

const fitsCircle = (value: string | number | undefined): boolean => {
    // 数字按其显示文本量长度，这样 100 / 1000 自动落回胶囊，与字符串走同一套判定
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : null;
    if (text === null || text.length === 0 || text.length > CIRCLE_MAX_LENGTH) return false;
    return !(text.length === CIRCLE_MAX_LENGTH && FULLWIDTH.test(text));
};

const numeric = computed(() => toNumeric(props.count));
// 封顶：仅数字参与换算，100 → "99+"
const displayCount = computed(() =>
    numeric.value !== null && numeric.value > props.overflowCount ? `${props.overflowCount}+` : props.count
);
const isZero = computed(() => displayCount.value === 0 || displayCount.value === '0');
const showAsDot = computed(() => props.dot && !isZero.value);
// 空字符串（含纯空白）与 null / undefined 一样视为无内容，避免渲染出空心胶囊
const isEmpty = computed(
    () => props.count === undefined || (typeof props.count === 'string' && props.count.trim() === '')
);
// #count 插槽自带内容，不参与空值判断
const hasCountSlot = computed(() => Boolean(slots.count));
// 无内容，或数值为 0 且未开启 showZero，且不是小圆点时整体隐藏
const isHidden = computed(
    () => !showAsDot.value && (hasCountSlot.value ? false : isEmpty.value || (isZero.value && !props.showZero))
);
// 不传默认插槽即独立使用：角标不再相对某元素定位
const isStandalone = computed(() => !slots.default);

// 原生 tooltip：未显式传 title 时用真实数值，封顶后仍是完整数字
const indicatorTitle = computed(() => {
    if (attrs.title !== undefined && attrs.title !== null) return String(attrs.title);
    if (showAsDot.value || hasCountSlot.value) return undefined;
    if (typeof props.count === 'number' || typeof props.count === 'string') return String(props.count);
    return undefined;
});

/** title 由角标自己消费（与 React 版一致），不落到根元素上，避免出现两个 tooltip */
const rootAttrs = computed(() => {
    const rest = { ...attrs };
    delete rest.title;
    return rest;
});

const indicatorClass = computed(() => [
    'animal-badge__indicator',
    `animal-badge--${props.size}`,
    // 正圆只对短内容有意义：dot 无内容，插槽内容由调用方自行控制盒型
    fitsCircle(displayCount.value) && 'animal-badge--circle',
    showAsDot.value && 'animal-badge--dot',
    `animal-badge--color-${props.color}`,
]);
</script>

<template>
    <span class="animal-badge" :class="{ 'animal-badge--standalone': isStandalone }" v-bind="rootAttrs">
        <slot />
        <sup v-if="!isHidden" :class="indicatorClass" :title="indicatorTitle">
            <template v-if="!showAsDot">
                <slot name="count">{{ displayCount }}</slot>
            </template>
        </sup>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// ============================================
// Badge —— 徽标数
// 图标 / 头像右上角的圆形角标：数字、封顶数字、小红点
// 配色与 Card / Tag 调色板对齐
// ============================================

.animal-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    line-height: 1;
    font-family: inherit;
}

.animal-badge__indicator {
    // 定位位移抽成变量，让出场动画在「独立使用」下也能复用同一组 keyframes
    --badge-shift-x: 50%;
    --badge-shift-y: -50%;

    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translate(var(--badge-shift-x), var(--badge-shift-y));
    transform-origin: 100% 0;
    background: #fc736d;
    color: #fff;
    font-family: inherit;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    border-radius: 999px;
    // 奶油色描边：与 Avatar 的贴纸描边一致，把角标从被覆盖的元素上分离出来
    border: 2px solid @bg-color;
    box-shadow: @shadow-sm;
    animation: animal-badge-zoom-in 0.25s @motion-ease;
}

// ---------- 独立使用 ----------
// 没有覆盖目标：取消位移与奶油色描边，角标落回正常文档流
.animal-badge--standalone .animal-badge__indicator {
    position: static;
    --badge-shift-x: 0;
    --badge-shift-y: 0;
    border-color: transparent;
    box-shadow: none;
}

// ---------- Size ----------
// 字号按内腔算：2px 奶油描边吃掉 4px，medium 的 20px 圆只剩 16px 内腔，
// 12px 字号下「99」约 13.5px 宽（占 84%），数字快顶到边上，因此降一档。
.animal-badge--medium {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 10px;
}

.animal-badge--small {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 9px;
}

// ---------- Circle (1–2 位内容) ----------
// min-width + 左右 padding 会让两位数比高度宽（12px 字号下「99」约
// 14px 文字 + 12px padding = 26px，而高只有 20px），渲染成 26×20 的扁
// 胶囊而不是正圆。内容 ≤ 2 位时锁死 width == height，999px 圆角才成立；
// 水平垂直居中由 __indicator 的 flex 居中保证。
// 两格全角字（如「热更」）宽度超出圆直径，组件侧会判定为非正圆。
.animal-badge--medium.animal-badge--circle {
    width: 20px;
    min-width: 0;
    padding: 0;
}

.animal-badge--small.animal-badge--circle {
    width: 16px;
    min-width: 0;
    padding: 0;
}

// ---------- Dot ----------
// 定义在 size 之后，覆盖尺寸类的宽高
.animal-badge--dot {
    width: 10px;
    min-width: 0;
    height: 10px;
    padding: 0;
}

// ---------- Color ----------
// 与 Card / Tag 同一调色板；浅色底（app-yellow / lime-green / yellow-green）换深色文字保证可读
.animal-badge--color-app-red {
    background: #fc736d;
    color: #fff;
}

.animal-badge--color-app-pink {
    background: #f8a6b2;
    color: #fff;
}

.animal-badge--color-app-orange {
    background: #e59266;
    color: #fff;
}

.animal-badge--color-app-yellow {
    background: #f7cd67;
    color: #725d42;
}

.animal-badge--color-app-teal {
    background: #82d5bb;
    color: #fff;
}

.animal-badge--color-app-green {
    background: #8ac68a;
    color: #fff;
}

.animal-badge--color-app-blue {
    background: #889df0;
    color: #fff;
}

.animal-badge--color-purple {
    background: #b77dee;
    color: #fff;
}

.animal-badge--color-lime-green {
    background: #d1da49;
    color: #3d5a1a;
}

.animal-badge--color-yellow-green {
    background: #ecdf52;
    color: #725d42;
}

.animal-badge--color-brown {
    background: #9a835a;
    color: #fff;
}

.animal-badge--color-warm-peach-pink {
    background: #e18c6f;
    color: #fff;
}

// ---------- Motion ----------
@keyframes animal-badge-zoom-in {
    from {
        opacity: 0;
        transform: translate(var(--badge-shift-x), var(--badge-shift-y)) scale(0.6);
    }

    to {
        opacity: 1;
        transform: translate(var(--badge-shift-x), var(--badge-shift-y)) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .animal-badge__indicator {
        animation: none;
    }
}
</style>
