<script setup lang="ts">
import { computed, ref, useAttrs, watch, onBeforeUnmount, nextTick, type CSSProperties } from 'vue';
import type { DatePickerProps, DatePickerValue } from './types';
import iconLeft from '../../assets/img/icons/icon-left.svg';
import iconRight from '../../assets/img/icons/icon-right.svg';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DatePickerProps>(), {
    range: false,
    picker: 'date',
    placeholder: '请选择日期',
    disabled: false,
    allowClear: false,
    size: 'middle',
    open: undefined,
    showToday: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: DatePickerValue): void;
    (e: 'change', value: DatePickerValue): void;
    (e: 'update:open', open: boolean): void;
}>();

const attrs = useAttrs();

// ---------------------------------------------------------------------------
// 工具函数（与 React 版保持一致）
// ---------------------------------------------------------------------------

const pad = (n: number) => `${n}`.padStart(2, '0');

/** 将 YYYY-MM-DD 字符串解析为本地时间 Date，非法输入返回 null */
function parseValue(value: string | null | undefined): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(value);
    if (!match || Number(match[2]) > 12) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3] ?? 1));
    return Number.isNaN(date.getTime()) ? null : date;
}

/** 将 Date 序列化为 YYYY-MM-DD */
function toValue(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 将 Date 序列化为 YYYY-MM（月份选择模式的值） */
function toMonthValue(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** 按模板格式化日期，支持 YYYY / MM / DD / M / D 占位符 */
function formatDate(date: Date, format: string) {
    return format
        .replace('YYYY', `${date.getFullYear()}`)
        .replace('MM', pad(date.getMonth() + 1))
        .replace('DD', pad(date.getDate()))
        .replace('M', `${date.getMonth() + 1}`)
        .replace('D', `${date.getDate()}`);
}

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** 解析范围值 [开始, 结束]，任一端非法或非数组均返回 null */
function parseRange(value: DatePickerValue): [Date, Date] | null {
    if (!value || typeof value === 'string') return null;
    const start = parseValue(value[0]);
    const end = parseValue(value[1]);
    return start && end ? [start, end] : null;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

/** 关闭退场动画时长，与 .panel 的 0.2s 过渡保持一致，动画结束后再卸载面板 */
const CLOSE_ANIMATION_MS = 200;

// ---------------------------------------------------------------------------
// 状态
// ---------------------------------------------------------------------------

const innerValue = ref<DatePickerValue>(props.defaultValue ?? null);
const innerOpen = ref(false);
const initialView = parseValue(typeof props.defaultValue === 'string' ? props.defaultValue : null) ?? new Date();
const viewDate = ref<Date>(initialView);
const mode = ref<'date' | 'month' | 'year'>('date');
const focusedDate = ref<Date>(initialView);
const rangeStart = ref<Date | null>(null);
const rangeEnd = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);
/** 单日期模式待选日期（点选后尚未确认） */
const pendingDate = ref<Date | null>(null);
const panelStyle = ref<CSSProperties>({});
const mounted = ref(false);
const closing = ref(false);

let closeTimer: number | null = null;

const wrapperRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);

const idBase = `animal-date-picker-${Math.random().toString(36).slice(2, 10)}`;
const panelId = `${idBase}-panel`;

// ---------------------------------------------------------------------------
// 派生值
// ---------------------------------------------------------------------------

const isControlled = computed(() => props.modelValue !== undefined);

const currentValue = computed<DatePickerValue>(() =>
    isControlled.value ? (props.modelValue ?? null) : innerValue.value
);

const selectedDate = computed<Date | null>(() =>
    props.range ? null : parseValue(typeof currentValue.value === 'string' ? currentValue.value : null)
);

const selectedRange = computed<[Date, Date] | null>(() =>
    props.range ? parseRange(currentValue.value) : null
);

const open = computed(() => (props.open !== undefined ? props.open : innerOpen.value));

/** 展示格式：picker='month' 时默认 YYYY-MM，否则 YYYY-MM-DD */
const format = computed(() => props.format ?? (props.picker === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'));

const today = new Date();

const rangePanelDates = computed(() => [
    viewDate.value,
    new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1),
]);

const startYear = computed(() => Math.floor(viewDate.value.getFullYear() / 10) * 10);
const yearCells = computed(() => Array.from({ length: 12 }, (_, i) => startYear.value - 1 + i));

// ---------------------------------------------------------------------------
// 展开 / 关闭
// ---------------------------------------------------------------------------

function setOpen(next: boolean) {
    if (props.open === undefined) innerOpen.value = next;
    emit('update:open', next);
}

/** 统一关闭入口：先播放退场动效，动画结束后再卸载面板 */
function closePanel() {
    if (closeTimer !== null) return;
    closing.value = true;
    closeTimer = window.setTimeout(() => {
        closeTimer = null;
        closing.value = false;
        setOpen(false);
        mounted.value = false;
        resetSelection();
    }, CLOSE_ANIMATION_MS);
}

function handleClickOutside(e: MouseEvent) {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
        closePanel();
    }
}

function positionPanel() {
    const el = wrapperRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const panelHeight = 340;
    const newStyle: CSSProperties = { position: 'absolute', left: '0px' };
    if (rect.bottom + panelHeight > viewportHeight && rect.top > viewportHeight - rect.bottom) {
        newStyle.bottom = '100%';
        newStyle.marginBottom = '6px';
    } else {
        newStyle.top = '100%';
        newStyle.marginTop = '6px';
    }
    // 右侧空间不足时右对齐
    if (rect.left + (props.range ? 620 : 300) > window.innerWidth) {
        newStyle.right = '0px';
        newStyle.left = 'auto';
    }
    panelStyle.value = newStyle;
}

// 每次展开时重置面板视图到当前选中值（无选中则回到今天），并做定位/外部点击监听
watch(open, async (isOpen) => {
    if (isOpen) {
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
        closing.value = false;
        syncViewToValue();
        resetSelection();

        document.addEventListener('mousedown', handleClickOutside);
        positionPanel();
        await nextTick();
        requestAnimationFrame(() => {
            mounted.value = true;
        });
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
        mounted.value = false;
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    if (closeTimer !== null) window.clearTimeout(closeTimer);
});

// ---------------------------------------------------------------------------
// 交互
// ---------------------------------------------------------------------------

function handleTriggerClick() {
    if (props.disabled || closing.value) return;
    setOpen(!open.value);
}

/** 点选日期：仅更新待选值，点击「确定」后才提交并关闭 */
function selectDate(date: Date) {
    if (props.disabledDate?.(date)) return;
    if (!props.range) {
        pendingDate.value = date;
        return;
    }
    // 范围模式：
    // - 尚无起点：以该日期作为开始日期
    // - 已有完整范围（起点+终点）：点击任意日期重新开始选择（以该日期为新起点）
    // - 选择中：点击晚于起点设为结束；早于起点则替换起点
    if (rangeStart.value && rangeEnd.value) {
        rangeStart.value = date;
        rangeEnd.value = null;
        return;
    }
    if (!rangeStart.value) {
        rangeStart.value = date;
        return;
    }
    if (date < rangeStart.value) {
        // 第二次点击早于开始日期：以它作为新的开始日期
        rangeStart.value = date;
        return;
    }
    rangeEnd.value = date;
}

function handleClear(e: MouseEvent) {
    e.stopPropagation();
    if (!isControlled.value) innerValue.value = null;
    emit('update:modelValue', null);
    emit('change', null);
    triggerRef.value?.focus();
}

/** 清空进行中的选择状态（范围模式 rangeStart/rangeEnd/hoverDate；单日期 pendingDate） */
function resetSelection() {
    rangeStart.value = null;
    rangeEnd.value = null;
    hoverDate.value = null;
    pendingDate.value = null;
}

/** 把面板视图定位到当前选中值（无选中则回到今天）；range 模式双面板从起点月份展开 */
function syncViewToValue() {
    const base = props.range
        ? (parseRange(currentValue.value)?.[0] ?? new Date())
        : (parseValue(typeof currentValue.value === 'string' ? currentValue.value : null) ?? new Date());
    viewDate.value = base;
    focusedDate.value = base;
    mode.value = props.picker === 'month' && !props.range ? 'month' : 'date';
}

function shiftView(yearDelta: number, monthDelta = 0) {
    viewDate.value = new Date(viewDate.value.getFullYear() + yearDelta, viewDate.value.getMonth() + monthDelta, 1);
}

function handleToday() {
    const now = new Date();
    if (!props.range) {
        // 单日期模式：跳转到今天所在月份，并把今天设为待选日期
        viewDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
        focusedDate.value = now;
        mode.value = props.picker === 'month' ? 'month' : 'date';
        pendingDate.value = now;
        return;
    }
    // 范围模式：「今天」仅负责把视图跳转到今天所在月份，并清空进行中的选择
    viewDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
    focusedDate.value = now;
    resetSelection();
}

/** 确定：提交待选值并关闭面板；无待选值（或范围不完整）时仅关闭 */
function confirmTime() {
    if (!props.range) {
        if (pendingDate.value) {
            const next: string =
                props.picker === 'month' ? toMonthValue(pendingDate.value) : toValue(pendingDate.value);
            if (!isControlled.value) innerValue.value = next;
            emit('update:modelValue', next);
            emit('change', next);
        }
        closePanel();
        triggerRef.value?.focus();
        return;
    }
    if (rangeStart.value && rangeEnd.value) {
        const start = rangeStart.value;
        const end = rangeEnd.value;
        const next: [string, string] = [toValue(start), toValue(end)];
        if (!isControlled.value) innerValue.value = next;
        emit('update:modelValue', next);
        emit('change', next);
        resetSelection();
        viewDate.value = start;
    }
    closePanel();
    triggerRef.value?.focus();
}

function handleKeyDown(e: KeyboardEvent) {
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
        return;
    }
    if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        if (mode.value === 'date') {
            if (props.disabledDate?.(focusedDate.value)) return;
            if (props.range) {
                // 范围模式：回车依次确定开始日期与结束日期（待选）
                if (rangeStart.value && rangeEnd.value) {
                    // 已有完整范围：重新开始选择（以焦点日期为新起点）
                    rangeStart.value = focusedDate.value;
                    rangeEnd.value = null;
                } else if (!rangeStart.value) {
                    rangeStart.value = focusedDate.value;
                } else if (focusedDate.value < rangeStart.value) {
                    rangeStart.value = focusedDate.value;
                } else {
                    rangeEnd.value = focusedDate.value;
                }
                return;
            }
            pendingDate.value = focusedDate.value;
        } else if (mode.value === 'month') {
            if (props.picker === 'month' && !props.range) {
                // 月份选择模式：回车设为待选月份
                pendingDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
            } else {
                viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
                focusedDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
                mode.value = 'date';
            }
        } else {
            focusedDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
            mode.value = 'month';
        }
        return;
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault();
        const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -7 : 7;
        if (mode.value === 'date') {
            const next = new Date(
                focusedDate.value.getFullYear(),
                focusedDate.value.getMonth(),
                focusedDate.value.getDate() + delta
            );
            focusedDate.value = next;
            if (!isSameMonth(next, viewDate.value)) viewDate.value = new Date(next.getFullYear(), next.getMonth(), 1);
        } else if (mode.value === 'month') {
            const next = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + delta, 1);
            viewDate.value = next;
            focusedDate.value = next;
        } else {
            const next = new Date(viewDate.value.getFullYear() + delta, viewDate.value.getMonth(), 1);
            viewDate.value = next;
            focusedDate.value = next;
        }
        return;
    }
    if (key === 'PageUp' || key === 'PageDown') {
        e.preventDefault();
        const delta = key === 'PageUp' ? -1 : 1;
        if (mode.value === 'date') {
            const next = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + delta, 1);
            viewDate.value = next;
            focusedDate.value = new Date(next.getFullYear(), next.getMonth(), focusedDate.value.getDate());
        } else if (mode.value === 'month') {
            const next = new Date(viewDate.value.getFullYear() + delta, viewDate.value.getMonth(), 1);
            viewDate.value = next;
            focusedDate.value = next;
        } else {
            const next = new Date(viewDate.value.getFullYear() + delta * 10, viewDate.value.getMonth(), 1);
            viewDate.value = next;
            focusedDate.value = next;
        }
    }
}

