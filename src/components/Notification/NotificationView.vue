<script setup lang="ts">
import { ref, watch, onUnmounted, defineComponent, type VNode } from 'vue';
import type { NotificationItem } from './types';

/** 渲染 VNode 的函数式组件（用于命令式 API 传入的自定义内容） */
const VNodeRenderer = defineComponent({
    name: 'VNodeRenderer',
    props: { node: { type: null, default: null } },
    setup(props) {
        return () => props.node as VNode;
    },
});

const props = defineProps<{ item: NotificationItem }>();
const emit = defineEmits<{ (e: 'remove', key: string): void }>();

const LEAVE_MS = 250;

const leaving = ref(false);
let closeTimer: number | null = null;
let removeTimer: number | null = null;

function triggerClose() {
    if (leaving.value) return;
    leaving.value = true;
}

// 倒计时
watch(
    () => props.item.duration,
    (duration) => {
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
        if (duration && duration > 0) {
            closeTimer = window.setTimeout(() => {
                triggerClose();
            }, duration * 1000);
        }
    },
    { immediate: true }
);

// 退场动画结束后移除
watch(leaving, (val) => {
    if (!val) return;
    removeTimer = window.setTimeout(() => {
        emit('remove', props.item.key);
        props.item.onClose?.();
    }, LEAVE_MS);
});

onUnmounted(() => {
    if (closeTimer !== null) window.clearTimeout(closeTimer);
    if (removeTimer !== null) window.clearTimeout(removeTimer);
});

function handleCloseClick(e: Event) {
    e.stopPropagation();
    triggerClose();
}

function handleClick() {
    props.item.onClick?.();
}

function handleKeydown(e: KeyboardEvent) {
    if (props.item.onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        props.item.onClick();
    }
}
</script>

<template>
    <div
        class="animal-notification"
        :class="[
            `animal-notification--type-${item.type}`,
            `animal-notification--placement-${item.placement}`,
            {
                'animal-notification--leaving': leaving,
                'animal-notification--clickable': !!item.onClick,
            },
            item.className,
        ]"
        :style="item.style"
        @click="handleClick"
        :role="item.onClick ? 'button' : undefined"
        :tabindex="item.onClick ? 0 : undefined"
        @keydown="handleKeydown"
        :data-notification-key="item.key"
    >
        <div class="animal-notification__icon-wrap" aria-hidden="true">
            <VNodeRenderer v-if="item.icon" :node="item.icon" />
            <!-- success icon -->
            <svg v-else-if="item.type === 'success'" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
            <!-- info icon -->
            <svg v-else-if="item.type === 'info'" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                <circle cx="12" cy="7" r="1.6" fill="currentColor" />
                <path d="M12 11v7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <!-- warning icon -->
            <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                <path
                    d="M12 4l9.5 16.5h-19z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linejoin="round"
                />
                <path
                    d="M12 10v4M12 16.5v.01"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                />
            </svg>
            <!-- error icon -->
            <svg v-else viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                <path
                    d="M6.5 6.5l11 11M17.5 6.5l-11 11"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                />
            </svg>
        </div>
        <div class="animal-notification__body">
            <div class="animal-notification__title">{{ item.message }}</div>
            <div v-if="item.description != null" class="animal-notification__description">
                {{ item.description }}
            </div>
        </div>
        <div v-if="item.btn" class="animal-notification__btn-slot">
            <VNodeRenderer :node="item.btn" />
        </div>
        <button
            type="button"
            class="animal-notification__close"
            aria-label="close"
            @click="handleCloseClick"
        >
            <VNodeRenderer v-if="item.closeIcon" :node="item.closeIcon" />
            <span v-else aria-hidden="true">×</span>
        </button>
    </div>
</template>

<style>
.animal-notification {
    pointer-events: auto;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 384px;
    max-width: calc(100vw - 48px);
    padding: 14px 16px;
    background: rgb(247, 243, 223);
    border: 2px solid #c4b89e;
    border-radius: 18px;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.14);
    font-family: Nunito, 'Noto Sans SC', -apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
    color: #725d42;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    will-change: transform, opacity;
}

.animal-notification--clickable {
    cursor: pointer;
}

.animal-notification--clickable:hover {
    box-shadow: 0 10px 26px rgba(61, 52, 40, 0.18);
    transform: translateY(-1px);
}

.animal-notification--clickable:focus-visible {
    outline: 2px solid #ffcc00;
    outline-offset: 2px;
}

/* Type accents */
.animal-notification--type-success {
    background: #f5fae9;
    border-color: #6fba2c;
    box-shadow: 0 6px 18px rgba(111, 186, 44, 0.18);
}
.animal-notification--type-success .animal-notification__icon-wrap {
    background: #d8efc1;
    color: #5a9e1e;
}

.animal-notification--type-info {
    background: #ecf9f6;
    border-color: #19c8b9;
    box-shadow: 0 6px 18px rgba(25, 200, 185, 0.18);
}
.animal-notification--type-info .animal-notification__icon-wrap {
    background: #c2ece6;
    color: #11a89b;
}

.animal-notification--type-warning {
    background: #fdf6d9;
    border-color: #f5c31c;
    box-shadow: 0 6px 18px rgba(245, 195, 28, 0.2);
}
.animal-notification--type-warning .animal-notification__icon-wrap {
    background: #fbeaa1;
    color: #b88a06;
}

.animal-notification--type-error {
    background: #fde8e8;
    border-color: #e05a5a;
    box-shadow: 0 6px 18px rgba(224, 90, 90, 0.18);
}
.animal-notification--type-error .animal-notification__icon-wrap {
    background: #f7c8c8;
    color: #c94444;
}

/* Icon */
.animal-notification__icon-wrap {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1;
    user-select: none;
}

/* Body */
.animal-notification__body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.animal-notification__title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;
    color: #794f27;
    letter-spacing: 0.01em;
    word-break: break-word;
}

.animal-notification__description {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.55;
    color: #8a7b66;
    letter-spacing: 0.01em;
    word-break: break-word;
}

/* Custom action button slot */
.animal-notification__btn-slot {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
}

/* Close button */
.animal-notification__close {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-left: 4px;
    padding: 0;
    border: none;
    background: transparent;
    color: rgba(114, 93, 66, 0.55);
    font-size: 18px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.15s ease;
}

.animal-notification__close:hover {
    background: rgba(114, 93, 66, 0.12);
    color: rgba(114, 93, 66, 1);
}

.animal-notification__close:focus-visible {
    outline: 2px solid #ffcc00;
    outline-offset: 2px;
}

/* Enter / leave animations */
.animal-notification--placement-top {
    animation: animal-notification-slide-from-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.animal-notification--placement-top.animal-notification--leaving {
    animation: animal-notification-slide-out-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.animal-notification--placement-bottom {
    animation: animal-notification-rise-from-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.animal-notification--placement-bottom.animal-notification--leaving {
    animation: animal-notification-sink-out-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes animal-notification-slide-from-top {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes animal-notification-slide-out-top {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-16px); }
}
@keyframes animal-notification-rise-from-bottom {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes animal-notification-sink-out-bottom {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(16px); }
}

@media (prefers-reduced-motion: reduce) {
    .animal-notification--placement-top,
    .animal-notification--placement-bottom {
        animation-duration: 0.01s;
    }
    .animal-notification--placement-top.animal-notification--leaving,
    .animal-notification--placement-bottom.animal-notification--leaving {
        animation-duration: 0.01s;
    }
}
</style>
