<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import type { CountUpEasing, CountUpEasingFunction, CountUpEasingName, CountUpProps } from './types';

const attrs = useAttrs();

const props = withDefaults(defineProps<CountUpProps>(), {
    start: 0,
    duration: 2,
    isCounting: false,
    decimalSeparator: '.',
    thousandsSeparator: '',
    easing: 'easeOutCubic',
    updateInterval: 0,
    size: 'middle',
    variant: 'default',
    bordered: false,
    digitRoll: false,
    celebrate: false,
    repeat: false,
    repeatDelay: 0,
    repeatStartAt: undefined,
});

const emit = defineEmits<{
    (e: 'update', value: number): void;
    (e: 'complete', elapsedTime: number): void;
}>();

const EASINGS: Record<CountUpEasingName, CountUpEasingFunction> = {
    linear: (progress) => progress,
    easeInCubic: (progress) => progress * progress * progress,
    easeOutCubic: (progress) => 1 - (1 - progress) ** 3,
    easeInOutCubic: (progress) =>
        progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2,
    easeOutExpo: (progress) => (progress >= 1 ? 1 : 1 - 2 ** (-10 * progress)),
};

/** 未知缓动名回退到 easeOutCubic，避免 JS 调用方传错值时崩掉动画 */
const resolveEasing = (easing: CountUpEasing): CountUpEasingFunction => {
    if (typeof easing === 'function') return easing;
    const named = (EASINGS as Record<string, CountUpEasingFunction>)[easing];
    return named ?? EASINGS.easeOutCubic;
};

/** 数值的小数位数（用于推导默认 decimalPlaces） */
const decimalCount = (value: number): number => {
    const text = String(value);
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : text.length - dot - 1;
};

/** 按千分位分组，separator 为空时原样返回 */
const groupThousands = (text: string, separator: string): string =>
    separator === '' ? text : text.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

/** 默认格式化：四舍五入到 decimalPlaces 位小数，再补千分位与小数点符号 */
const formatNumber = (value: number, decimalPlaces: number, decimalSeparator: string, thousandsSeparator: string) => {
    if (decimalPlaces <= 0) {
        return groupThousands(String(Math.round(value)), thousandsSeparator);
    }
    const [integer, fraction] = value.toFixed(decimalPlaces).split('.');
    return `${groupThousands(integer, thousandsSeparator)}${decimalSeparator}${fraction}`;
};

/** 庆祝动效的总时长（ms），需略大于 CSS 动画时长，用于自动摘掉动画类以便下次重播 */
const CELEBRATE_DURATION = 900;

const places = computed(() => props.decimalPlaces ?? Math.max(decimalCount(props.start), decimalCount(props.end)));

const display = ref(props.start);
const counting = ref(false);
const celebrating = ref(false);
/** 递增即重启动画：reset / 自动重播都靠它触发主 watch */
const runToken = ref(0);

const emitUpdate = emit;

// 动画循环用的非响应式状态：放在 setup 作用域的闭包变量里，不进渲染依赖
let frameId: number | null = null;
let repeatTimer: ReturnType<typeof setTimeout> | null = null;
let celebrateTimer: ReturnType<typeof setTimeout> | null = null;
let elapsed = 0;
let lastTimestamp: number | null = null;
let completed = false;
let pendingStart: number | undefined;
/** 上一次真正渲染出来的文案，用于跳过文案没变的帧 */
let lastFormatted: string | null = null;
/** 已生效的 起始值|目标值|时长 组合，变化即重新开始 */
let targetKey = `${props.start}|${props.end}|${props.duration}`;
let lastToken = 0;

const format = (value: number): string =>
    props.formatter
        ? String(props.formatter(value))
        : formatNumber(value, places.value, props.decimalSeparator, props.thousandsSeparator);

/** 只在渲染文案真的变化时更新，长时长动画因此不会每帧重建 DOM */
function commit(next: number, force = false) {
    const rendered = format(next);
    if (!force && rendered === lastFormatted) return;
    lastFormatted = rendered;
    display.value = next;
}

function clearFrame() {
    if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }
}

function clearRepeat() {
    if (repeatTimer !== null) {
        clearTimeout(repeatTimer);
        repeatTimer = null;
    }
}

function finish(elapsedMs: number) {
    completed = true;
    lastTimestamp = null;
    counting.value = false;
    commit(props.end, true);

    if (props.celebrate) {
        celebrating.value = true;
        if (celebrateTimer !== null) clearTimeout(celebrateTimer);
        celebrateTimer = setTimeout(() => {
            celebrateTimer = null;
            celebrating.value = false;
        }, CELEBRATE_DURATION);
    }

    emitUpdate('complete', elapsedMs / 1000);

    // Vue 的 emit 无法返回值，React 版「onComplete 返回 shouldRepeat」的写法在这里改为声明式 prop
    if (props.repeat) {
        clearRepeat();
        repeatTimer = setTimeout(
            () => {
                repeatTimer = null;
                pendingStart = props.repeatStartAt;
                runToken.value += 1;
            },
            Math.max(0, props.repeatDelay) * 1000
        );
    }
}

