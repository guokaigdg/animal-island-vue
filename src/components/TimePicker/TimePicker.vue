<script setup lang="ts">
import { computed, ref, watch, useAttrs, getCurrentInstance, onBeforeUnmount, type CSSProperties } from 'vue';
import type { TimePart, TimePickerProps } from './types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TimePickerProps>(), {
    defaultValue: null,
    placeholder: '请选择时间',
    disabled: false,
    allowClear: false,
    size: 'middle',
    format: 'HH:mm:ss',
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void;
    (e: 'change', value: string | null): void;
    (e: 'update:open', open: boolean): void;
}>();

const attrs = useAttrs();

// ---------- 工具函数 ----------
const pad2 = (n: number) => `${n}`.padStart(2, '0');

/** 将 HH:mm:ss 字符串解析为时分秒对象，非法输入返回 null */
const parseTime = (value: string | null | undefined): TimePart | null => {
    if (!value) return null;
    const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value);
    if (!match) return null;
    const part: TimePart = { h: Number(match[1]), m: Number(match[2]), s: Number(match[3] ?? 0) };
    return part.h > 23 || part.m > 59 || part.s > 59 ? null : part;
};

/** 将时分秒序列化为 HH:mm:ss */
const toValue = (part: TimePart) => `${pad2(part.h)}:${pad2(part.m)}:${pad2(part.s)}`;

/** 按模板格式化时间，支持 HH / mm / ss / H / m / s 占位符 */
const formatTime = (part: TimePart, format: string) =>
    format
        .replace('HH', pad2(part.h))
        .replace('H', `${part.h}`)
        .replace('mm', pad2(part.m))
        .replace('m', `${part.m}`)
        .replace('ss', pad2(part.s))
        .replace('s', `${part.s}`);

/** 面板是否展示秒列：format 包含 ss */
const hasSeconds = (format: string) => format.includes('ss');

// ---------- 受控 / 非受控值 ----------
const innerValue = ref<string | null>(props.defaultValue ?? null);
const isControlled = computed(() => props.modelValue !== undefined);
const currentValue = computed(() => (isControlled.value ? (props.modelValue ?? null) : innerValue.value));

// ---------- 受控 / 非受控展开 ----------
// 注意：Vue 对未传入的 Boolean 类型 prop 会按 false 处理，因此不能用
// `props.open !== undefined` 判断是否受控，需通过原始 vnode.props 判断父级是否传入 open。
const instance = getCurrentInstance();
const isOpenControlled = computed(() => {
    const rawProps = instance?.vnode.props;
    return !!(rawProps && 'open' in rawProps);
});

const innerOpen = ref(false);
const open = computed(() => (isOpenControlled.value ? (props.open ?? false) : innerOpen.value));

const setOpen = (next: boolean) => {
    if (!isOpenControlled.value) innerOpen.value = next;
    emit('update:open', next);
};

// ---------- 面板状态 ----------
const pending = ref<TimePart | null>(parseTime(props.defaultValue));
const base = computed(() => pending.value ?? { h: 0, m: 0, s: 0 });
const panelStyle = ref<CSSProperties>({});
const mounted = ref(false);
const closing = ref(false);
const closingRef = ref(false);
const closeTimer = ref<number | null>(null);

const wrapperRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);
const hourListRef = ref<HTMLDivElement | null>(null);
const minuteListRef = ref<HTMLDivElement | null>(null);
const secondListRef = ref<HTMLDivElement | null>(null);

// 唯一 id 前缀（类似 React 的 useId）
const idBase = `animal-time-picker-${Math.random().toString(36).slice(2, 10)}`;
const panelId = `${idBase}-panel`;

const parsed = computed(() => parseTime(currentValue.value));
const hasValue = computed(() => !!currentValue.value);
const displayText = computed(() => {
    if (open.value && pending.value) return formatTime(pending.value, props.format);
    return parsed.value ? formatTime(parsed.value, props.format) : props.placeholder;
});

const hours = computed(() =>
    Array.from({ length: 24 }, (_, i) => i).filter((h) => h % Math.max(1, props.hourStep) === 0)
);
const minutes = computed(() =>
    Array.from({ length: 60 }, (_, i) => i).filter((m) => m % Math.max(1, props.minuteStep) === 0)
);
const seconds = computed(() =>
    hasSeconds(props.format)
        ? Array.from({ length: 60 }, (_, i) => i).filter((s) => s % Math.max(1, props.secondStep) === 0)
        : []
);

