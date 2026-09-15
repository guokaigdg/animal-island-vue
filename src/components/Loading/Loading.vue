<script setup lang="ts">
import { computed, isVNode, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import type { LoadingProps } from './types';

defineOptions({ inheritAttrs: false });

/** 雪花数量：与 React 版本保持一致 */
const FLAKE_COUNT = 50;

const props = withDefaults(defineProps<LoadingProps>(), {
    active: true,
    delay: 0,
    fadeDuration: 0.6,
    zIndex: 3000,
});

const attrs = useAttrs();

// shown：雪花屏已显示（含淡出阶段）；exiting：正在渐变消失
const shown = ref(false);
const exiting = ref(false);

let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

// 生成 50 片雪花：随机尺寸（1–6px）、水平位置（0–100%）与下落时长（6–12s）；
// 负延迟让每片雪花从周期中段开始，首屏即有分布，无需等待飘满
const flakes = Array.from({ length: FLAKE_COUNT }, () => {
    const size = Math.random() * 5 + 1;
    const duration = Math.random() * 6 + 6;
    return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${-Math.random() * duration}s`,
    };
});

watch(
    [() => props.active, () => props.delay, () => props.fadeDuration],
    ([active, delay, fadeDuration]) => {
        clearTimeout(showTimer);

        if (active) {
            // 淡出途中恢复开启：取消卸载计时，立即回到不透明
            clearTimeout(hideTimer);
            exiting.value = false;
            if (delay === 0) {
                shown.value = true;
            } else {
                showTimer = setTimeout(() => {
                    shown.value = true;
                }, delay);
            }
            return;
        }

        // active=false：只有显示过才进入渐变消失
        if (shown.value) {
            exiting.value = true;
            hideTimer = setTimeout(() => {
                shown.value = false;
                exiting.value = false;
            }, fadeDuration * 1000);
        }
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
});

// exiting 时根元素以 fadeDuration 作为 transition-duration（覆写 CSS 里的 0.25s 进入时长）
const rootStyle = computed(() => ({
    zIndex: props.zIndex,
    ...(exiting.value ? { transitionDuration: `${props.fadeDuration}s` } : null),
}));
</script>

<template>
    <div
        v-if="shown"
        class="animal-loading"
        :class="{ 'animal-loading--exiting': exiting }"
        :style="rootStyle"
        role="status"
        v-bind="attrs"
    >
        <div class="animal-loading__snow" aria-hidden="true">
            <span v-for="(flake, i) in flakes" :key="i" class="animal-loading__flake" :style="flake" />
        </div>
        <span class="animal-loading__vignette" aria-hidden="true" />
        <div v-if="tip" class="animal-loading__tip">
            <component :is="tip" v-if="isVNode(tip)" />
            <template v-else>{{ tip }}</template>
        </div>
        <span v-else class="animal-loading__sr-only">加载中</span>
    </div>
</template>

<style lang="less" scoped>
// ---------- Tokens（与 React loading.module.less 内联 token 保持一致） ----------
@night-sky: #0b101a; // 夜空深蓝屏底
@flake-color: #fff; // 雪花白
@tip-color: #f8f8f0; // 奶油白提示文字

.animal-loading {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: @night-sky;
    opacity: 1;
    // 进入：短淡入；退出时长由 inline transitionDuration（fadeDuration）覆盖
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    animation: animal-loading-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 渐变消失：整体淡出并放行点击
    &--exiting {
        opacity: 0;
        pointer-events: none;
    }

    // ---------- 雪花层（aria-hidden 包裹层） ----------
    &__snow {
        position: absolute;
        inset: 0;
    }

    // 单片雪花：白色圆点，从视口上方飘落到视口下方并旋转一整圈；
    // 尺寸 / 水平位置 / 时长 / 负延迟由内联样式注入
    &__flake {
        position: absolute;
        top: -30px;
        background: @flake-color;
        border-radius: 50%;
        animation: animal-loading-snow 10s linear infinite;
    }

    // ---------- 暗角（聚焦中央） ----------
    &__vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, transparent 55%, rgba(5, 10, 20, 0.6) 100%);
    }

    // ---------- 中央提示文字 ----------
    &__tip {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
        color: @tip-color;
        font-weight: 800;
        font-size: 18px;
        letter-spacing: 0.04em;
        line-height: 1.5;
        text-align: center;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    }

    // ---------- 读屏专用文本（无 tip 时的兜底文案） ----------
    &__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
    }
}

@keyframes animal-loading-fade-in {
    from {
        opacity: 0;
    }
}

@keyframes animal-loading-snow {
    0% {
        transform: translateY(0) rotate(0deg);
    }
    100% {
        transform: translateY(calc(100vh + 60px)) rotate(360deg);
    }
}

// ---------- Reduced motion ----------
// 停止飘落（雪花静止在视口上方不可见）；opacity 过渡不属于位移运动，予以保留
@media (prefers-reduced-motion: reduce) {
    .animal-loading__flake {
        animation: none;
    }

    .animal-loading {
        animation: none;
    }
}
</style>
