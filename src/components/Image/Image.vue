<script setup lang="ts">
import { ref, watch, nextTick, computed, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';
import type { ImageColor } from './types';

interface Props {
    /** 图片地址（必填） */
    src: string;
    /** 图片替代文本（无障碍）；留空表示装饰性图片 */
    alt?: string;
    /** 图片宽度 */
    width?: number | string;
    /** 图片高度 */
    height?: number | string;
    /** 背景颜色（Card pattern 同款底色，无花纹；'white' 为纯白，默认 white；仅 variant='bordered' 时生效） */
    color?: ImageColor;
    /** 是否启用懒加载 */
    lazy?: boolean;
    /** 相框类型：'default' 卡片大阴影+大圆角（默认），'bordered' 边框柔和阴影+小圆角，'stamp' 邮票齿孔边框 */
    variant?: 'default' | 'bordered' | 'stamp';
    /** 邮票类型（variant='stamp'）下的发行年份，如「2026」，印在右上角照片上；留空不显示 */
    stampYear?: string;
    /** 点击图片弹出大图预览（默认开启） */
    preview?: boolean;
}

// 多根节点（相框 + Teleport），关闭自动继承，手动把 class/style 绑到相框
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
    alt: '',
    width: undefined,
    height: undefined,
    color: 'white',
    lazy: false,
    variant: 'default',
    stampYear: undefined,
    preview: true,
});

const emit = defineEmits<{
    (e: 'load', event: Event): void;
    (e: 'error', event: Event): void;
}>();

const attrs = useAttrs();

// 透传给 <img> 的原生属性：去掉 class/style（已手动合并到相框），其余（title / crossorigin / referrerpolicy / decoding 等）透传到 img，对齐 React 的 ...rest
const imgAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs as Record<string, unknown>;
    return rest;
});

// failed：主图加载失败时显示错误占位
const failed = ref(false);
const loaded = ref(false);
// 大图预览开关
const previewOpen = ref(false);
const closeBtnRef = ref<HTMLButtonElement | null>(null);
const lastFocusedRef = ref<HTMLElement | null>(null);

// src 变化时重置加载状态
watch(
    () => props.src,
    () => {
        failed.value = false;
        loaded.value = false;
    }
);

function handleLoad(e: Event) {
    loaded.value = true;
    emit('load', e);
}

function handleError(e: Event) {
    // 加载失败 → 错误占位
    failed.value = true;
    loaded.value = true;
    emit('error', e);
}

// 预览打开：聚焦关闭按钮；ESC 关闭；Tab 圈定在遮罩内（遮罩里只有关闭按钮可聚焦）
// 预览关闭后把焦点还给触发元素
watch(previewOpen, (open, _old, onCleanup) => {
    if (!open) {
        lastFocusedRef.value?.focus?.();
        lastFocusedRef.value = null;
        return;
    }
    nextTick(() => {
        closeBtnRef.value?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            previewOpen.value = false;
        } else if (e.key === 'Tab') {
            e.preventDefault();
            closeBtnRef.value?.focus();
        }
    };
    document.addEventListener('keydown', onKey);
    onCleanup(() => document.removeEventListener('keydown', onKey));
});

function openPreview() {
    lastFocusedRef.value = document.activeElement as HTMLElement | null;
    previewOpen.value = true;
}

function closePreview() {
    previewOpen.value = false;
}

// 相框类名：failed → error；否则按 loaded / preview / variant 叠加；用户传入的 class 一并合并
const frameClasses = computed<(string | false | undefined)[]>(() => {
    const cls: (string | false | undefined)[] = ['animal-image'];
    if (failed.value) {
        cls.push('animal-image--error');
        // 错误占位仍保留调色板底色（与 React 一致：color 类在 error 态也生效）
        if (props.color !== 'white') cls.push(`animal-image--${props.color}`);
    } else {
        if (loaded.value) cls.push('animal-image--loaded');
        if (props.preview) cls.push('animal-image--preview');
        // 非默认相框叠加 variant 类（default 用基础样式，避免与 color 同名类冲突）
        if (props.variant !== 'default') cls.push(`animal-image--variant-${props.variant}`);
        // 背景颜色仅 variant='bordered' 时生效（对齐 React：color 类只在 bordered 相框内出现）
        if (props.variant === 'bordered' && props.color !== 'white') cls.push(`animal-image--${props.color}`);
    }
    if (attrs.class) cls.push(attrs.class as string);
    return cls;
});

// 相框样式：width/height + 用户传入的 style 合并
const frameStyles = computed(() => {
    const arr: (CSSProperties | string)[] = [frameStyle.value];
    if (attrs.style) {
        arr.push(attrs.style as CSSProperties);
    }
    return arr;
});

const frameStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    if (props.width !== undefined) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    if (props.height !== undefined) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    return style;
});

