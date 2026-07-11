<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, computed, useSlots } from 'vue';
import type { DrawerProps } from './types';

const props = withDefaults(defineProps<DrawerProps>(), {
    placement: 'right',
    width: 378,
    height: 300,
    maskClosable: true,
    pushBackground: true,
});

const emit = defineEmits<{ (e: 'close'): void }>();
defineSlots<{
    default?: () => unknown;
    footer?: () => unknown;
}>();
const slots = useSlots();

const dialogRef = ref<HTMLDivElement | null>(null);
const previouslyFocused = ref<HTMLElement | null>(null);
const restoreTransitionRaf = ref<number | null>(null);

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
].join(',');

function getFocusable(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    );
}

// 打开时记录焦点 + 送入抽屉
watch(
    () => props.open,
    (open) => {
        if (open) {
            previouslyFocused.value = (document.activeElement as HTMLElement) ?? null;
            const id = window.setTimeout(() => {
                const dialog = dialogRef.value;
                if (!dialog) return;
                const focusables = getFocusable(dialog);
                (focusables[0] ?? dialog).focus();
            }, 0);
            // 清理在关闭时
            watch(
                () => props.open,
                (o) => {
                    if (!o) {
                        window.clearTimeout(id);
                        previouslyFocused.value?.focus?.();
                    }
                },
                { once: true }
            );
        }
    },
    { immediate: true }
);

// ESC 关闭 + Tab 焦点陷阱
function handleKeyDown(e: KeyboardEvent) {
    if (!props.open) return;
    if (e.key === 'Escape') {
        emit('close');
        return;
    }
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.value;
    if (!dialog) return;
    const focusables = getFocusable(dialog);
    if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (active === last || !dialog.contains(active)) {
            e.preventDefault();
            first.focus();
        }
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown);
    onUnmounted(() => document.removeEventListener('keydown', handleKeyDown));
}

// 禁止滚动
watch(
    () => props.open,
    (open) => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
);

// 背景下沉景深效果
const pendingCleanup = ref<(() => void) | null>(null);

watch(
    () => [props.open, props.pushBackground] as const,
    ([open, push]) => {
        if (!open || !push) return;

        if (restoreTransitionRaf.value !== null) {
            cancelAnimationFrame(restoreTransitionRaf.value);
            restoreTransitionRaf.value = null;
        }

        const pushed: Array<{
            el: HTMLElement;
            transform: string;
            filter: string;
            borderRadius: string;
            overflow: string;
            transition: string;
        }> = [];

        const candidates = Array.from(document.body.children).filter((el): el is HTMLElement => {
            if (!(el instanceof HTMLElement)) return false;
            const tag = el.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return false;
            if (el.hasAttribute('data-animal-drawer-ignore')) return false;
            if (el.hasAttribute('data-animal-drawer-portal')) return false;
            return getComputedStyle(el).position !== 'fixed';
        });

        candidates.forEach((el) => {
            pushed.push({
                el,
                transform: el.style.transform,
                filter: el.style.filter,
                borderRadius: el.style.borderRadius,
                overflow: el.style.overflow,
                transition: el.style.transition,
            });
            el.style.transition =
                'transform 0.36s cubic-bezier(0.2, 0, 0.2, 1), filter 0.36s ease, border-radius 0.36s ease';
        });

        const rafId = requestAnimationFrame(() => {
            pushed.forEach(({ el }) => {
                el.style.transform = 'scale(0.94)';
                el.style.filter = 'blur(1px)';
                el.style.borderRadius = '14px';
                el.style.overflow = 'hidden';
            });
        });

        const cleanup = () => {
            cancelAnimationFrame(rafId);
            if (restoreTransitionRaf.value !== null) {
                cancelAnimationFrame(restoreTransitionRaf.value);
                restoreTransitionRaf.value = null;
            }
            pushed.forEach(({ el, transform, filter, borderRadius, overflow }) => {
                el.style.transform = transform;
                el.style.filter = filter;
                el.style.borderRadius = borderRadius;
                el.style.overflow = overflow;
            });
            restoreTransitionRaf.value = requestAnimationFrame(() => {
                pushed.forEach(({ el, transition }) => {
                    el.style.transition = transition;
                });
                restoreTransitionRaf.value = null;
            });
        };

        pendingCleanup.value = cleanup;
    },
    { immediate: true }
);