/** 关闭退场动画时长，与 .animal-time-picker__panel 的 0.2s 过渡保持一致 */
const CLOSE_ANIMATION_MS = 200;

/** 统一关闭入口：先播放退场动效，动画结束后再卸载面板 */
const closePanel = () => {
    if (closingRef.value) return;
    closingRef.value = true;
    closing.value = true;
    closeTimer.value = window.setTimeout(() => {
        closingRef.value = false;
        closing.value = false;
        setOpen(false);
        mounted.value = false;
    }, CLOSE_ANIMATION_MS);
};

// 组件卸载时清理未触发的关闭定时器
onBeforeUnmount(() => {
    if (closeTimer.value !== null) window.clearTimeout(closeTimer.value);
    document.removeEventListener('mousedown', handleClickOutside);
});

// 点击面板外部关闭
const handleClickOutside = (e: MouseEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
        closePanel();
    }
};

// 打开时：重置待选值、定位面板、把选中项滚动到列中央
watch(
    open,
    (isOpen) => {
        if (isOpen) {
            if (closeTimer.value !== null) {
                window.clearTimeout(closeTimer.value);
                closeTimer.value = null;
            }
            closingRef.value = false;
            closing.value = false;
            const part = parseTime(currentValue.value) ?? { h: 0, m: 0, s: 0 };
            pending.value = part;

            document.addEventListener('mousedown', handleClickOutside);

            // 面板定位：优先向下展开，下方空间不足且上方更宽裕时向上翻转
            if (wrapperRef.value) {
                const rect = wrapperRef.value.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const panelHeight = 320;
                const newStyle: CSSProperties = { position: 'absolute', left: 0 };
                if (rect.bottom + panelHeight > viewportHeight && rect.top > viewportHeight - rect.bottom) {
                    newStyle.bottom = '100%';
                    newStyle.marginBottom = '6px';
                } else {
                    newStyle.top = '100%';
                    newStyle.marginTop = '6px';
                }
                // 右侧空间不足时右对齐
                if (rect.left + 260 > window.innerWidth) {
                    newStyle.right = 0;
                    newStyle.left = 'auto';
                }
                panelStyle.value = newStyle;
            }

            // 条目高 28px + 间距 10px => itemHeight 38
            const center = (list: HTMLDivElement | null, unit: number, step: number) => {
                if (!list) return;
                const itemHeight = 38;
                const index = Math.floor(unit / Math.max(1, step));
                list.scrollTop = index * itemHeight - list.clientHeight / 2 + itemHeight / 2;
            };
            requestAnimationFrame(() => {
                mounted.value = true;
                center(hourListRef.value, part.h, props.hourStep);
                center(minuteListRef.value, part.m, props.minuteStep);
                if (hasSeconds(props.format)) center(secondListRef.value, part.s, props.secondStep);
            });
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            mounted.value = false;
        }
    },
    { flush: 'post', immediate: true }
);

// 打开状态下 format / 步进变化时重新居中
watch(
    [() => props.format, () => props.hourStep, () => props.minuteStep, () => props.secondStep],
    () => {
        if (!open.value) return;
        const part = pending.value ?? { h: 0, m: 0, s: 0 };
        const itemHeight = 38;
        const center = (list: HTMLDivElement | null, unit: number, step: number) => {
            if (!list) return;
            const index = Math.floor(unit / Math.max(1, step));
            list.scrollTop = index * itemHeight - list.clientHeight / 2 + itemHeight / 2;
        };
        center(hourListRef.value, part.h, props.hourStep);
        center(minuteListRef.value, part.m, props.minuteStep);
        if (hasSeconds(props.format)) center(secondListRef.value, part.s, props.secondStep);
    },
    { flush: 'post' }
);

// 点击某列数值：更新待选时间（触发区实时显示）
const pickUnit = (part: TimePart) => {
    pending.value = part;
};

// 此刻：待选时间设为当前时间
const setNow = () => {
    const now = new Date();
    pending.value = { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
};

// 确定：值有变化时提交，随后关闭面板
const confirmTime = () => {
    if (!pending.value) return;
    const next = toValue(pending.value);
    if (next !== currentValue.value) {
        if (!isControlled.value) innerValue.value = next;
        emit('update:modelValue', next);
        emit('change', next);
    }
    closePanel();
    triggerRef.value?.focus();
};

const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    if (!isControlled.value) innerValue.value = null;
    emit('update:modelValue', null);
    emit('change', null);
    triggerRef.value?.focus();
};

