<script setup lang="ts">
import { computed, ref, useSlots, watchEffect } from 'vue';
import { Fragment, type VNode } from 'vue';

interface Props {
    /** 当前索引（v-model）— 受控 */
    modelValue?: number;
    /** 非受控模式的初始索引 */
    defaultActiveIndex?: number;
    /** 是否自动播放 */
    autoplay?: boolean;
    /** 自动播放间隔，单位毫秒 */
    interval?: number;
    /** 是否首尾循环 */
    loop?: boolean;
    /** 是否显示左右箭头 */
    showArrows?: boolean;
    /** 是否显示圆点指示器 */
    showDots?: boolean;
    /** 鼠标悬停时是否暂停自动播放；键盘焦点进入时始终暂停 */
    pauseOnHover?: boolean;
    /** 无障碍标签 */
    ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    defaultActiveIndex: 0,
    autoplay: false,
    interval: 3_000,
    loop: true,
    showArrows: true,
    showDots: true,
    pauseOnHover: true,
    ariaLabel: '轮播图',
});

const emit = defineEmits<{
    (e: 'update:modelValue', index: number): void;
    (e: 'change', index: number): void;
}>();

// vue-tsc 2.2.0 对 useSlots() 的类型推断有缺陷，这里显式标注绕过
const slots = useSlots() as { default?: () => VNode[] | undefined };

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), Math.max(max, 0));

/** 展平 Fragment（slot 内容为多根元素时会产生 Fragment 节点） */
function flattenVNodes(vnodes: VNode[]): VNode[] {
    return vnodes.reduce<VNode[]>((acc, vnode) => {
        if (vnode.type === Fragment) {
            acc.push(...flattenVNodes((vnode.children as VNode[] | null) ?? []));
        } else {
            acc.push(vnode);
        }
        return acc;
    }, []);
}

/** 轮播内容：默认插槽的每个直接子元素为一张 */
const slides = computed(() => flattenVNodes(slots.default?.() ?? []));
const lastIndex = computed(() => slides.value.length - 1);

// 内部 state，仅在非受控（未传 modelValue）时使用
// 注意：初始值不能在这里访问 slides（setup 期间调用 slot 会脱离渲染上下文），
// 越界值由 currentIndex 的 clamp 兜底
const internalIndex = ref(props.defaultActiveIndex ?? 0);
const hoverPaused = ref(false);
const focusPaused = ref(false);
const rotationPaused = ref(false);

const currentIndex = computed(() => clamp(props.modelValue ?? internalIndex.value, lastIndex.value));
const effectivePaused = computed(() => hoverPaused.value || focusPaused.value || rotationPaused.value);
const hasControls = computed(() => slides.value.length > 1);

function goTo(nextIndex: number) {
    const len = slides.value.length;
    if (len === 0) return;
    let normalized = nextIndex;
    if (props.loop) normalized = ((nextIndex % len) + len) % len;
    else normalized = clamp(nextIndex, lastIndex.value);
    if (normalized === currentIndex.value) return;
    if (props.modelValue === undefined) {
        internalIndex.value = normalized;
    }
    emit('update:modelValue', normalized);
    emit('change', normalized);
}

// flush: 'post' — 首次执行推迟到渲染之后，避免在 setup 阶段触发 slot 求值（脱离渲染上下文）
watchEffect(
    (onCleanup) => {
        if (!props.autoplay || effectivePaused.value || slides.value.length < 2) return;
        const index = currentIndex.value;
        const timer = window.setInterval(() => goTo(index + 1), Math.max(props.interval, 1_000));
        onCleanup(() => window.clearInterval(timer));
    },
    { flush: 'post' }
);

function toggleRotation() {
    if (effectivePaused.value) {
        hoverPaused.value = false;
        focusPaused.value = false;
        rotationPaused.value = false;
    } else {
        rotationPaused.value = true;
    }
}

function handleKeyDown(e: KeyboardEvent) {
    const { key } = e;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
    e.preventDefault();
    if (key === 'ArrowLeft') goTo(currentIndex.value - 1);
    else if (key === 'ArrowRight') goTo(currentIndex.value + 1);
    else if (key === 'Home') goTo(0);
    else goTo(lastIndex.value);
}

function handleMouseEnter() {
    if (props.pauseOnHover) hoverPaused.value = true;
}

function handleMouseLeave() {
    hoverPaused.value = false;
}

// 焦点仅在「从外部进入 / 离开整个 region」时切换暂停态（内部控件间移动不触发）
function handleFocusIn(e: FocusEvent) {
    const current = e.currentTarget as Node | null;
    if (current && !current.contains(e.relatedTarget as Node | null)) {
        focusPaused.value = true;
    }
}

function handleFocusOut(e: FocusEvent) {
    const current = e.currentTarget as Node | null;
    if (current && !current.contains(e.relatedTarget as Node | null)) {
        focusPaused.value = false;
    }
}
</script>