watch(
    () => [props.isCounting, props.start, props.end, props.duration, runToken.value] as const,
    (_, _prev, onCleanup) => {
        const totalMs = Math.max(0, props.duration) * 1000;

        const step = (timestamp: number): void => {
            frameId = null;
            // 首帧只记录时间基准，保证 elapsed 从 0 开始
            if (lastTimestamp === null) {
                lastTimestamp = timestamp;
                frameId = requestAnimationFrame(step);
                return;
            }

            elapsed += timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            const intervalMs = Math.max(0, props.updateInterval) * 1000;
            // updateInterval > 0 时按间隔取值（时间轴量化）
            const quantized = intervalMs > 0 ? Math.floor(elapsed / intervalMs) * intervalMs : elapsed;
            const done = elapsed >= totalMs;
            const progress = done ? 1 : Math.min(1, Math.max(0, quantized / totalMs));
            const next = done
                ? props.end
                : props.start + (props.end - props.start) * resolveEasing(props.easing)(progress);

            emitUpdate('update', next);

            if (done) {
                finish(elapsed);
                return;
            }

            commit(next);
            frameId = requestAnimationFrame(step);
        };

        // 起始值 / 目标值 / 时长变化时重播；reset 与自动重播通过 runToken 触发
        const target = `${props.start}|${props.end}|${props.duration}`;
        const restart = target !== targetKey || runToken.value !== lastToken;
        const nextPendingStart = pendingStart;
        targetKey = target;
        lastToken = runToken.value;

        if (restart) {
            elapsed = 0;
            lastTimestamp = null;
            completed = false;
            celebrating.value = false;
            commit(typeof nextPendingStart === 'number' ? nextPendingStart : props.start, true);
        }
        pendingStart = undefined;

        if (!props.isCounting || completed) {
            counting.value = false;
            return;
        }

        // 环境不支持 rAF（老浏览器 / 非可视化环境）时退化为静态展示起始值，不抛错
        if (typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function') {
            counting.value = false;
            return;
        }

        // duration = 0 直接到位，不必等一帧；仍可能排下重播计时器，所以同样要交出 cleanup
        if (totalMs === 0) {
            finish(0);
        } else {
            lastTimestamp = null;
            counting.value = true;
            frameId = requestAnimationFrame(step);
        }

        onCleanup(() => {
            clearFrame();
            clearRepeat();
        });
    },
    { immediate: true }
);

// 卸载时清掉庆祝计时器，避免对已卸载组件写状态
onBeforeUnmount(() => {
    if (celebrateTimer !== null) clearTimeout(celebrateTimer);
});

function reset(newStartAt?: number) {
    pendingStart = newStartAt;
    runToken.value += 1;
}

defineExpose({ reset });

const celebrateText = computed(() => (typeof props.celebrate === 'object' ? props.celebrate.text : undefined));
const hasCelebrateText = computed(() => celebrateText.value !== undefined);
// 读屏文本：滚动中的数字对辅助技术隐藏，静止后再播报最终数值（默认格式，不经过 formatter）
const readable = computed(() =>
    counting.value ? '' : formatNumber(display.value, places.value, props.decimalSeparator, props.thousandsSeparator)
);

const rootClass = computed(() => [
    'animal-count-up',
    `animal-count-up--${props.size}`,
    `animal-count-up--${props.variant}`,
    { 'animal-count-up--bordered': props.bordered, 'animal-count-up--celebrating': celebrating.value },
]);

/**
 * 数码管逐位滚动的字符表。
 *
 * 把格式化后的字符串逐字符拆开：数字位给一列滚轮（digit = 0-9），
 * 非数字位（千分位、小数点、前后缀文字）原样静止输出。
 *
 * key 用下标而不是字符：位次固定才能让同一根滚轮在两次渲染间被复用，
 * CSS transition 才有从旧数字滚到新数字的连续感（999 → 1000 时最高位原地补一）。
 */
const rollChars = computed(() =>
    [...format(display.value)].map((ch) => ({ ch, digit: ch >= '0' && ch <= '9' ? Number(ch) : null }))
);
</script>

