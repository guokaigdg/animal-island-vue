<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TitleColor, TitleSize } from './types';

const attrs = useAttrs();

interface Props {
    size?: TitleSize;
    color?: TitleColor;
    variant?: 'ribbon' | 'layer' | 'tab';
}

const props = withDefaults(defineProps<Props>(), {
    size: 'middle',
    color: 'default',
    variant: 'ribbon',
});

const SIZE_MAP: Record<TitleSize, number> = {
    small: 14,
    middle: 20,
    large: 28,
};

const fontSize = computed(() => `${SIZE_MAP[props.size]}px`);
const colorClass = computed(() =>
    props.color !== 'default' ? `animal-title__color--${props.color}` : '',
);
</script>

<template>
    <span class="animal-title" :class="`animal-title--${variant}`" v-bind="attrs">
        <span
            v-if="variant === 'ribbon'"
            class="animal-title__ribbon"
            :class="colorClass"
            :style="{ fontSize }"
        >
            <span class="animal-title__ribbon-back animal-title__ribbon-back--left" aria-hidden="true" />
            <span class="animal-title__ribbon-back animal-title__ribbon-back--right" aria-hidden="true" />
            <span class="animal-title__ribbon-fold animal-title__ribbon-fold--left" aria-hidden="true" />
            <span class="animal-title__ribbon-fold animal-title__ribbon-fold--right" aria-hidden="true" />
            <span class="animal-title__ribbon-front" aria-hidden="true" />
            <span class="animal-title__ribbon-text">
                <slot />
            </span>
        </span>
        <span
            v-else-if="variant === 'layer'"
            class="animal-title__layer"
            :class="colorClass"
            :style="{ fontSize }"
        >
            <span class="animal-title__layer-front">
                <slot />
            </span>
        </span>
        <span
            v-else
            class="animal-title__tab"
            :class="colorClass"
            :style="{ fontSize }"
        >
            <span class="animal-title__tab-text">
                <slot />
            </span>
        </span>
    </span>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-title {
    display: inline-block;
    font-family: @font-family;
    font-weight: 800;
    line-height: 1;
    user-select: none;
}

// ============================================
// Ribbon 飘带（燕尾 clip-path + 折角阴影 + 微透视正面）
// ============================================
.animal-title__ribbon {
    // 默认绿色配色，通过 CSS 变量统一控制三层颜色
    --rf: #27d039; // front 正面
    --rb: #20992a; // back  燕尾
    --rk: #115017; // fold  折角
    --rt: #fff; // text  文字

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    padding: 0 1.6em;
    color: var(--rt);
    font-weight: 900;
    letter-spacing: 0.04em;
    white-space: nowrap;
    filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.05));
}

.animal-title__ribbon-text {
    position: relative;
    z-index: 4;
    font-size: inherit;
    display: inline-flex;
    align-items: center;
    height: 2em;
    padding-top: 0.11em; // CJK 字形视觉重心偏上，微调光学居中
    color: var(--rt);
    text-shadow: 0 0.04em 0.08em rgba(0, 0, 0, 0.05);
}

// ---- 1. 左右燕尾（背景层 z=1） ----
.animal-title__ribbon-back {
    position: absolute;
    font-size: inherit;
    bottom: -0.4em;
    width: 1.7em;
    height: 1.7em;
    background: var(--rb);
    z-index: 1;
}

.animal-title__ribbon-back--left {
    left: -0.6em;
    border-radius: 0.08em 0 0 0.08em;
    clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 30% 50%, 0% 0%);
}

.animal-title__ribbon-back--right {
    right: -0.6em;
    border-radius: 0 0.08em 0.08em 0;
    clip-path: polygon(0% 0%, 100% 0%, 70% 50%, 100% 100%, 0% 100%);
}

// ---- 2. 左右折角阴影三角（z=2） ----
.animal-title__ribbon-fold {
    position: absolute;
    font-size: inherit;
    top: calc(100% - 0.04em);
    width: 0;
    height: 0;
    border-style: solid;
    z-index: 2;
}

.animal-title__ribbon-fold--left {
    left: 0.15em;
    top: calc(100% - 0.05em);
    border-width: 0 0.95em 0.45em 0;
    border-color: transparent var(--rk) transparent transparent;
    transform-origin: top left;
}

.animal-title__ribbon-fold--right {
    right: 0.16em;
    top: calc(100% - 0.05em);
    border-width: 0 0 0.45em 0.95em;
    border-color: transparent transparent transparent var(--rk);
}

// ---- 3. 正面主体（z=3，纯背景层；文字在外层 .animal-title__ribbon-text 中独立渲染） ----
.animal-title__ribbon-front {
    position: absolute;
    font-size: inherit;
    inset: 0 0.1em;
    background: var(--rf);
    border-radius: 0.2em;
    z-index: 3;
    transform: perspective(11.5em) rotateX(3deg);
    box-shadow: inset 0 -0.06em 0 rgba(0, 0, 0, 0.05);
    pointer-events: none;
}