<template>
    <section
        class="animal-carousel"
        role="region"
        aria-roledescription="carousel"
        :aria-label="ariaLabel"
        tabindex="0"
        @keydown="handleKeyDown"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @focusin="handleFocusIn"
        @focusout="handleFocusOut"
    >
        <button
            v-if="hasControls && autoplay"
            type="button"
            class="animal-carousel__rotation-control"
            :aria-label="effectivePaused ? '继续自动播放' : '暂停自动播放'"
            @click="toggleRotation"
        >
            {{ effectivePaused ? '播放' : '暂停' }}
        </button>

        <div class="animal-carousel__viewport">
            <div
                v-for="(slide, index) in slides"
                :key="index"
                class="animal-carousel__slide"
                :class="{ 'animal-carousel__slide--active': index === currentIndex }"
                role="group"
                aria-roledescription="slide"
                :aria-label="`第 ${index + 1} 张，共 ${slides.length} 张`"
                :aria-hidden="index !== currentIndex"
            >
                <component :is="slide" />
            </div>
        </div>

        <template v-if="hasControls && showArrows">
            <button
                type="button"
                class="animal-carousel__arrow animal-carousel__arrow--prev"
                aria-label="上一张"
                :disabled="!loop && currentIndex === 0"
                @click="goTo(currentIndex - 1)"
            />
            <button
                type="button"
                class="animal-carousel__arrow animal-carousel__arrow--next"
                aria-label="下一张"
                :disabled="!loop && currentIndex === lastIndex"
                @click="goTo(currentIndex + 1)"
            />
        </template>

        <div v-if="hasControls && showDots" class="animal-carousel__dots" role="group" aria-label="选择轮播页">
            <button
                v-for="(_, index) in slides"
                :key="index"
                type="button"
                class="animal-carousel__dot"
                :class="{ 'animal-carousel__dot--active': index === currentIndex }"
                :aria-label="`转到第 ${index + 1} 张`"
                :aria-current="index === currentIndex ? 'true' : undefined"
                @click="goTo(index)"
            />
        </div>
    </section>
</template>

<style lang="less" scoped>
.animal-carousel {
    position: relative;
    width: 100%;
    min-width: 0;
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
    border-radius: 20px;
    outline: none;

    &:focus-visible {
        outline: 2px solid var(--animal-primary-color, #19c8b9);
        outline-offset: 3px;
    }

    &__viewport {
        position: relative;
        overflow: hidden;
        min-height: 180px;
        background: rgb(247, 243, 223);
        border-radius: 20px;
    }

    &__slide {
        position: absolute;
        inset: 0;
        width: 100%;
        min-height: 180px;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(18px);
        transition:
            opacity var(--animal-motion-duration-slow, 0.3s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1)),
            transform var(--animal-motion-duration-slow, 0.3s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1)),
            visibility var(--animal-motion-duration-slow, 0.3s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));

        &--active {
            position: relative;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(0);
        }
    }

    &__arrow {
        position: absolute;
        top: 50%;
        z-index: 2;
        width: 42px;
        height: 42px;
        padding: 0;
        border: 1.5px solid rgba(121, 79, 39, 0.16);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        color: var(--animal-text-color, #794f27);
        cursor: pointer;
        transform: translateY(-50%);
        box-shadow: var(--animal-shadow-sm, 0 2px 4px rgba(61, 52, 40, 0.06));
        transition: all var(--animal-motion-duration-base, 0.2s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 9px;
            height: 9px;
            border-top: 3px solid currentColor;
            border-left: 3px solid currentColor;
        }

        &:hover:not(:disabled) {
            color: var(--animal-primary-color-active, #0ea89c);
            transform: translateY(calc(-50% - 2px));
        }

        &:active:not(:disabled) {
            transform: translateY(-50%);
        }

        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
            outline-offset: 2px;
        }

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        &--prev {
            left: 14px;

            &::before {
                transform: translate(-35%, -50%) rotate(-45deg);
            }
        }

        &--next {
            right: 14px;

            &::before {
                transform: translate(-65%, -50%) rotate(135deg);
            }
        }
    }

    &__dots {
        position: absolute;
        bottom: 14px;
        left: 50%;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 7px 10px;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.85);
        transform: translateX(-50%);
    }

    &__dot {
        position: relative;
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 50px;
        background: transparent;
        cursor: pointer;
        transition: all var(--animal-motion-duration-base, 0.2s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            border-radius: 50px;
            background: #d4c9b4;
            transform: translate(-50%, -50%);
            transition: all var(--animal-motion-duration-base, 0.2s)
                var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
            outline-offset: 2px;
        }

        &--active::before {
            width: 24px;
            background: var(--animal-primary-color, #19c8b9);
        }
    }

    &__rotation-control {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 3;
        min-width: 58px;
        height: 32px;
        padding: 0 12px;
        border: 1.5px solid rgba(121, 79, 39, 0.16);
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.92);
        color: var(--animal-text-color, #794f27);
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all var(--animal-motion-duration-base, 0.2s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));

        &:hover {
            color: var(--animal-primary-color-active, #0ea89c);
            transform: translateY(-1px);
        }

        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
            outline-offset: 2px;
        }
    }
}

@media (max-width: 480px) {
    .animal-carousel__arrow {
        width: 36px;
        height: 36px;
    }

    .animal-carousel__arrow--prev {
        left: 8px;
    }

    .animal-carousel__arrow--next {
        right: 8px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .animal-carousel__slide,
    .animal-carousel__arrow,
    .animal-carousel__dot,
    .animal-carousel__dot::before,
    .animal-carousel__rotation-control {
        transition: none;
    }
}
</style>
