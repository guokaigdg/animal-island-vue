<script setup lang="ts">
import { computed, nextTick, ref, useAttrs } from 'vue';
import { StarIcon } from '../Icon';
import type { RateProps } from './types';

const attrs = useAttrs();

const props = withDefaults(defineProps<RateProps>(), {
    defaultValue: 0,
    count: 5,
    size: 'middle',
    readonly: false,
    allowClear: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
    (e: 'change', value: number): void;
}>();

/** 一次评分的起止值；seq 每次提交自增，用于重放星星动画 */
interface RateBurst {
    from: number;
    to: number;
    seq: number;
}

/** 星星逐格弹出的间隔 */
const BURST_STEP_MS = 60;

/** 把任意评分夹取成 [0, count] 的整数：小数就近取整，超出范围直接夹取 */
const toStarCount = (value: number, count: number) => Math.min(count, Math.max(0, Math.round(value)));

const innerValue = ref(props.defaultValue);
const hoverValue = ref(0);
const burst = ref<RateBurst>({ from: 0, to: 0, seq: 0 });

// 受控判断：React 的 `value` 与 Vue 的 `modelValue` 均可作为受控值，value 优先
const isControlled = computed(() => props.value !== undefined || props.modelValue !== undefined);
const rateValue = computed(() => {
    if (props.value !== undefined) return props.value;
    if (props.modelValue !== undefined) return props.modelValue;
    return innerValue.value;
});
// 悬停预览：只读时始终展示真实评分
const displayValue = computed(() => (!props.readonly && hoverValue.value > 0 ? hoverValue.value : rateValue.value));
// 受控值可能是小数或超出范围（展示平均分、count 调小后旧值偏高），
// 夹取成整数后用于点亮数量与选中态 —— 保证永远有一颗星可 Tab 到达
const filledCount = computed(() => toStarCount(displayValue.value, props.count));
const checkedValue = computed(() => toStarCount(rateValue.value, props.count));

// 唯一 name（类似 React 的 useId）
const groupName = `animal-rate-${Math.random().toString(36).slice(2, 10)}`;
const inputRefs = ref<Array<HTMLInputElement | null>>([]);

function setRef(el: unknown, idx: number) {
    inputRefs.value[idx] = el as HTMLInputElement | null;
}

/**
 * 受控模式下父级不接新值时，浏览器仍会先把原生 radio 点亮、旧的取消选中；
 * 而 Vue 只在 vnode 的 checked 变化时才回写 DOM，值没变就不写，于是显示与受控值脱节。
 * 这里在提交后主动拨回，行为对齐 React 的 restoreControlledState。
 */
function syncCheckedDom() {
    const target = checkedValue.value;
    inputRefs.value.forEach((el, idx) => {
        if (el) el.checked = idx + 1 === target;
    });
}

/** 只有「加分」才播放动画：from → to 之间新点亮的星星依次弹出 */
function isBursting(index: number) {
    const { from, to } = burst.value;
    return to > from && index > from && index <= to;
}

/** 扩散光晕只画在本次点亮的最后一颗星上 */
function isSplash(index: number) {
    const { from, to } = burst.value;
    return to > from && index === to;
}

function starStyle(index: number) {
    if (!isBursting(index)) return undefined;
    const delay = (index - burst.value.from - 1) * BURST_STEP_MS;
    return { '--rate-pop-delay': `${delay}ms` } as Record<string, string>;
}

function commit(next: number) {
    if (props.readonly || next === rateValue.value) return;
    // 必须在写入 innerValue 之前取旧的夹取值：Vue 的 ref 是同步更新，
    // 写在后面会读到刚提交的新值，from === to，星星动画就永远不触发了
    const from = checkedValue.value;
    if (!isControlled.value) innerValue.value = next;
    // 清空后鼠标仍停在原处，重置预览才能立刻看到「已清空」
    if (next === 0) hoverValue.value = 0;
    burst.value = { from, to: next, seq: burst.value.seq + 1 };
    emit('update:modelValue', next);
    emit('change', next);
    nextTick(syncCheckedDom);
}

/**
 * 只监听 click，不监听 change：
 * 原生 radio 的 change 在「勾选新星」时触发、click 在「已勾选再点」时才会走到清空分支，
 * 两者挂在同一次点击上会各自读到更新后的 checkedValue，导致点第 4 颗星刚点亮就被 click 清空。
 * 合并到单一 click 里按当前值判断分支，可从根上避免这次双触发。
 */
function handleStarClick(index: number) {
    if (props.allowClear && checkedValue.value === index) {
        commit(0);
        return;
    }
    commit(index);
}

function handleKeyDown(e: KeyboardEvent) {
    if (props.readonly) return;

    let next = 0;
    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
            // 从夹取后的整数值出发：受控值可能是小数或超出 count
            next = Math.min(props.count, checkedValue.value + 1);
            break;
        case 'ArrowLeft':
        case 'ArrowDown':
            next = Math.max(1, checkedValue.value - 1);
            break;
        case 'Home':
            next = 1;
            break;
        case 'End':
            next = props.count;
            break;
        default:
            return;
    }

    e.preventDefault();
    // 键盘选择同样要收起悬停预览，否则停在旧星星上的鼠标会盖住新评分
    hoverValue.value = 0;
    inputRefs.value[next - 1]?.focus();
    commit(next);
}

function handleMouseLeave() {
    hoverValue.value = 0;
}

const rootClass = computed(() => [
    'animal-rate',
    `animal-rate--${props.size}`,
    { 'animal-rate--readonly': props.readonly },
]);
</script>