// 当 open 变为 false 时执行清理
watch(
    () => props.open,
    (open, prevOpen) => {
        if (!open && prevOpen) {
            nextTick(() => {
                pendingCleanup.value?.();
                pendingCleanup.value = null;
            });
        }
    }
);

onUnmounted(() => {
    pendingCleanup.value?.();
    pendingCleanup.value = null;
    document.body.style.overflow = '';
});

function handleMaskClick() {
    if (props.maskClosable) emit('close');
}

function handleContentClick(e: Event) {
    e.stopPropagation();
}

const panelStyle = computed(() => {
    const style: Record<string, string> = {};
    if (props.placement === 'left' || props.placement === 'right') {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    } else {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    return style;
});

const panelClass = computed(() => {
    return [
        'animal-drawer__panel',
        `animal-drawer__panel--${props.placement}`,
        { 'animal-drawer__panel--open': props.open },
    ];
});

const idBase = `animal-drawer-${Math.random().toString(36).slice(2, 10)}`;
const titleId = `${idBase}-title`;
</script>

<template>
    <Teleport to="body">
        <div data-animal-drawer-portal>
            <div
                class="animal-drawer__mask"
                :class="{ 'animal-drawer__mask--open': open }"
                :style="maskStyle"
                @click="handleMaskClick"
                :aria-hidden="!open"
            >
                <div
                    ref="dialogRef"
                    :class="panelClass"
                    :style="panelStyle"
                    @click="handleContentClick"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? titleId : undefined"
                    :aria-hidden="!open"
                    :inert="!open"
                    tabindex="-1"
                >
                    <div v-if="title" class="animal-drawer__header">
                        <div class="animal-drawer__title" :id="titleId">{{ title }}</div>
                        <button
                            type="button"
                            class="animal-drawer__close"
                            @click="emit('close')"
                            aria-label="关闭"
                        >
                            ×
                        </button>
                    </div>
                    <div class="animal-drawer__body">
                        <slot />
                    </div>
                    <div v-if="footer || slots.footer" class="animal-drawer__footer">
                        <slot name="footer">{{ footer }}</slot>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style lang="less">
// 不使用 scoped，与 React 版一致（全局样式，通过 Teleport 渲染到 body）
.animal-drawer__mask {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.18);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.36s ease;

    &--open {
        opacity: 1;
        pointer-events: all;
    }
}

.animal-drawer__panel {
    position: fixed;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    background: rgb(247, 243, 223);
    color: rgb(128, 115, 89);
    font-family: Nunito, 'Noto Sans SC', sans-serif;
    overflow: hidden;
    transition: transform 0.36s cubic-bezier(0.2, 0, 0.2, 1);

    &--right {
        top: 0;
        right: 0;
        height: 100vh;
        max-width: calc(100vw - 32px);
        border-radius: 20px 0 0 20px;
        box-shadow: -12px 0 32px rgba(61, 52, 40, 0.18);
        transform: translateX(100%);
    }

    &--left {
        top: 0;
        left: 0;
        height: 100vh;
        max-width: calc(100vw - 32px);
        border-radius: 0 20px 20px 0;
        box-shadow: 12px 0 32px rgba(61, 52, 40, 0.18);
        transform: translateX(-100%);
    }

    &--top {
        top: 0;
        left: 0;
        right: 0;
        max-height: calc(100vh - 32px);
        border-radius: 0 0 20px 20px;
        box-shadow: 0 12px 32px rgba(61, 52, 40, 0.18);
        transform: translateY(-100%);
    }

    &--bottom {
        bottom: 0;
        left: 0;
        right: 0;
        max-height: calc(100vh - 32px);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -12px 32px rgba(61, 52, 40, 0.18);
        transform: translateY(100%);
    }

    // 打开态：.panel.panelOpen 复合选择器，特异性 > 单类 placement
    &.animal-drawer__panel--open {
        transform: none;
    }
}

.animal-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 15px 24px;
    flex-shrink: 0;
}

.animal-drawer__title {
    font-size: 28px;
    font-weight: 700;
    color: rgba(114, 93, 66, 1);
}

.animal-drawer__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    color: rgba(114, 93, 66, 0.6);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(114, 93, 66, 0.1);
        color: rgba(114, 93, 66, 1);
    }
}

.animal-drawer__body {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px 24px 24px;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.6;
    color: #8a7b66;
}

.animal-drawer__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 0 24px 24px 24px;
    flex-shrink: 0;
}
</style>