const dialogAriaLabel = computed(() => (props.alt ? `查看图片：${props.alt}` : '图片预览'));
const errorAriaLabel = computed(() => props.alt || '图片加载失败');
</script>

<template>
    <!-- 加载失败：错误占位 -->
    <span v-if="failed" :class="frameClasses" :style="frameStyles" role="img" :aria-label="errorAriaLabel">
        <svg
            class="animal-image__error-icon"
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="none"
            stroke="#2A2A2A"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="6" y="10" width="36" height="28" rx="3" fill="#FAEDCD" />
            <circle cx="16" cy="20" r="3" fill="#E9C46A" />
            <path d="M10 36 L20 24 L28 32 L36 22 L42 36 Z" fill="#2A9D8F" />
            <path d="M10 36 L42 36" stroke="#2A2A2A" />
        </svg>
        <span>图片加载失败</span>
    </span>
    <!-- 点击预览：相框升格为按钮（原生支持 Enter / Space），预览弹层经 Teleport 挂到 body -->
    <button v-else-if="preview" type="button" :class="frameClasses" :style="frameStyles" @click="openPreview">
        <img
            :src="src"
            :alt="alt"
            :loading="lazy ? 'lazy' : undefined"
            class="animal-image__img"
            v-bind="imgAttrs"
            @load="handleLoad"
            @error="handleError"
        />
        <span v-if="variant === 'stamp' && stampYear" class="animal-image__stamp-year">{{ stampYear }}</span>
    </button>
    <!-- 默认：相框为 span -->
    <span v-else :class="frameClasses" :style="frameStyles">
        <img
            :src="src"
            :alt="alt"
            :loading="lazy ? 'lazy' : undefined"
            class="animal-image__img"
            v-bind="imgAttrs"
            @load="handleLoad"
            @error="handleError"
        />
        <span v-if="variant === 'stamp' && stampYear" class="animal-image__stamp-year">{{ stampYear }}</span>
    </span>

    <!-- 大图预览弹层 -->
    <Teleport v-if="preview" to="body">
        <div v-if="previewOpen" class="animal-image__mask" @click="closePreview">
            <div class="animal-image__dialog" role="dialog" aria-modal="true" :aria-label="dialogAriaLabel" @click.stop>
                <button
                    ref="closeBtnRef"
                    type="button"
                    class="animal-image__close-btn"
                    aria-label="关闭预览"
                    @click="closePreview"
                >
                    <span class="animal-image__close-mark" />
                </button>
                <img :src="src" :alt="alt" class="animal-image__preview-img" />
            </div>
        </div>
    </Teleport>
</template>

<style lang="less">
// 不使用 scoped，与 Drawer 一致：预览弹层经 Teleport 渲染到 body，全局样式保证命中。
// 类名采用 BEM（animal-image*）避免冲突。

@frame-bg: #fff; // 默认背景白色

// ---------- Frame ----------
.animal-image {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    border: none; // 相框无边框；preview 默认开启时相框是 <button>，显式去除 UA 边框
    background: @frame-bg;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.08);
    line-height: 0;
    vertical-align: middle;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &__img {
        display: block;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    // --loaded 在根元素上，__img 是其后代 → 后代选择器命中
    &--loaded &__img {
        opacity: 1;
    }

    &--error {
        line-height: 1.5;
        flex-direction: column;
        gap: 8px;
        color: #c4b89e;
        font-size: 13px;
        font-weight: 500;
    }
}

// ============================================
// Color variants — Card pattern 同款底色（无花纹）
// 白色（white）由 base .animal-image 提供；其余为 pattern 底色的纯色
// ============================================

// Default — 奶油色
.animal-image--default {
    background: rgb(247, 243, 223);
    color: #725d42;
}
// App Pink — 应用粉
.animal-image--app-pink {
    background: #fde4e8;
    color: #a85565;
}
// Purple — 紫色
.animal-image--purple {
    background: #f0e8ff;
    color: #6a3a9a;
}
// App Blue — 应用蓝
.animal-image--app-blue {
    background: #e8edff;
    color: #4a5a8a;
}
// App Yellow — 应用黄
.animal-image--app-yellow {
    background: #fff8e0;
    color: #7a6528;
}
// App Orange — 应用橙
.animal-image--app-orange {
    background: #fff0e8;
    color: #8a4a2a;
}
// App Teal — 应用青
.animal-image--app-teal {
    background: #e8faf5;
    color: #2a6b5a;
}
// App Green — 应用绿
.animal-image--app-green {
    background: #e8f5e8;
    color: #3a6b3a;
}
// App Red — 应用红
.animal-image--app-red {
    background: #ffe8e8;
    color: #9a3a3a;
}
// Lime Green — 青柠绿
.animal-image--lime-green {
    background: #f5f8e0;
    color: #5a6b28;
}
// Yellow-Green — 黄绿色
.animal-image--yellow-green {
    background: #fffde8;
    color: #6a5a28;
}
// Brown — 棕色
.animal-image--brown {
    background: #f5f0e0;
    color: #5a4a2a;
}
// Warm Peach Pink — 暖桃粉
.animal-image--warm-peach-pink {
    background: #fff0e8;
    color: #8a4a2a;
}