function handleBlur(e: FocusEvent) {
    // 仅当焦点明确移出 wrapper（如 Tab 到外部元素）时关闭；
    // 点击面板空白区域（relatedTarget 为 null）不关闭，外部点击由 mousedown 监听处理
    if (open.value && e.relatedTarget && wrapperRef.value && !wrapperRef.value.contains(e.relatedTarget as Node)) {
        closePanel();
    }
}

// ---------------------------------------------------------------------------
// 日历网格
// ---------------------------------------------------------------------------

/** 构建日期网格：固定 6 行 × 7 列，首尾补齐上/下月日期 */
function buildCells(vDate: Date): Date[] {
    const vYear = vDate.getFullYear();
    const vMonth = vDate.getMonth();
    const cells: Date[] = [];
    const startWeekday = new Date(vYear, vMonth, 1).getDay();
    const daysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(vYear, vMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) cells.push(new Date(vYear, vMonth - 1, daysInPrevMonth - i));
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(vYear, vMonth, d));
    for (let d = 1; cells.length < 42; d++) cells.push(new Date(vYear, vMonth + 1, d));
    return cells;
}

function getDayCellState(cell: Date, vDate: Date) {
    const disabledCell = props.disabledDate?.(cell) === true;
    const isToday = isSameDay(cell, today);
    const outside = cell.getMonth() !== vDate.getMonth();
    let selected = false;
    let rangeStartCell = false;
    let rangeEndCell = false;
    let inRange = false;
    if (props.range) {
        // 有效范围端点：进行中的选择（预览）优先于已选范围
        let effStart: Date | null = null;
        let effEnd: Date | null = null;
        if (rangeStart.value) {
            if (rangeEnd.value) {
                // 已选定开始与结束：以待选范围高亮
                effStart = rangeStart.value;
                effEnd = rangeEnd.value;
            } else if (hoverDate.value && hoverDate.value < rangeStart.value) {
                // 反向预览：悬停日期作为新的潜在起点
                effStart = hoverDate.value;
                effEnd = rangeStart.value;
            } else {
                effStart = rangeStart.value;
                effEnd = hoverDate.value && hoverDate.value > rangeStart.value ? hoverDate.value : rangeStart.value;
            }
        } else if (selectedRange.value) {
            effStart = selectedRange.value[0];
            effEnd = selectedRange.value[1];
        }
        if (effStart && effEnd) {
            rangeStartCell = isSameDay(cell, effStart);
            rangeEndCell = isSameDay(cell, effEnd);
            inRange = cell > effStart && cell < effEnd;
        }
    } else {
        const activeDate = pendingDate.value ?? selectedDate.value;
        selected = !!activeDate && isSameDay(cell, activeDate);
    }
    return { disabledCell, isToday, outside, selected, rangeStartCell, rangeEndCell, inRange };
}