// ============================================
// Layer 双层纸（错位叠层）
// 背层纸片向左上错位露出，正面浮在上方
// ============================================
.animal-title__layer {
    // 默认绿色配色，与 Ribbon 一致
    --rf: #27d039; // front 正面
    --rb: #20992a; // back  背层
    --rk: #115017; // fold  折角
    --rt: #fff; // text  文字

    position: relative;
    display: inline-flex;
    align-items: center;
    height: 2.1em;
    transition: transform 0.2s ease;
}

.animal-title__layer::before {
    content: '';
    position: absolute;
    left: -0.26em;
    top: -0.3em;
    right: 0.65em;
    bottom: 0;
    background: var(--rb);
    border-radius: 0.35em;
    z-index: 0;
}

.animal-title__layer-front {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.1em;
    padding: 0 1.55em;
    border-radius: 0.35em;
    color: var(--rt);
    background: var(--rf);
    box-shadow: 0 0.1em 0.16em rgba(0, 0, 0, 0.08);
    letter-spacing: 0.04em;
    font-weight: 900;
    white-space: nowrap;
    text-shadow: 0 0.05em 0.1em rgba(0, 0, 0, 0.12);
}

.animal-title__layer:hover {
    transform: scale(1.06);
}

// ============================================
// Tab 折角便签
// 135° 渐变切掉右下角 + 深色三角折瓣
// ============================================
.animal-title__tab {
    // 默认绿色配色，与 Ribbon 一致
    --rf: #27d039; // front 正面
    --rb: #20992a; // back  背层
    --rk: #115017; // fold  折角
    --rt: #fff; // text  文字

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    padding: 0 1.5em;
    border-radius: 0.32em;
    color: var(--rt);
    background: linear-gradient(135deg, transparent 0.9em, var(--rf) 0.9em);
    filter: drop-shadow(0 0.1em 0.16em rgba(0, 0, 0, 0.08));
    transition: transform 0.2s ease;
}

.animal-title__tab::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 0.9em 0.9em;
    border-color: transparent transparent var(--rk) transparent;
}

.animal-title__tab-text {
    position: relative;
    z-index: 2;
    margin-left: 0.4em; // 折角在右下，光学上让文字略微偏右，视觉更居中
    letter-spacing: 0.04em;
    font-weight: 900;
    white-space: nowrap;
    text-shadow: 0 0.05em 0.1em rgba(0, 0, 0, 0.12);
}

.animal-title__tab:hover {
    transform: scale(1.06);
}

// ============================================
// Color variants — 与 Card 同名色板（ribbon / layer / tab 共用）
// 每种颜色覆盖 --rf(正面) --rb(燕尾) --rk(折角) --rt(文字)
// ============================================
.animal-title__color--app-pink {
    --rf: #f8a6b2;
    --rb: #e06880;
    --rk: #a03060;
    --rt: #fff;
}
.animal-title__color--purple {
    --rf: #b77dee;
    --rb: #9050d0;
    --rk: #5a1a9a;
    --rt: #fff;
}
.animal-title__color--app-blue {
    --rf: #889df0;
    --rb: #5068d8;
    --rk: #2030a0;
    --rt: #fff;
}
.animal-title__color--app-yellow {
    --rf: #f7cd67;
    --rb: #d4a030;
    --rk: #8a6010;
    --rt: #725d42;
}
.animal-title__color--app-orange {
    --rf: #e59266;
    --rb: #c06a30;
    --rk: #7a3a10;
    --rt: #fff;
}
.animal-title__color--app-teal {
    --rf: #82d5bb;
    --rb: #40a880;
    --rk: #186048;
    --rt: #fff;
}
.animal-title__color--app-green {
    --rf: #8ac68a;
    --rb: #509050;
    --rk: #205020;
    --rt: #fff;
}
.animal-title__color--app-red {
    --rf: #fc736d;
    --rb: #d43030;
    --rk: #900010;
    --rt: #fff;
}
.animal-title__color--lime-green {
    --rf: #d1da49;
    --rb: #90a010;
    --rk: #485800;
    --rt: #3d5a1a;
}
.animal-title__color--yellow-green {
    --rf: #ecdf52;
    --rb: #c0b010;
    --rk: #706800;
    --rt: #725d42;
}
.animal-title__color--brown {
    --rf: #9a835a;
    --rb: #705830;
    --rk: #3a2810;
    --rt: #fff;
}
.animal-title__color--warm-peach-pink {
    --rf: #e18c6f;
    --rb: #b85a30;
    --rk: #6a2a10;
    --rt: #fff;
}
</style>