<template>
    <div :class="rootClass" role="status" v-bind="attrs">
        <span class="animal-count-up__plate-wrap">
            <span v-if="celebrating" class="animal-count-up__effects" aria-hidden="true">
                <span class="animal-count-up__ring" />
                <span class="animal-count-up__ring" />
                <span class="animal-count-up__sparkles">
                    <span class="animal-count-up__sparkle" />
                    <span class="animal-count-up__sparkle" />
                    <span class="animal-count-up__sparkle" />
                    <span class="animal-count-up__sparkle" />
                </span>
                <span v-if="$slots.celebrate || hasCelebrateText" class="animal-count-up__badge-wrap">
                    <span class="animal-count-up__badge">
                        <slot name="celebrate">{{ celebrateText }}</slot>
                    </span>
                </span>
            </span>
            <span class="animal-count-up__plate" aria-hidden="true">
                <span v-if="$slots.prefix" class="animal-count-up__affix"><slot name="prefix" /></span>
                <span class="animal-count-up__number" :class="{ 'animal-count-up__number--roll': props.digitRoll }">
                    <!-- 数码管模式：默认插槽接管渲染时仍按插槽走，逐位滚动只是默认渲染的一种样式 -->
                    <template v-if="props.digitRoll && !$slots.default">
                        <span
                            v-for="(item, i) in rollChars"
                            :key="i"
                            class="animal-count-up__char"
                            :class="{ 'animal-count-up__char--wheel': item.digit !== null }"
                        >
                            <span
                                v-if="item.digit !== null"
                                class="animal-count-up__wheel"
                                :style="{ transform: `translateY(${-item.digit * 10 || 0}%)` }"
                            >
                                <span v-for="n in 10" :key="n" class="animal-count-up__wheel-cell">{{ n - 1 }}</span>
                            </span>
                            <template v-else>{{ item.ch }}</template>
                        </span>
                    </template>
                    <slot v-else :value="display" :reset="reset">{{ format(display) }}</slot>
                </span>
                <span v-if="$slots.suffix" class="animal-count-up__affix"><slot name="suffix" /></span>
            </span>
        </span>
        <span class="animal-count-up__sr-only">{{ readable }}</span>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// ============================================
// CountUp —— 数字滚动
// 结束庆祝动效：数字两拍弹跳 + 两圈光环 + 四角星芒 + 可选文案贴纸
// ============================================

.animal-count-up {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: @spacing-sm;
    box-sizing: border-box;
    width: fit-content;
    color: @warm-color;
    font-family: @font-family;
    font-weight: 700;
    border-radius: 20px;
    transition: transform @motion-duration-base @motion-ease;
}

// ---------- 外壳（与 Countdown 同款两套皮肤） ----------
.animal-count-up--default {
    padding: 12px 18px;
    background: @bg-color;
    box-shadow: @shadow-sm;
}

.animal-count-up--island {
    padding: 13px 20px;
    background: rgb(247, 243, 223);
    border: 2px dashed #d4c4a8;
}

.animal-count-up__plate-wrap {
    position: relative;
    display: inline-flex;
}

.animal-count-up__plate {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    box-sizing: border-box;
    padding: 3px 8px;
    // 与 Countdown / Time 同款渐变底；边框由 --bordered 控制，默认无
    background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
    border-radius: 12px;
}

.animal-count-up--island .animal-count-up__plate {
    background: linear-gradient(180deg, #fffdf4 0%, #f8f8f0 100%);
}

.animal-count-up--bordered .animal-count-up__plate {
    border: 1.5px solid @shadow-soft;
}

.animal-count-up--bordered.animal-count-up--island .animal-count-up__plate {
    border-color: #d4c4a8;
}

.animal-count-up__number {
    color: #8b7355;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
    line-height: 1.2;
}

/* ---------------------------------------------------------------- *
 * 数码管逐位滚动（digitRoll）
 * 每根滚轮是一个 10 格高的竖条，用 translateY 定位到目标数字。
 * 高度锁死成 1em 并 overflow:hidden，于是只有当前那格露出来。
 * ---------------------------------------------------------------- */
.animal-count-up__number--roll {
    display: inline-flex;
    align-items: center;
}

.animal-count-up__char {
    display: inline-block;
}

.animal-count-up__char--wheel {
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2;
    vertical-align: bottom;
}

.animal-count-up__wheel {
    display: flex;
    flex-direction: column;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}

.animal-count-up__wheel-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.2em;
    flex: 0 0 auto;
}

@media (prefers-reduced-motion: reduce) {
    .animal-count-up__wheel {
        transition: none;
    }
}

// 前后缀（如 ¥ / 分）：比数字小一档，弱化成单位而不是主角
.animal-count-up__affix {
    color: @shadow-soft-strong;
    font-weight: 800;
    font-size: 0.62em;
    line-height: 1.2;
    white-space: nowrap;
}

// ---------- 尺寸 ----------
.animal-count-up--small {
    min-height: 40px;
    font-size: 13px;

    .animal-count-up__number {
        font-size: 20px;
    }

    .animal-count-up__badge {
        font-size: 12px;
    }
}