function dayCellClasses(cell: Date, vDate: Date): string[] {
    const st = getDayCellState(cell, vDate);
    return [
        st.outside && 'animal-date-picker__day-cell--outside',
        !props.range && st.isToday && 'animal-date-picker__day-cell--today',
        st.selected && 'animal-date-picker__day-cell--selected',
        st.rangeStartCell && 'animal-date-picker__day-cell--range-start',
        st.rangeEndCell && 'animal-date-picker__day-cell--range-end',
        st.inRange && 'animal-date-picker__day-cell--in-range',
        st.disabledCell && 'animal-date-picker__day-cell--disabled',
    ].filter(Boolean) as string[];
}

function isDayDisabled(cell: Date) {
    return props.disabledDate?.(cell) === true;
}

function onCellClick(cell: Date) {
    selectDate(cell);
}

function onCellMouseEnter(cell: Date) {
    if (props.range) hoverDate.value = cell;
}

function onCellMouseLeave() {
    if (props.range) hoverDate.value = null;
}

function isMonthSelected(i: number) {
    const activeDate = pendingDate.value ?? selectedDate.value;
    return !!activeDate && activeDate.getFullYear() === viewDate.value.getFullYear() && activeDate.getMonth() === i;
}

function onMonthClick(i: number) {
    if (props.picker === 'month' && !props.range) {
        // 月份选择模式：点击即设为待选月份
        pendingDate.value = new Date(viewDate.value.getFullYear(), i, 1);
    } else {
        viewDate.value = new Date(viewDate.value.getFullYear(), i, 1);
        focusedDate.value = new Date(viewDate.value.getFullYear(), i, 1);
        mode.value = 'date';
    }
}