const handleTriggerClick = () => {
    if (props.disabled || closing.value) return;
    setOpen(!open.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    const { key } = e;
    if (!open.value) {
        if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
        }
        return;
    }
    if (key === 'Escape') {
        e.preventDefault();
        closePanel();
        triggerRef.value?.focus();
    } else if (key === 'Enter') {
        e.preventDefault();
        confirmTime();
    }
};

const handleBlur = (e: FocusEvent) => {
    // 仅当焦点明确移出 wrapper（如 Tab 到外部元素）时关闭；
    // 点击面板空白区域（relatedTarget 为 null）不关闭，外部点击由 mousedown 监听处理
    if (open.value && e.relatedTarget && !wrapperRef.value?.contains(e.relatedTarget as Node)) {
        closePanel();
    }
};
</script>

<template>
    <div
        ref="wrapperRef"
        class="animal-time-picker"
        :class="[attrs.class, { 'animal-time-picker--disabled': disabled }]"
        :style="attrs.style"
        @keydown="handleKeyDown"
        @blur="handleBlur"
    >
        <div
            ref="triggerRef"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="dialog"
            :aria-controls="open ? panelId : undefined"
            :aria-disabled="disabled || undefined"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledBy"
            :tabindex="disabled ? -1 : 0"
            class="animal-time-picker__trigger"
            :class="[
                `animal-time-picker__trigger--${size}`,
                status ? `animal-time-picker__trigger--${status}` : null,
                { 'animal-time-picker__trigger--open': open },
            ]"
            @click="handleTriggerClick"
        >
            <span class="animal-time-picker__value" :class="{ 'animal-time-picker__value--placeholder': !hasValue }">
                {{ displayText }}
            </span>
            <button
                v-if="allowClear && hasValue && !disabled"
                type="button"
                class="animal-time-picker__clear"
                aria-label="清除时间"
                @click="handleClear"
                @mousedown.prevent
            >
                ×
            </button>
            <span class="animal-time-picker__clock-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4" />
                    <path d="M7 4.2V7l2 1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
            </span>
        </div>
        <div
            v-if="open"
            :id="panelId"
            role="dialog"
            aria-label="选择时间"
            class="animal-time-picker__panel"
            :class="{
                'animal-time-picker__panel--no-seconds': !hasSeconds(format),
                'animal-time-picker__panel--closing': closing,
                'animal-time-picker__panel--visible': mounted,
            }"
            :style="panelStyle"
        >
            <div class="animal-time-picker__columns">
                <div class="animal-time-picker__column">
                    <div class="animal-time-picker__column-title">时</div>
                    <div ref="hourListRef" class="animal-time-picker__column-list">
                        <button
                            v-for="h in hours"
                            :key="h"
                            type="button"
                            class="animal-time-picker__option"
                            :class="{ 'animal-time-picker__option--selected': base.h === h }"
                            :aria-label="`${h} 时`"
                            @click="pickUnit({ ...base, h })"
                            @mousedown.prevent
                        >
                            {{ pad2(h) }}
                        </button>
                    </div>
                </div>
                <div class="animal-time-picker__column">
                    <div class="animal-time-picker__column-title">分</div>
                    <div ref="minuteListRef" class="animal-time-picker__column-list">
                        <button
                            v-for="m in minutes"
                            :key="m"
                            type="button"
                            class="animal-time-picker__option"
                            :class="{ 'animal-time-picker__option--selected': base.m === m }"
                            :aria-label="`${m} 分`"
                            @click="pickUnit({ ...base, m })"
                            @mousedown.prevent
                        >
                            {{ pad2(m) }}
                        </button>
                    </div>
                </div>
                <div v-if="seconds.length > 0" class="animal-time-picker__column">
                    <div class="animal-time-picker__column-title">秒</div>
                    <div ref="secondListRef" class="animal-time-picker__column-list">
                        <button
                            v-for="s in seconds"
                            :key="s"
                            type="button"
                            class="animal-time-picker__option"
                            :class="{ 'animal-time-picker__option--selected': base.s === s }"
                            :aria-label="`${s} 秒`"
                            @click="pickUnit({ ...base, s })"
                            @mousedown.prevent
                        >
                            {{ pad2(s) }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="animal-time-picker__footer">
                <button type="button" class="animal-time-picker__footer-btn" @click="setNow" @mousedown.prevent>
                    此刻
                </button>
                <button type="button" class="animal-time-picker__confirm-btn" @click="confirmTime" @mousedown.prevent>
                    确定
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-time-picker {
    position: relative;
    display: inline-block;
    font-family: @font-family;
    vertical-align: middle;
    user-select: none;
    -webkit-user-select: none;

    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;

        .animal-time-picker__trigger,
        .animal-time-picker__trigger:hover {
            background: #ece8dc;
            box-shadow: none;
            cursor: not-allowed;
        }

        .animal-time-picker__value,
        .animal-time-picker__value--placeholder {
            color: #c4b89e;
        }
    }

    /* 触发区 —— 视觉对齐 Input：奶油底、胶囊圆角、无边框 */
    &__trigger {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 8px;
        background: #fffbe7;
        border-radius: 50px;
        cursor: pointer;
        transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &--small {
            height: 32px;
            padding: 0 14px;
            font-size: 12px;
        }

        &--middle {
            height: 40px;
            padding: 0 18px;
            font-size: 14px;
        }

        &--large {
            height: 48px;
            padding: 0 22px;
            font-size: 16px;
        }

        &:hover {
            box-shadow: 0 3px 0 0 #c4b89e;
        }

        &--open {
            box-shadow:
                0 3px 0 0 #e0b800,
                0 0 0 3px rgba(255, 204, 0, 0.15);
        }

        &--error {
            box-shadow: 0 3px 0 0 #c94444;
        }

        &--warning {
            box-shadow: 0 3px 0 0 #dba90e;
        }
    }

    &__value {
        flex: 1;
        color: #8a7b66;
        font-weight: 500;
        letter-spacing: 0.01em;

        &--placeholder {
            color: #c4b89e;
            font-weight: 400;
        }
    }

    &__clock-icon {
        display: flex;
        align-items: center;
        color: #a0936e;
    }

    &__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-left: 4px;
        border: none;
        background: transparent;
        border-radius: 50%;
        color: #c4b89e;
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            color: #725d42;
            background: rgba(114, 93, 66, 0.1);
        }
    }

    /* 弹出面板 */
    &__panel {
        position: absolute;
        width: 248px;
        padding: 14px 14px 14px;
        background: #fffdf7;
        border: 1.5px solid #e8dcc8;
        border-radius: 20px;
        box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-6px);
        transition:
            opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        /* format 不含 ss 时仅时/分两列，宽度相应收窄 */
        &--no-seconds {
            width: 172px;
        }

        /* 退场动效：与入场同款 0.2s 过渡，动画结束后由 closePanel 卸载面板 */
        &--closing {
            opacity: 0;
            transform: translateY(-6px);
        }

        &--visible {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 时 / 分 / 秒 三列 */
    &__columns {
        display: flex;
        gap: 8px;
    }

    &__column {
        flex: 1;
        min-width: 0;
    }

    &__column-title {
        margin-bottom: 6px;
        text-align: center;
        color: #a09080;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
    }

    &__column-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 232px;
        overflow-y: auto;
        padding: 2px;
    }

    &__option {
        display: flex;
        align-items: center;
        justify-content: center;
        /* 关键：禁止 flex 子项被压缩，否则 max-height 容器会把选项压扁 */
        flex-shrink: 0;
        height: 28px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 16px;
        appearance: none;
        color: #725d42;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: #ffd54f;
            color: #725d42;
        }

        &--selected,
        &--selected:hover {
            background: #ffb400;
            color: #fff;
            font-weight: 700;
        }
    }

    /* 底部：此刻 / 确定 */
    &__footer {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #f0e8d8;
    }

    &__footer-btn {
        padding: 6px 14px;
        border: none;
        background: transparent;
        border-radius: 10px;
        color: #8a7b66;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: rgba(114, 93, 66, 0.1);
            color: #725d42;
        }
    }

    &__confirm-btn {
        padding: 6px 16px;
        border: none;
        background: rgba(114, 93, 66, 0.1);
        border-radius: 12px;
        color: #8a7b66;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: #8a7b66;
            color: #fff;
        }
    }
}
</style>