<template>
    <div
        role="radiogroup"
        aria-label="评分"
        :aria-readonly="readonly || undefined"
        :class="rootClass"
        v-bind="attrs"
        @keydown="handleKeyDown"
        @mouseleave="handleMouseLeave"
    >
        <label
            v-for="index in count"
            :key="index"
            class="animal-rate__item"
            :class="{ 'animal-rate__item--active': index <= filledCount }"
            @mouseenter="!readonly && (hoverValue = index)"
        >
            <input
                :ref="(el) => setRef(el, index - 1)"
                class="animal-rate__input"
                type="radio"
                :name="groupName"
                :checked="checkedValue === index"
                :disabled="readonly"
                :tabindex="!readonly && (checkedValue > 0 ? checkedValue === index : index === 1) ? 0 : -1"
                :aria-label="`${index} 星`"
                @click="handleStarClick(index)"
            />
            <span v-if="isSplash(index)" :key="`splash-${burst.seq}`" class="animal-rate__splash" aria-hidden="true" />
            <span
                :key="isBursting(index) ? `star-${burst.seq}` : 'star'"
                class="animal-rate__star"
                :class="{ 'animal-rate__star--pop': isBursting(index) }"
                :style="starStyle(index)"
            >
                <StarIcon />
            </span>
        </label>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// ============================================
// Rate —— 星级评分
// 选中动画：星星弹跳 + 六点向外扩散
// ============================================

.animal-rate {
    // --rate-splash-scale：把 splash 的 22px 基准几何缩放到当前星星尺寸
    &--small {
        --rate-size: 20px;
        --rate-gap: @spacing-xs;
        --rate-splash-scale: 0.91;
    }

    &--middle {
        --rate-size: 26px;
        --rate-gap: 6px;
        --rate-splash-scale: 1.18;
    }

    &--large {
        --rate-size: 34px;
        --rate-gap: @spacing-sm;
        --rate-splash-scale: 1.55;
    }

    display: inline-flex;
    align-items: center;
    gap: var(--rate-gap);
    font-family: @font-family;
    line-height: 1;
}

.animal-rate__item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--rate-size);
    height: var(--rate-size);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform @motion-duration-base @motion-ease;

    &:hover {
        transform: translateY(-1px);
    }
}

// 原生 radio：视觉隐藏，保留单选语义与键盘能力
.animal-rate__input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    cursor: inherit;
}

.animal-rate__star {
    display: block;
    width: var(--rate-size);
    height: var(--rate-size);

    :deep(svg) {
        display: block;
        width: 100%;
        height: 100%;
        // 图标自带的描边是 #2A2A2A，这里按状态换成暖色
        stroke: @text-color-disabled;
        transition: stroke @motion-duration-base @motion-ease;
    }

    // 星星是描边图标：未选中只留描边，选中时金色填充淡入
    :deep(path) {
        fill: @warning-color;
        fill-opacity: 0;
        transition: fill-opacity @motion-duration-base @motion-ease;
    }

    // 星脸（两个眼睛）只在选中时出现；opacity 一并管住填充与描边
    :deep(circle) {
        fill: @text-color;
        opacity: 0;
        transition: opacity @motion-duration-base @motion-ease;
    }
}

.animal-rate__item--active .animal-rate__star {
    :deep(svg) {
        stroke: @warning-color-active;
    }

    :deep(path) {
        fill-opacity: 1;
    }

    :deep(circle) {
        opacity: 1;
    }
}

// 键盘焦点：沿用输入类的黄色焦点环
.animal-rate__input:focus-visible ~ .animal-rate__star {
    border-radius: 50%;
    outline: 2px solid @warning-color;
    outline-offset: 1px;
}

// 星星弹跳：每次提交换 key 重挂载，动画随之重放
.animal-rate__star--pop {
    animation-name: animal-rate-pop;
    animation-duration: @motion-duration-slow;
    animation-timing-function: @motion-ease;
    animation-delay: var(--rate-pop-delay, 0s);
    animation-fill-mode: both;
}

// 选中扩散：按 22px 基准绘制，再整体缩放到当前尺寸
.animal-rate__splash {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 22px;
    height: 22px;
    margin: -11px 0 0 -11px;
    border-radius: 50%;
    transform: scale(var(--rate-splash-scale));
    animation: animal-rate-splash 0.6s ease forwards;
    pointer-events: none;
}

.animal-rate--readonly {
    .animal-rate__item {
        cursor: default;

        &:hover {
            transform: none;
        }
    }
}

@keyframes animal-rate-pop {
    0% {
        transform: scale(0.55);
    }

    60% {
        transform: scale(1.15);
    }

    100% {
        transform: scale(1);
    }
}

// 只画六点，不铺底色 —— 选中后发光的只有星星本身
@keyframes animal-rate-splash {
    40% {
        box-shadow:
            0 -18px 0 -8px @warning-color,
            16px -8px 0 -8px @warning-color,
            16px 8px 0 -8px @warning-color,
            0 18px 0 -8px @warning-color,
            -16px 8px 0 -8px @warning-color,
            -16px -8px 0 -8px @warning-color;
    }

    100% {
        box-shadow:
            0 -36px 0 -10px transparent,
            32px -16px 0 -10px transparent,
            32px 16px 0 -10px transparent,
            0 36px 0 -10px transparent,
            -32px 16px 0 -10px transparent,
            -32px -16px 0 -10px transparent;
    }
}

@media (prefers-reduced-motion: reduce) {
    .animal-rate__star--pop,
    .animal-rate__splash {
        animation: none;
    }
}
</style>
