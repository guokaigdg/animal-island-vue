<script setup lang="ts">
import { computed, isVNode, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import Sailboat from './Sailboat.vue';
import type { LoadingProps } from './types';

defineOptions({ inheritAttrs: false });

/** 雪花数量：与 React 版本保持一致 */
const FLAKE_COUNT = 50;

const props = withDefaults(defineProps<LoadingProps>(), {
    type: 'snow',
    showBoat: true,
    active: true,
    delay: 0,
    fadeDuration: 0.6,
    zIndex: 3000,
});

const attrs = useAttrs();

// shown：加载屏已显示（含淡出阶段）；exiting：正在渐变消失
const shown = ref(false);
const exiting = ref(false);

const rootEl = ref<HTMLElement | null>(null);
/** 圆形扩散展开的遮罩半径（px），展开中由 0 过渡到覆盖整个视口 */
const maskRadius = ref(0);

const isCircle = computed(() => props.type === 'circle');

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

/**
 * 圆形扩散展开的半径：需完全覆盖容器对角线，否则四角会残留一圈。
 *
 * 单独一个监听而不是并入上面的退出分支 —— 半径必须在 .animal-loading--masking
 * 类挂上之后才测量，这样自定义属性一定是从 0 变化到目标值，transition 才会真正插值。
 * flush: 'post' 保证在 DOM 更新之后执行，等价于 React 侧的 useEffect。
 */
watch(
    [exiting, isCircle],
    () => {
        if (!exiting.value || !isCircle.value) {
            maskRadius.value = 0;
            return;
        }
        const rect = rootEl.value?.getBoundingClientRect();
        const width = rect?.width || window.innerWidth;
        const height = rect?.height || window.innerHeight;
        maskRadius.value = Math.ceil(Math.hypot(width, height) / 2) + 50;
    },
    { flush: 'post' }
);

onBeforeUnmount(() => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
});

// exiting 时根元素以 fadeDuration 作为 transition-duration（覆写 CSS 里的 0.25s 进入时长）；
// 圆形形态不用它 —— 展开的时长由 --animal-loading-mask-duration 决定
const rootStyle = computed(() => ({
    zIndex: props.zIndex,
    ...(isCircle.value
        ? {
              '--animal-loading-mask-duration': `${props.fadeDuration}s`,
              '--animal-loading-mask-r': `${maskRadius.value}px`,
          }
        : null),
    ...(exiting.value && !isCircle.value ? { transitionDuration: `${props.fadeDuration}s` } : null),
}));
</script>

<template>
    <div
        v-if="shown"
        ref="rootEl"
        class="animal-loading"
        :class="{
            'animal-loading--circle': isCircle,
            'animal-loading--exiting': exiting && !isCircle,
            'animal-loading--masking': exiting && isCircle,
        }"
        :style="rootStyle"
        role="status"
        v-bind="attrs"
    >
        <!-- 圆形形态：右下角一艘帆船（showBoat=false 时整块不渲染，只留遮罩背景） -->
        <div v-if="isCircle && showBoat" class="animal-loading__sailboat-scene" aria-hidden="true">
            <Sailboat />
        </div>

        <!-- 落雪形态：50 片雪花 + 暗角 -->
        <template v-else>
            <div class="animal-loading__snow" aria-hidden="true">
                <span v-for="(flake, i) in flakes" :key="i" class="animal-loading__flake" :style="flake" />
            </div>
            <span class="animal-loading__vignette" aria-hidden="true" />
        </template>

        <div v-if="tip" class="animal-loading__tip">
            <component :is="tip" v-if="isVNode(tip)" />
            <template v-else>{{ tip }}</template>
        </div>
        <span v-else class="animal-loading__sr-only">加载中</span>
    </div>
</template>

<style lang="less" scoped>
// 圆形扩散展开的半径。未注册的 CSS 自定义属性无法被 transition 插值，
// 只能离散跳变 —— 这里必须注册为 <length> 才能做出扩散动画
@property --animal-loading-mask-r {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
}

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

    // 圆形形态不加淡入：全屏遮罩从透明淡入的那 0.2s 会把底下的内容透出来，
    // 而圆形形态恰恰是「内容已在下面铺好、靠圆形扩散揭开」用的 —— 必须一上来就完全不透明
    &--circle {
        animation: none;
    }

    // 圆形扩散展开：从中心开出透明圆孔，露出底层内容。
    // 遮罩本身不做过渡，过渡的是 --animal-loading-mask-r 这个半径变量
    &--masking {
        -webkit-mask-image: radial-gradient(
            circle at center,
            transparent var(--animal-loading-mask-r),
            black calc(var(--animal-loading-mask-r) + 1px)
        );
        mask-image: radial-gradient(
            circle at center,
            transparent var(--animal-loading-mask-r),
            black calc(var(--animal-loading-mask-r) + 1px)
        );
        transition: --animal-loading-mask-r var(--animal-loading-mask-duration, 0.6s) linear;
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

    // ---------- 帆船场景（圆形形态） ----------
    // 帆船停在右下角（离右 20px、离下 30px）
    &__sailboat-scene {
        position: absolute;
        right: 20px;
        bottom: 30px;
        width: 120px;
        max-width: 40vw;
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
//
// 这里必须用 animation-play-state: paused 而不是 animation: none ——
// 雪花唯一的可见性来源就是这段动画，静态位置在视口上方 top: -30px；
// 一旦 animation: none，50 片雪花会整体冻在视口外，只剩一块夜空底黑屏
//（纯落雪无 tip 时没有任何可见元素，看起来就是黑屏 bug）。
// 每片雪花都注入了负延迟（从周期中段起步），因此 paused 会把每片
// 冻结在下落途中的随机高度，得到一张铺满视口的静态雪景。
@media (prefers-reduced-motion: reduce) {
    .animal-loading__flake {
        animation-play-state: paused;
    }

    .animal-loading {
        animation: none;
    }
}
</style>