.animal-count-up--middle {
    min-height: 48px;
    font-size: 14px;

    .animal-count-up__number {
        font-size: 26px;
    }

    .animal-count-up__badge {
        font-size: 13px;
    }
}

.animal-count-up--large {
    min-height: 56px;
    font-size: 16px;

    .animal-count-up__number {
        font-size: 34px;
    }

    .animal-count-up__badge {
        font-size: 15px;
    }
}

// ---------- 结束庆祝动效 ----------
// 动画层：绝对定位铺满数字块，不参与布局也不吃指针事件
.animal-count-up__effects {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

// 数字块自身：两拍弹跳 + 轻微摇摆，庆祝的「主音」
.animal-count-up--celebrating .animal-count-up__plate {
    animation: animal-countup-pop 0.7s @motion-ease both;
}

// 两圈向外扩散的光环（错开 0.12s，两拍）
.animal-count-up__ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(247, 205, 103, 0.85);
    border-radius: 14px;
    animation: animal-countup-ring 0.7s @motion-ease both;

    &:nth-child(2) {
        border-color: rgba(255, 204, 0, 0.7);
        animation-delay: 0.12s;
    }
}

// 四角星芒：纯 CSS clip-path 四角星，向外飞散后淡出
.animal-count-up__sparkles {
    position: absolute;
    inset: 0;
}

.animal-count-up__sparkle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #f7cd67;
    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
    animation: animal-countup-sparkle 0.72s @motion-ease both;

    &:nth-child(1) {
        --cu-x: -16px;
        --cu-y: -14px;
        top: 0;
        left: 0;
    }

    &:nth-child(2) {
        --cu-x: 16px;
        --cu-y: -12px;
        top: 0;
        right: 0;
        animation-delay: 0.06s;
    }

    &:nth-child(3) {
        --cu-x: -16px;
        --cu-y: 14px;
        bottom: 0;
        left: 0;
        animation-delay: 0.12s;
    }

    &:nth-child(4) {
        --cu-x: 16px;
        --cu-y: 14px;
        bottom: 0;
        right: 0;
        animation-delay: 0.18s;
    }
}

// 文案贴纸（可选）：从数字块上方弹出
.animal-count-up__badge-wrap {
    position: absolute;
    left: 50%;
    bottom: 100%;
    margin-bottom: 6px;
    transform: translateX(-50%);
}

.animal-count-up__badge {
    display: inline-block;
    padding: 2px 10px;
    color: @warm-color-soft;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.04em;
    line-height: 1.4;
    white-space: nowrap;
    background: linear-gradient(180deg, #ffe08a 0%, #f7cd67 100%);
    border: 1.5px solid #e0b800;
    border-radius: 50px;
    box-shadow: 0 2px 6px rgba(61, 52, 40, 0.18);
    animation: animal-countup-badge 0.5s @motion-ease both;
}

@keyframes animal-countup-pop {
    0% {
        transform: scale(1) rotate(0deg);
    }

    16% {
        transform: scale(1.14) rotate(-2deg);
    }

    34% {
        transform: scale(0.98) rotate(0deg);
    }

    52% {
        transform: scale(1.08) rotate(1.6deg);
    }

    72% {
        transform: scale(0.99) rotate(-0.8deg);
    }

    100% {
        transform: scale(1) rotate(0deg);
    }
}

@keyframes animal-countup-ring {
    from {
        opacity: 0.9;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(1.5);
    }
}

@keyframes animal-countup-sparkle {
    0% {
        opacity: 0;
        transform: translate(0, 0) scale(0.4) rotate(0deg);
    }

    35% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translate(var(--cu-x, 0), var(--cu-y, 0)) scale(1) rotate(90deg);
    }
}

@keyframes animal-countup-badge {
    0% {
        opacity: 0;
        transform: scale(0.4) rotate(-8deg);
    }

    55% {
        opacity: 1;
        transform: scale(1.12) rotate(3deg);
    }

    76% {
        transform: scale(0.96) rotate(-2deg);
    }

    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
}

@keyframes animal-countup-fade {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

// 读屏专用文本：滚动/跳动中的数字对辅助技术隐藏，静止后播报完整数值
.animal-count-up__sr-only {
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

// 减弱动效：去掉弹跳、光环和星芒，徽标只做淡入（信息保留，动效收敛）
@media (prefers-reduced-motion: reduce) {
    .animal-count-up--celebrating .animal-count-up__plate {
        animation: none;
    }

    .animal-count-up__ring,
    .animal-count-up__sparkles {
        display: none;
    }

    .animal-count-up__badge {
        animation: animal-countup-fade 0.25s @motion-ease both;
    }
}
</style>
