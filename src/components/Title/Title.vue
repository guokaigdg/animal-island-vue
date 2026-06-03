<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TitleColor, TitleSize } from './types';

const attrs = useAttrs();

interface Props {
    size?: TitleSize;
    color?: TitleColor;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'middle',
    color: 'default',
});

const SIZE_MAP: Record<TitleSize, number> = {
    small: 14,
    middle: 20,
    large: 28,
};

const fontSize = computed(() => `${SIZE_MAP[props.size]}px`);
</script>

<template>
    <span class="animal-title" v-bind="attrs">
        <span
            class="animal-title__ribbon"
            :class="color !== 'default' ? `animal-title__ribbon--${color}` : ''"
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

.animal-title__ribbon {
    // 默认绿色配色，通过 CSS 变量统一控制三层颜色
    --rf: #27d039;
    --rb: #20992a;
    --rk: #115017;
    --rt: #fff;

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
    padding-top: 0.11em;
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
    right: 0.15em;
    top: calc(100% - 0.05em);
    border-width: 0 0 0.45em 0.95em;
    border-color: transparent transparent transparent var(--rk);
}

// ---- 3. 正面主体（z=3） ----
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
// Color variants — 与 Card 同名色板
// ============================================
.animal-title__ribbon--app-pink      { --rf: #f8a6b2; --rb: #e06880; --rk: #a03060; --rt: #fff; }
.animal-title__ribbon--purple        { --rf: #b77dee; --rb: #9050d0; --rk: #5a1a9a; --rt: #fff; }
.animal-title__ribbon--app-blue      { --rf: #889df0; --rb: #5068d8; --rk: #2030a0; --rt: #fff; }
.animal-title__ribbon--app-yellow    { --rf: #f7cd67; --rb: #d4a030; --rk: #8a6010; --rt: #725d42; }
.animal-title__ribbon--app-orange    { --rf: #e59266; --rb: #c06a30; --rk: #7a3a10; --rt: #fff; }
.animal-title__ribbon--app-teal      { --rf: #82d5bb; --rb: #40a880; --rk: #186048; --rt: #fff; }
.animal-title__ribbon--app-green     { --rf: #8ac68a; --rb: #509050; --rk: #205020; --rt: #fff; }
.animal-title__ribbon--app-red       { --rf: #fc736d; --rb: #d43030; --rk: #900010; --rt: #fff; }
.animal-title__ribbon--lime-green    { --rf: #d1da49; --rb: #90a010; --rk: #485800; --rt: #3d5a1a; }
.animal-title__ribbon--yellow-green  { --rf: #ecdf52; --rb: #c0b010; --rk: #706800; --rt: #725d42; }
.animal-title__ribbon--brown         { --rf: #9a835a; --rb: #705830; --rk: #3a2810; --rt: #fff; }
.animal-title__ribbon--warm-peach-pink { --rf: #e18c6f; --rb: #b85a30; --rk: #6a2a10; --rt: #fff; }
</style>