// ---------- Preview trigger (点击预览) ----------
.animal-image--preview {
    font: inherit;
    color: inherit;
    -webkit-appearance: none;
    appearance: none;
    cursor: zoom-in;

    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 2px;
    }
}

// ---------- Preview mask (大图预览遮罩) ----------
.animal-image__mask {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    animation: animal-image-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.animal-image__preview-img {
    max-width: min(88vw, 1100px);
    max-height: 86vh;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(43, 33, 24, 0.55);
    object-fit: contain;
    animation: animal-image-zoom-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.animal-image__dialog {
    position: relative;
    display: inline-flex;
    line-height: 0;
}

.animal-image__close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1.5px solid rgba(255, 255, 255, 0.75);
    border-radius: 50%;
    background: rgba(216, 220, 226, 0.9); // 浅灰背景
    color: #fff; // 白色叉号
    cursor: pointer;
    transition:
        background 0.15s ease,
        transform 0.15s ease;

    &:hover {
        background: rgba(196, 201, 208, 0.95);
        transform: scale(1.06);
    }

    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 2px;
    }
}

.animal-image__close-mark {
    position: relative;
    display: block;
    width: 16px;
    height: 16px;

    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 16px;
        height: 2px;
        border-radius: 2px;
        background: currentColor;
    }

    &::before {
        transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
}

@keyframes animal-image-fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes animal-image-zoom-in {
    from {
        opacity: 0;
        transform: scale(0.92);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

// ---------- Frame variant（相框类型） ----------
// default：无边框、无内边距、图片撑满，卡片大阴影 + 12px 大圆角
.animal-image--variant-default {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 12px;
    box-shadow:
        0 13px 27px -5px rgba(50, 50, 93, 0.25),
        0 8px 16px -8px rgba(0, 0, 0, 0.3),
        0 -6px 16px -6px rgba(0, 0, 0, 0.03);
}

// bordered：边框 + 柔和阴影 + 小圆角（color 调色板底色在边框内生效）
.animal-image--variant-bordered {
    border: 1px solid rgba(114, 93, 66, 0.25);
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
}

// stamp：邮票变体。奶油底纸 + 四周齿孔（mask-composite 交集）。
.animal-image--variant-stamp {
    border: none;
    padding: 14px; // 齿孔内侧照片内缩
    background: #fbfaf5; // 邮票底纸暖白
    border-radius: 0;
    box-shadow: none;

    -webkit-mask-image:
        radial-gradient(circle 5px at 50% 0, transparent 96%, #000),
        radial-gradient(circle 5px at 50% 100%, transparent 96%, #000),
        radial-gradient(circle 5px at 0 50%, transparent 96%, #000),
        radial-gradient(circle 5px at 100% 50%, transparent 96%, #000);
    -webkit-mask-position:
        50% 0,
        50% 100%,
        0 50%,
        100% 50%;
    -webkit-mask-size:
        16px 100%,
        16px 100%,
        100% 16px,
        100% 16px;
    -webkit-mask-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    -webkit-mask-composite: source-in, source-in, source-in, source-in;
    mask-image:
        radial-gradient(circle 5px at 50% 0, transparent 96%, #000),
        radial-gradient(circle 5px at 50% 100%, transparent 96%, #000),
        radial-gradient(circle 5px at 0 50%, transparent 96%, #000),
        radial-gradient(circle 5px at 100% 50%, transparent 96%, #000);
    mask-position:
        50% 0,
        50% 100%,
        0 50%,
        100% 50%;
    mask-size:
        16px 100%,
        16px 100%,
        100% 16px,
        100% 16px;
    mask-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    mask-composite: intersect, intersect, intersect, intersect;

    // 阴影用 filter 的 drop-shadow（mask 会裁剪 box-shadow）
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35)) drop-shadow(0 16px 26px rgba(0, 0, 0, 0.45));

    .animal-image__img {
        filter: saturate(0.93) contrast(1.03);
    }
}

.animal-image--variant-stamp::after {
    content: '';
    position: absolute;
    inset: 14px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.13;
    background-image: radial-gradient(circle, rgba(18, 18, 28, 0.6) 0.6px, transparent 0.75px);
    background-size: 4px 4px;
}

// 邮票照片上的年份：右上角，白字 + 暗阴影
.animal-image__stamp-year {
    position: absolute;
    right: 19px;
    top: 18px;
    z-index: 2;
    font-size: 8px;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
    pointer-events: none;
}
</style>