function onYearClick(y: number) {
    viewDate.value = new Date(y, viewDate.value.getMonth(), 1);
    focusedDate.value = new Date(y, viewDate.value.getMonth(), 1);
    mode.value = 'month';
}
</script>

<template>
    <div
        ref="wrapperRef"
        class="animal-date-picker"
        :class="[attrs.class, { 'animal-date-picker--disabled': disabled }]"
        :style="attrs.style"
        @keydown="handleKeyDown"
        @blur="handleBlur"
    >
        <div
            ref="triggerRef"
            class="animal-date-picker__trigger"
            :class="[
                `animal-date-picker__trigger--${size}`,
                status ? `animal-date-picker__trigger--${status}` : '',
                { 'animal-date-picker__trigger--open': open },
            ]"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="dialog"
            :aria-controls="open ? panelId : undefined"
            :aria-disabled="disabled || undefined"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledBy"
            :tabindex="disabled ? -1 : 0"
            @click="handleTriggerClick"
        >
            <!-- 范围模式触发区：开始 | 结束 -->
            <template v-if="range">
                <template v-if="open && rangeStart">
                    <span class="animal-date-picker__value">{{ formatDate(rangeStart, format) }}</span>
                    <span class="animal-date-picker__range-divider" aria-hidden="true" />
                    <span :class="rangeEnd ? 'animal-date-picker__value' : 'animal-date-picker__placeholder'">
                        {{ rangeEnd ? formatDate(rangeEnd, format) : placeholder }}
                    </span>
                </template>
                <template v-else-if="selectedRange">
                    <span class="animal-date-picker__value">{{ formatDate(selectedRange[0], format) }}</span>
                    <span class="animal-date-picker__range-divider" aria-hidden="true" />
                    <span class="animal-date-picker__value">{{ formatDate(selectedRange[1], format) }}</span>
                </template>
                <span v-else class="animal-date-picker__placeholder">{{ placeholder }}</span>
            </template>
            <!-- 单日期触发区 -->
            <span
                v-else
                :class="currentValue || (open && pendingDate) ? 'animal-date-picker__value' : 'animal-date-picker__placeholder'"
            >
                {{
                    open && pendingDate
                        ? formatDate(pendingDate, format)
                        : selectedDate
                          ? formatDate(selectedDate, format)
                          : placeholder
                }}
            </span>

            <button
                v-if="allowClear && currentValue && !disabled"
                type="button"
                class="animal-date-picker__clear"
                aria-label="清除日期"
                @click="handleClear"
                @mousedown.prevent
            >
                ×
            </button>
            <span class="animal-date-picker__calendar-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" stroke-width="1.4" />
                    <path d="M1.5 5.5h11" stroke="currentColor" stroke-width="1.4" />
                    <path d="M4.7 1v2.4M9.3 1v2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
            </span>
        </div>

        <!-- 弹出面板 -->
        <div
            v-if="open"
            :id="panelId"
            role="dialog"
            :aria-label="range ? '选择日期范围' : '选择日期'"
            class="animal-date-picker__panel"
            :class="{
                'animal-date-picker__panel--range': range,
                'animal-date-picker__panel--visible': mounted,
                'animal-date-picker__panel--closing': closing,
            }"
            :style="panelStyle"
        >
            <!-- 范围模式：左右双面板 -->
            <template v-if="range">
                <div class="animal-date-picker__range-panels">
                    <div
                        v-for="(panelDate, idx) in rangePanelDates"
                        :key="panelDate.getTime()"
                        class="animal-date-picker__range-panel"
                    >
                        <div class="animal-date-picker__header">
                            <div class="animal-date-picker__header-group">
                                <button
                                    v-if="idx === 0"
                                    type="button"
                                    class="animal-date-picker__nav-btn"
                                    aria-label="上一年"
                                    @click="shiftView(-1, 0)"
                                    @mousedown.prevent
                                >
                                    <img :src="iconLeft" class="animal-date-picker__nav-icon" alt="" />
                                </button>
                                <button
                                    v-if="idx === 0"
                                    type="button"
                                    class="animal-date-picker__nav-btn"
                                    aria-label="上个月"
                                    @click="shiftView(0, -1)"
                                    @mousedown.prevent
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                        <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                            <span class="animal-date-picker__year-label">
                                {{ panelDate.getFullYear() }}年{{ panelDate.getMonth() + 1 }}月
                            </span>
                            <div class="animal-date-picker__header-group">
                                <button
                                    v-if="idx === 1"
                                    type="button"
                                    class="animal-date-picker__nav-btn"
                                    aria-label="下个月"
                                    @click="shiftView(0, 1)"
                                    @mousedown.prevent
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                        <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    v-if="idx === 1"
                                    type="button"
                                    class="animal-date-picker__nav-btn"
                                    aria-label="下一年"
                                    @click="shiftView(1, 0)"
                                    @mousedown.prevent
                                >
                                    <img :src="iconRight" class="animal-date-picker__nav-icon" alt="" />
                                </button>
                            </div>
                        </div>
                        <div class="animal-date-picker__week-row">
                            <div v-for="w in WEEKDAYS" :key="w" class="animal-date-picker__week-cell">{{ w }}</div>
                        </div>
                        <div class="animal-date-picker__grid">
                            <button
                                v-for="cell in buildCells(panelDate)"
                                :key="cell.getTime()"
                                type="button"
                                class="animal-date-picker__day-cell"
                                :class="dayCellClasses(cell, panelDate)"
                                :aria-label="`${cell.getFullYear()}年${cell.getMonth() + 1}月${cell.getDate()}日`"
                                :aria-disabled="isDayDisabled(cell) || undefined"
                                :disabled="isDayDisabled(cell)"
                                @click="onCellClick(cell)"
                                @mouseenter="onCellMouseEnter(cell)"
                                @mouseleave="onCellMouseLeave"
                                @mousedown.prevent
                            >
                                {{ cell.getDate() }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="animal-date-picker__footer">
                    <button
                        type="button"
                        class="animal-date-picker__confirm-btn"
                        @click="confirmTime"
                        @mousedown.prevent
                    >
                        确定
                    </button>
                </div>
            </template>

            <!-- 单面板模式 -->
            <template v-else>
                <div class="animal-date-picker__header">
                    <div class="animal-date-picker__header-group">
                        <button
                            type="button"
                            class="animal-date-picker__nav-btn"
                            aria-label="上一年"
                            @click="mode === 'year' ? shiftView(-10, 0) : shiftView(-1, 0)"
                            @mousedown.prevent
                        >
                            <img :src="iconLeft" class="animal-date-picker__nav-icon" alt="" />
                        </button>
                        <button
                            v-if="mode === 'date'"
                            type="button"
                            class="animal-date-picker__nav-btn"
                            aria-label="上个月"
                            @click="shiftView(0, -1)"
                            @mousedown.prevent
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <button
                        v-if="mode === 'date'"
                        type="button"
                        class="animal-date-picker__label-btn"
                        @click="mode = 'year'"
                    >
                        {{ viewDate.getFullYear() }}年{{ viewDate.getMonth() + 1 }}月
                    </button>
                    <button
                        v-else-if="mode === 'month'"
                        type="button"
                        class="animal-date-picker__label-btn"
                        @click="mode = 'year'"
                    >
                        {{ viewDate.getFullYear() }}年
                    </button>
                    <span v-else class="animal-date-picker__year-label">{{ startYear }} - {{ startYear + 9 }}年</span>
                    <div class="animal-date-picker__header-group">
                        <button
                            v-if="mode === 'date'"
                            type="button"
                            class="animal-date-picker__nav-btn"
                            aria-label="下个月"
                            @click="shiftView(0, 1)"
                            @mousedown.prevent
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="animal-date-picker__nav-btn"
                            aria-label="下一年"
                            @click="mode === 'year' ? shiftView(10, 0) : shiftView(1, 0)"
                            @mousedown.prevent
                        >
                            <img :src="iconRight" class="animal-date-picker__nav-icon" alt="" />
                        </button>
                    </div>
                </div>

                <!-- 日期网格 -->
                <template v-if="mode === 'date'">
                    <div class="animal-date-picker__week-row">
                        <div v-for="w in WEEKDAYS" :key="w" class="animal-date-picker__week-cell">{{ w }}</div>
                    </div>
                    <div class="animal-date-picker__grid">
                        <button
                            v-for="cell in buildCells(viewDate)"
                            :key="cell.getTime()"
                            type="button"
                            class="animal-date-picker__day-cell"
                            :class="dayCellClasses(cell, viewDate)"
                            :aria-label="`${cell.getFullYear()}年${cell.getMonth() + 1}月${cell.getDate()}日`"
                            :aria-disabled="isDayDisabled(cell) || undefined"
                            :disabled="isDayDisabled(cell)"
                            @click="onCellClick(cell)"
                            @mouseenter="onCellMouseEnter(cell)"
                            @mouseleave="onCellMouseLeave"
                            @mousedown.prevent
                        >
                            {{ cell.getDate() }}
                        </button>
                    </div>
                </template>

                <!-- 月份网格 -->
                <template v-else-if="mode === 'month'">
                    <div class="animal-date-picker__grid-3x4">
                        <button
                            v-for="(label, i) in MONTHS"
                            :key="label"
                            type="button"
                            class="animal-date-picker__month-cell"
                            :class="{ 'animal-date-picker__month-cell--selected': isMonthSelected(i) }"
                            :aria-label="`${i + 1}月`"
                            @click="onMonthClick(i)"
                            @mousedown.prevent
                        >
                            {{ label }}
                        </button>
                    </div>
                </template>

                <!-- 年份网格 -->
                <template v-else>
                    <div class="animal-date-picker__grid-3x4">
                        <button
                            v-for="y in yearCells"
                            :key="y"
                            type="button"
                            class="animal-date-picker__year-cell"
                            :class="{
                                'animal-date-picker__year-cell--selected': !!selectedDate && selectedDate.getFullYear() === y,
                            }"
                            :aria-label="`${y}年`"
                            @click="onYearClick(y)"
                            @mousedown.prevent
                        >
                            {{ y }}
                        </button>
                    </div>
                </template>

                <div
                    v-if="mode === 'date' || (picker === 'month' && mode === 'month')"
                    class="animal-date-picker__footer"
                >
                    <button
                        v-if="showToday"
                        type="button"
                        class="animal-date-picker__today-btn"
                        @click="handleToday"
                        @mousedown.prevent
                    >
                        今天
                    </button>
                    <button
                        type="button"
                        class="animal-date-picker__confirm-btn"
                        @click="confirmTime"
                        @mousedown.prevent
                    >
                        确定
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-date-picker {
    position: relative;
    display: inline-block;
    font-family: @font-family;
    vertical-align: middle;
    user-select: none;
    -webkit-user-select: none;

    // ---------- Disabled ----------
    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;

        .animal-date-picker__trigger,
        .animal-date-picker__trigger:hover {
            background: #ece8dc;
            box-shadow: none;
            cursor: not-allowed;
        }

        .animal-date-picker__value,
        .animal-date-picker__placeholder {
            color: #c4b89e;
        }
    }

    // ---------- Trigger ----------
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
    }

    &__placeholder {
        flex: 1;
        color: #c4b89e;
        font-weight: 400;
    }

    &__range-divider {
        width: 1px;
        height: 16px;
        margin: 0 2px;
        background: #e8dcc8;
        flex-shrink: 0;
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

    &__calendar-icon {
        display: flex;
        align-items: center;
        color: #a0936e;
    }

    // ---------- Panel ----------
    &__panel {
        position: absolute;
        width: 280px;
        padding: 14px;
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

        &--visible {
            opacity: 1;
            transform: translateY(0);
        }

        &--closing {
            opacity: 0;
            transform: translateY(-6px);
        }

        &--range {
            width: 600px;
        }
    }

    &__range-panels {
        display: flex;
        gap: 12px;
    }

    &__range-panel {
        width: 280px;
    }

    // ---------- Header ----------
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    &__header-group {
        display: flex;
        gap: 2px;
    }

    &__nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border: none;
        background: transparent;
        border-radius: 8px;
        color: #a0936e;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: rgba(114, 93, 66, 0.1);
        }
    }

    &__nav-icon {
        width: 16px;
        height: auto;
        display: block;
    }

    &__label-btn {
        padding: 4px 10px;
        border: none;
        background: transparent;
        border-radius: 10px;
        color: #725d42;
        font-family: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: #e6f9f6;
            color: #19c8b9;
        }
    }

    &__year-label {
        padding: 4px 10px;
        color: #725d42;
        font-size: 14px;
        font-weight: 700;
    }

    // ---------- Week row ----------
    &__week-row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 4px;
    }

    &__week-cell {
        height: 24px;
        line-height: 24px;
        text-align: center;
        color: #a09080;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
    }

    // ---------- Day grid ----------
    &__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }

    &__day-cell {
        width: 32px;
        height: 32px;
        justify-self: center;
        border: none;
        background: transparent;
        border-radius: 50%;
        color: #725d42;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: #e6f9f6;
            color: #19c8b9;
        }

        &--outside {
            color: #c4b89e;
            font-weight: 400;
        }

        &--today {
            box-shadow: inset 0 0 0 1.5px #19c8b9;
            color: #19c8b9;
            font-weight: 700;
        }

        &--selected,
        &--selected:hover {
            background: #19c8b9;
            color: #fff;
            font-weight: 700;
        }

        &--selected:hover {
            background: #3dd4c6;
        }

        &--in-range,
        &--in-range:hover {
            background: #ffc107;
            border-radius: 50%;
            color: #fff;
            font-weight: 600;
        }

        &--in-range:hover {
            background: #e5a200;
        }

        &--range-start,
        &--range-end,
        &--range-start:hover,
        &--range-end:hover {
            background: #ffc107;
            border: 1px solid #fff;
            border-radius: 50%;
            color: #fff;
            font-weight: 700;
        }

        &--range-start:hover,
        &--range-end:hover {
            background: #ffb400;
        }

        &--disabled,
        &--disabled:hover {
            background: transparent;
            color: #d4c9b4;
            cursor: not-allowed;
        }
    }

    // 范围模式：日期 hover 与选中同色系（琥珀色系）
    &__panel--range &__day-cell:hover {
        background: #ffd54f;
        color: #725d42;
    }

    // ---------- Month / Year grid ----------
    &__grid-3x4 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
    }

    &__month-cell,
    &__year-cell {
        height: 36px;
        border: none;
        background: transparent;
        border-radius: 12px;
        color: #725d42;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
            background: #e6f9f6;
            color: #19c8b9;
        }

        &--selected,
        &--selected:hover {
            background: #19c8b9;
            color: #fff;
            font-weight: 700;
        }

        &--selected:hover {
            background: #3dd4c6;
        }
    }

    // ---------- Footer ----------
    &__footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #f0e8d8;
    }

    &__today-btn {
        padding: 4px 12px;
        border: none;
        background: transparent;
        border-radius: 10px;
        color: #8a7b66;
        font-family: inherit;
        font-size: 13px;
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
            background: #796c5a;
            color: #fff;
        }
    }
}
</style>
