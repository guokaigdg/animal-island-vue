<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { CalendarIcon } from '../Icon';
import type { CalendarEvent, CalendarEventTitle, CalendarProps } from './types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CalendarProps>(), {
    events: () => [],
    showEventTime: true,
    draggableEvents: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
    (e: 'update:panelValue', month: string): void;
    (e: 'panelChange', month: string): void;
    (e: 'eventCreate', start: string, end: string): void;
}>();

const attrs = useAttrs();

// ---------------------------------------------------------------------------
// 日期工具（本包不依赖任何日期库，全部走原生 Date）
// ---------------------------------------------------------------------------

const pad = (n: number) => `${n}`.padStart(2, '0');

const DAY_MS = 86400000;

/**
 * 解析 YYYY-MM-DD / YYYY-MM-DD HH:mm 字符串，非法输入返回 null。
 * 末尾的回环校验是对齐 dayjs 的 invalid 语义：原生 Date 会把 2 月 31 日顺延到 3 月 3 日，
 * 这里必须当成坏数据，否则会静默排到错误的格子里。
 */
function parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2}))?/.exec(value);
    if (!match) return null;
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1) return null;
    const date = new Date(Number(match[1]), month - 1, day, Number(match[4] ?? 0), Number(match[5] ?? 0));
    if (Number.isNaN(date.getTime()) || date.getDate() !== day) return null;
    return date;
}

/** YYYY-MM / YYYY-M 这类只到月份的输入，补成当月 1 日 */
function parseMonthValue(value: string | null | undefined): Date | null {
    if (!value) return null;
    return /^\d{4}-\d{1,2}$/.test(value) ? parseDate(`${value}-01`) : parseDate(value);
}

function toDateKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toMonthKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** 以「自然日」为单位做差，避免夏令时切换当天算出 23/25 小时的偏移 */
function dayDiff(a: Date, b: Date) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ua - ub) / DAY_MS);
}

function isBeforeDay(a: Date, b: Date) {
    return dayDiff(a, b) < 0;
}

function isSameDay(a: Date, b: Date) {
    return dayDiff(a, b) === 0;
}

function isSameMonth(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addDays(date: Date, delta: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

function daysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** 视图起点：本月 1 日所在周的周日 */
function gridStartOf(month: Date) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    return addDays(first, -first.getDay());
}

/** 日期在 42 格网格中的下标，早于视图或超出视图时夹取到边界 */
function cellIndexOf(date: Date, gridStart: Date) {
    return Math.min(GRID_CELLS - 1, Math.max(0, dayDiff(date, gridStart)));
}

/** 事项是否与 42 格视图（含上下月补位）相交：早于视图起点或晚于视图终点则不可见 */
function isEventVisibleInGrid(start: Date, end: Date, gridStart: Date) {
    const last = isBeforeDay(end, start) ? start : end;
    return !isBeforeDay(last, gridStart) && isBeforeDay(start, addDays(gridStart, GRID_CELLS));
}

/**
 * 把日期夹取到 42 格网格内。光标落在网格外时 42 格会全部 tabindex=-1，键盘用户 Tab 进日历后无处可停。
 */
function clampToGrid(date: Date, gridStart: Date) {
    if (isBeforeDay(date, gridStart)) return gridStart;
    const last = addDays(gridStart, GRID_CELLS - 1);
    return dayDiff(date, last) > 0 ? last : date;
}

/** 事项标题抽成可读文本供 aria-label 用；数字标题（如 0）也不能按 falsy 当空值丢掉 */
function textOf(title: CalendarEventTitle | undefined): string {
    return title === undefined || title === null ? '' : `${title}`;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/** 日期网格固定补满 6 周 × 7 天 */
const GRID_CELLS = 42;
const COLS = 7;
/** 日期网格的行数（6 周） */
const CELL_ROWS = GRID_CELLS / COLS;
/*
 * 布局基准：面板宽度 750px 时的度量，与本文件底部 <style> 里的同名常量一一对应。
 * 组件按自身宽度算出缩放系数，事项条的纵向位置就是「基准值 × 系数」；CSS 那边用同一系数
 * 推导行高。单元格高度必须容得下「日期数字带 + 2 条事项行」，按下面的常量即
 *   numberBand 42 + eventRow 22 × 2 = 86 ≤ cellHeight 104
 * 所以 2 条事项行整体落在单元格内，不会压到下一周的日期数字。
 * 改这里的取值时同步 <style>，两边的算式都写死常量值，不要再手写别的基准。
 */
const LAYOUT_BASE = {
    /** 基准面板宽度 */
    width: 750,
    /** 星期表头高度 */
    header: 32,
    /** 单元格高度 */
    cellHeight: 104,
    /** 单元格内「日期圆 + 上下留白」占用的高度，事项条从它下方开始排 */
    numberBand: 42,
    /** 单条事项行的高度 */
    eventRow: 22,
};

/** 缩放系数的上下限，避免极窄或极宽容器把面板拉变形 */
const MIN_SCALE = 0.6;
const MAX_SCALE = 2;
/** 每个单元格最多平铺 2 条事项，多出的折叠成 +N */
const MAX_EVENT_ROWS = 2;

// ---------------------------------------------------------------------------
// 事项布局
// ---------------------------------------------------------------------------

/** 一段跨天事项在某一周里的可见片段：所在格子、跨列数、事项行 */
interface EventSegment {
    event: CalendarEvent;
    /** 片段起点在网格中的线性下标 */
    index: number;
    /** 片段终点在网格中的线性下标（同一周内，保证跨列数不超过 7） */
    endIndex: number;
    /** 是否为跨周后的续接片段（时间只在本周内的首片展示一次） */
    continuation: boolean;
    /** 片段占用的列数 */
    span: number;
    /** 第几行事项（0..MAX_EVENT_ROWS-1） */
    row: number;
}

/**
 * 把事项映射到网格：跨天事项按自然日逐格铺开，并按周切成不超过 7 列的片段；
 * 同一天多条则依次占用事项行。结果与视图月份无关，因此拖拽预览（临时事项）也能复用同一套布局。
 *
 * nonCountingEvent 让某条事项占位但不计入 +N：拖拽预览条是临时态，计入就会在拖拽经过时凭空冒出徽标。
 */
function layoutEvents(
    events: CalendarEvent[],
    gridStart: Date,
    today: Date,
    nonCountingEvent?: CalendarEvent | null
): EventSegment[] {
    const segments: EventSegment[] = [];
    const counts = new Array<number>(GRID_CELLS).fill(0);
    const rows = Array.from({ length: GRID_CELLS }, () => new Array<boolean>(MAX_EVENT_ROWS).fill(false));

    const sorted = [...events]
        .map((event) => {
            const start = parseDate(event.start) ?? today;
            return { event, start, end: parseDate(event.end) ?? start };
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    for (const { event, start, end } of sorted) {
        const last = isBeforeDay(end, start) ? start : end;
        const from = cellIndexOf(start, gridStart);
        const to = cellIndexOf(last, gridStart);

        // 完全落在 42 格视图（上下月补位）之外的事项不参与计数与渲染
        if (!isEventVisibleInGrid(start, last, gridStart)) continue;

        if (event !== nonCountingEvent) {
            for (let i = from; i <= to; i += 1) counts[i] += 1;
        }

        for (let row = 0; row < CELL_ROWS; row += 1) {
            const rowStart = row * COLS;
            const rowEnd = rowStart + COLS - 1;
            if (to < rowStart || from > rowEnd) continue;
            // 按周切断：片段左右两端都不能越过所在行的边界
            const segFrom = Math.max(from, rowStart);
            const segTo = Math.min(to, rowEnd);
            const span = segTo - segFrom + 1;

            // 从第一行开始找一段连续空闲的格子，放不下则整个片段折叠进 +N
            let placed = -1;
            for (let r = 0; r < MAX_EVENT_ROWS; r += 1) {
                let free = true;
                for (let i = segFrom; i <= segTo; i += 1) {
                    if (rows[i][r]) {
                        free = false;
                        break;
                    }
                }
                if (free) {
                    placed = r;
                    break;
                }
            }
            if (placed < 0) continue;

            for (let i = segFrom; i <= segTo; i += 1) rows[i][placed] = true;
            segments.push({
                event,
                index: segFrom,
                endIndex: segTo,
                // 首片就是事项本身的起始格时才算首段：跨周续接段与「早于视图」的截断段都不重复展示时间
                continuation: !isSameDay(start, addDays(gridStart, segFrom)),
                span,
                row: placed,
            });
        }
    }

    return segments;
}

/** 每个格子经过的所有事项：跨天事项在它经过的每一格都计入（用于 aria-label 与单元格提示） */
function mapEventsByCell(events: CalendarEvent[], gridStart: Date, today: Date) {
    const map = new Map<number, CalendarEvent[]>();
    for (const event of events) {
        const start = parseDate(event.start) ?? today;
        const declaredEnd = parseDate(event.end);
        const end = !declaredEnd || isBeforeDay(declaredEnd, start) ? start : declaredEnd;
        if (!isEventVisibleInGrid(start, end, gridStart)) continue;
        const from = cellIndexOf(start, gridStart);
        const to = cellIndexOf(end, gridStart);
        for (let i = from; i <= to; i += 1) {
            const list = map.get(i) ?? [];
            list.push(event);
            map.set(i, list);
        }
    }
    return map;
}

/** 折叠提示：本格事项总数 - 实际画出来的事项条数 */
function countOverflows(segments: EventSegment[], counts: number[]) {
    const drawn = new Array<number>(GRID_CELLS).fill(0);
    for (const segment of segments) {
        for (let i = 0; i < segment.span; i += 1) {
            const at = segment.index + i;
            if (at < GRID_CELLS) drawn[at] += 1;
        }
    }
    return counts.map((count, i) => count - drawn[i]);
}

// ---------------------------------------------------------------------------
// 状态
// ---------------------------------------------------------------------------

// 受控判断：React 的 `value` 与 Vue 的 `modelValue` 均可作为受控值，value 优先
const isControlled = computed(() => props.value !== undefined || props.modelValue !== undefined);

const innerValue = ref<string>(props.defaultValue ?? toDateKey(new Date()));

const selectedValue = computed(() => {
    if (props.value !== undefined) return props.value;
    if (props.modelValue !== undefined) return props.modelValue;
    return innerValue.value;
});

const isPanelControlled = computed(() => props.panelValue !== undefined);

const innerPanel = ref<Date>(
    parseMonthValue(props.defaultPanelValue) ??
        parseDate(props.defaultValue) ??
        parseDate(props.value) ??
        parseDate(props.modelValue) ??
        new Date()
);

const viewMonth = computed<Date>(() =>
    props.panelValue === undefined ? innerPanel.value : (parseMonthValue(props.panelValue) ?? new Date())
);
const gridStart = computed(() => gridStartOf(viewMonth.value));

const focusCursor = ref<Date>(parseDate(selectedValue.value) ?? new Date());
const dragging = ref(false);
const dragAnchor = ref<Date | null>(null);
const dragHead = ref<Date | null>(null);

const now = new Date();
/** 今天截到零点：布局里只关心自然日，避免时分秒影响排序与夹取 */
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// 在计算时夹而不是放进 effect：受控面板不回写 panelValue 时 gridStart 不变，effect 永远等不到触发条件
const focusDate = computed(() => clampToGrid(focusCursor.value, gridStart.value));
const focusKey = computed(() => toDateKey(focusDate.value));
const monthKey = computed(() => toMonthKey(viewMonth.value));
// 选中态与光标用同一套夹取，否则网格外 value 会让「有焦点环、却没有任何格被选中」
const selectedKey = computed(() => {
    const date = parseDate(selectedValue.value);
    return date ? toDateKey(clampToGrid(date, gridStart.value)) : '';
});

const wrapperRef = ref<HTMLElement | null>(null);
/** 面板实际宽度：优先用显式 width，否则量自身盒子，量不到时退回基准宽度 */
const measuredWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;

/**
 * 方向键 / PageUp / PageDown 之后需要把 DOM 焦点搬到新的光标格子。
 * 用变量标记「这次是键盘移动」，避免首次渲染或程序化赋值时抢焦点。
 */
let pendingFocus = false;

onMounted(() => {
    const node = wrapperRef.value;
    if (!node || typeof ResizeObserver === 'undefined') return;
    resizeObserver = new ResizeObserver((entries) => {
        const next = entries[0]?.contentRect.width ?? 0;
        if (next > 0) measuredWidth.value = next;
    });
    resizeObserver.observe(node);
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
});

const numericWidth = computed(() => (typeof props.width === 'number' ? props.width : 0));
const effectiveWidth = computed(() => numericWidth.value || measuredWidth.value || LAYOUT_BASE.width);
const scale = computed(() => Math.min(MAX_SCALE, Math.max(MIN_SCALE, effectiveWidth.value / LAYOUT_BASE.width)));
const metrics = computed(() => ({
    header: LAYOUT_BASE.header * scale.value,
    cellHeight: LAYOUT_BASE.cellHeight * scale.value,
    numberBand: LAYOUT_BASE.numberBand * scale.value,
    eventRow: LAYOUT_BASE.eventRow * scale.value,
}));

// 根节点行内样式：数值 width 按 px 处理；调用方传入的 style 由 v-bind="attrs" 合并在后面，可覆盖 width
const rootStyle = computed<Record<string, string | undefined>>(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    '--animal-calendar-scale': `${scale.value}`,
}));

// 受控选中值变化后，把 roving tabindex 的光标同步到新的选中日期
watch(selectedValue, (next) => {
    const parsed = parseDate(next);
    if (parsed) focusCursor.value = parsed;
});

/*
 * 非受控时，只有「选中值本身发生变化」才把视图跟过去（受控面板由 panelValue 决定，这里不动）。
 * watch 只在选中值真正变化时触发，因此箭头翻月只改面板月份、不会把刚翻过去的月份又拽回来。
 */
watch(selectedValue, (next) => {
    if (isPanelControlled.value) return;
    const parsed = parseDate(next);
    if (parsed && toMonthKey(parsed) !== monthKey.value) innerPanel.value = parsed;
});

function goToMonth(month: Date, focus?: Date) {
    // 非受控时面板自己翻月；受控时只通知父级，由父级回写 panelValue
    if (!isPanelControlled.value) innerPanel.value = month;
    emit('update:panelValue', toMonthKey(month));
    emit('panelChange', toMonthKey(month));
    if (focus) focusCursor.value = focus;
}

// 光标变化后（且确实来自键盘移动）把焦点交到对应格子，保持 roving tabindex 与真实焦点一致
watch(
    [focusKey, monthKey],
    () => {
        if (!pendingFocus) return;
        pendingFocus = false;
        wrapperRef.value?.querySelector<HTMLElement>(`[data-date="${focusKey.value}"]`)?.focus();
    },
    { flush: 'post' }
);

/** 上下月：同时把键盘光标带到目标月的同一天 */
function shiftMonth(delta: number) {
    const v = viewMonth.value;
    const next = new Date(v.getFullYear(), v.getMonth() + delta, 1);
    goToMonth(
        next,
        new Date(next.getFullYear(), next.getMonth(), Math.min(focusDate.value.getDate(), daysInMonth(next)))
    );
}

function shiftYear(delta: number) {
    const v = viewMonth.value;
    const next = new Date(v.getFullYear() + delta, v.getMonth(), 1);
    goToMonth(
        next,
        new Date(next.getFullYear(), next.getMonth(), Math.min(focusDate.value.getDate(), daysInMonth(next)))
    );
}

function selectDate(date: Date) {
    const next = toDateKey(date);
    focusCursor.value = date;
    if (!isControlled.value) innerValue.value = next;
    emit('update:modelValue', next);
    emit('change', next);
    // 选中的日期不在当前视图时，面板跟随翻月（点选上下月补位格 / 跨月拖拽都适用）
    if (toMonthKey(date) !== monthKey.value) {
        const month = new Date(date.getFullYear(), date.getMonth(), 1);
        if (!isPanelControlled.value) innerPanel.value = month;
        emit('update:panelValue', toMonthKey(month));
        emit('panelChange', toMonthKey(month));
    }
}

const dragPreview = computed(() => {
    if (!dragging.value || !dragAnchor.value || !dragHead.value) return null;
    return isBeforeDay(dragAnchor.value, dragHead.value)
        ? { from: dragAnchor.value, to: dragHead.value }
        : { from: dragHead.value, to: dragAnchor.value };
});

/**
 * 拖拽预览以临时事项的形式参与同一套布局，因此跨天条会自动避开已有事项。
 * 预览条的引用固定在一个 computed 里，渲染时用它比对即可区分预览与真实事项。
 */
const previewEvent = computed<CalendarEvent | null>(() => {
    const preview = dragPreview.value;
    if (!preview) return null;
    return { title: '', start: toDateKey(preview.from), end: toDateKey(preview.to), color: 'teal' };
});

const layoutEventsSource = computed<CalendarEvent[]>(() =>
    previewEvent.value ? [...props.events, previewEvent.value] : props.events
);

// 参与叠加层渲染的事项片段（含拖拽预览条：占位但不计 +N）
const overlaySegments = computed(() =>
    layoutEvents(layoutEventsSource.value, gridStart.value, today, previewEvent.value)
);

const eventsByCell = computed(() => mapEventsByCell(props.events, gridStart.value, today));

const overflowCounts = computed(() => {
    const counts = new Array<number>(GRID_CELLS).fill(0);
    for (const event of props.events) {
        const start = parseDate(event.start) ?? today;
        const declaredEnd = parseDate(event.end);
        const last = !declaredEnd || isBeforeDay(declaredEnd, start) ? start : declaredEnd;
        if (!isEventVisibleInGrid(start, last, gridStart.value)) continue;
        const from = cellIndexOf(start, gridStart.value);
        const to = cellIndexOf(last, gridStart.value);
        for (let i = from; i <= to; i += 1) counts[i] += 1;
    }
    return countOverflows(overlaySegments.value, counts);
});

// ---------------------------------------------------------------------------
// 视图
// ---------------------------------------------------------------------------

interface CellView {
    key: string;
    dateKey: string;
    date: Date;
    index: number;
    outside: boolean;
    selected: boolean;
    isToday: boolean;
    extra: number;
    label: string;
}

/** 格子的无障碍文案：去重后标题数少于事项数时补「等」，否则会出现「2 项事项」只念出 1 个标题 */
function cellLabel(dateKey: string, dayEvents: CalendarEvent[]): string {
    if (dayEvents.length === 0) return dateKey;
    const titles = Array.from(new Set(dayEvents.map((event) => textOf(event.title)).filter(Boolean)));
    if (titles.length === 0) return `${dateKey} ${dayEvents.length} 项事项`;
    const collapsed = titles.length < dayEvents.length ? ' 等' : '';
    return `${dateKey} ${dayEvents.length} 项事项：${titles.join('，')}${collapsed}`;
}

const gridRows = computed<CellView[][]>(() => {
    const byCell = eventsByCell.value;
    const extras = overflowCounts.value;
    const cells = Array.from({ length: GRID_CELLS }, (_, index): CellView => {
        const date = addDays(gridStart.value, index);
        const dateKey = toDateKey(date);
        return {
            key: `${monthKey.value}-cell-${dateKey}`,
            dateKey,
            date,
            index,
            outside: date.getMonth() !== viewMonth.value.getMonth(),
            selected: dateKey === selectedKey.value,
            isToday: isSameDay(date, today),
            extra: extras[index],
            label: cellLabel(dateKey, byCell.get(index) ?? []),
        };
    });
    return Array.from({ length: CELL_ROWS }, (_, row) => cells.slice(row * COLS, row * COLS + COLS));
});

function cellClasses(cell: CellView) {
    return [
        'animal-calendar__cell',
        cell.outside && 'animal-calendar__cell--outside',
        cell.selected && 'animal-calendar__cell--selected',
        cell.isToday && 'animal-calendar__cell--today',
    ].filter(Boolean);
}

/**
 * 事项条绝对定位到所属周的日期数字下方，横向与日期圆共用一条内容轨道。
 * 纵向 = 表头 + 周序 × 单元格高 + 日期数字带 + 事项行序 × 行高，
 * 再靠 CSS 的 translateY(-50%) 把条在行内居中
 */
function eventBarStyle(segment: EventSegment): Record<string, string> {
    const col = (segment.index % COLS) + 1;
    const m = metrics.value;
    const top =
        m.header + Math.floor(segment.index / COLS) * m.cellHeight + m.numberBand + (segment.row + 0.5) * m.eventRow;
    return {
        '--animal-calendar-bar-top': `${top}px`,
        '--animal-calendar-bar-left': `calc((100% / 7) * ${col - 1} + 5px)`,
        '--animal-calendar-bar-width': `calc((100% / 7) * ${segment.span} - 10px)`,
    };
}

/** 事项条的起始时间：只在首段展示一次，跨周续接段与整段截断段都只保留标题 */
function eventTimeOf(segment: EventSegment): string {
    if (!props.showEventTime || !segment.event.showTime || segment.continuation) return '';
    const start = parseDate(segment.event.start);
    return start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : '';
}

// ---------------------------------------------------------------------------
// 交互
// ---------------------------------------------------------------------------

function handleKeyDown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'PageUp' || key === 'PageDown') {
        event.preventDefault();
        pendingFocus = true;
        shiftMonth(key === 'PageUp' ? -1 : 1);
        return;
    }
    const delta =
        key === 'ArrowLeft'
            ? -1
            : key === 'ArrowRight'
              ? 1
              : key === 'ArrowUp'
                ? -COLS
                : key === 'ArrowDown'
                  ? COLS
                  : 0;
    if (delta !== 0) {
        event.preventDefault();
        const next = addDays(focusDate.value, delta);
        pendingFocus = true;
        focusCursor.value = next;
        // 光标移到别的月份时，面板跟随翻月（同月内的移动不动面板）
        if (!isSameMonth(next, viewMonth.value)) {
            const month = new Date(next.getFullYear(), next.getMonth(), 1);
            if (!isPanelControlled.value) innerPanel.value = month;
            emit('update:panelValue', toMonthKey(month));
            emit('panelChange', toMonthKey(month));
        }
        return;
    }
    if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        selectDate(focusDate.value);
    }
}

function startDragAt(index: number) {
    if (!props.draggableEvents) return;
    const date = addDays(gridStart.value, index);
    dragging.value = true;
    dragAnchor.value = date;
    dragHead.value = date;
}

function extendDragAt(index: number) {
    if (!dragging.value) return;
    dragHead.value = addDays(gridStart.value, index);
}

function stopDrag() {
    dragging.value = false;
    dragAnchor.value = null;
    dragHead.value = null;
}

function finishDrag() {
    if (!dragging.value) return;
    // 必须在清空拖拽态之前取出起止：Vue 的 ref 是同步更新，写在后面会读到 null
    const anchor = dragAnchor.value;
    const head = dragHead.value;
    stopDrag();
    if (!anchor || !head) return;
    const from = isBeforeDay(anchor, head) ? anchor : head;
    const to = isBeforeDay(anchor, head) ? head : anchor;
    // 单击（起止同一天）只当作选中，不创建事项
    if (isSameDay(from, to)) return;
    emit('eventCreate', toDateKey(from), toDateKey(to));
}

// 指针在面板之外抬起时也要收尾，否则拖拽态会一直保留
watch(
    dragging,
    (_isDragging, _prev, onCleanup) => {
        if (!dragging.value) return;
        document.addEventListener('pointerup', stopDrag);
        document.addEventListener('pointercancel', stopDrag);
        onCleanup(() => {
            document.removeEventListener('pointerup', stopDrag);
            document.removeEventListener('pointercancel', stopDrag);
        });
    },
    // 同步监听：mousedown 与 pointerup 可能落在同一次更新里，延迟到下一轮再挂监听会漏掉收尾
    { flush: 'sync' }
);

function handleCellMouseDown(event: MouseEvent, index: number) {
    // 原生 mousedown 对任意按键都会触发，只认左键，否则右键拖拽也会建出事项
    if (event.button === 0) startDragAt(index);
}
</script>

<template>
    <div
        ref="wrapperRef"
        class="animal-calendar"
        :data-draggable="draggableEvents ? 'true' : undefined"
        :style="rootStyle"
        v-bind="attrs"
        @pointerup="finishDrag"
        @pointercancel="finishDrag"
    >
        <div class="animal-calendar__header">
            <div class="animal-calendar__header-group">
                <button type="button" class="animal-calendar__nav-btn" aria-label="上一年" @click="shiftYear(-1)">
                    <svg
                        class="animal-calendar__nav-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M9.5 2.5L5 7l4.5 4.5"
                            stroke="currentColor"
                            stroke-width="2.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <button type="button" class="animal-calendar__nav-btn" aria-label="上个月" @click="shiftMonth(-1)">
                    <svg
                        class="animal-calendar__nav-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M10.5 3L5.5 8l5 5"
                            stroke="currentColor"
                            stroke-width="2.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
            </div>
            <span class="animal-calendar__month-label">
                <CalendarIcon :size="16" class="animal-calendar__month-icon" />
                {{ viewMonth.getFullYear() }}年{{ viewMonth.getMonth() + 1 }}月
            </span>
            <div class="animal-calendar__header-group">
                <button type="button" class="animal-calendar__today-btn" @click="selectDate(today)">今天</button>
                <button type="button" class="animal-calendar__nav-btn" aria-label="下个月" @click="shiftMonth(1)">
                    <svg
                        class="animal-calendar__nav-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M5.5 3l5 5-5 5"
                            stroke="currentColor"
                            stroke-width="2.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <button type="button" class="animal-calendar__nav-btn" aria-label="下一年" @click="shiftYear(1)">
                    <svg
                        class="animal-calendar__nav-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M4.5 2.5L9 7l-4.5 4.5"
                            stroke="currentColor"
                            stroke-width="2.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div class="animal-calendar__body" @keydown="handleKeyDown">
            <table role="grid" :aria-label="ariaLabel" :aria-labelledby="ariaLabelledBy" class="animal-calendar__table">
                <thead>
                    <tr role="row">
                        <th
                            v-for="weekday in WEEKDAYS"
                            :key="weekday"
                            role="columnheader"
                            scope="col"
                            class="animal-calendar__week-cell"
                        >
                            {{ weekday }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in gridRows" :key="`${monthKey}-row-${rowIndex}`" role="row">
                        <td
                            v-for="cell in row"
                            :key="cell.key"
                            role="gridcell"
                            :tabindex="cell.dateKey === focusKey ? 0 : -1"
                            :aria-selected="cell.selected || undefined"
                            :aria-label="cell.label"
                            :data-date="cell.dateKey"
                            :class="cellClasses(cell)"
                            @click="selectDate(cell.date)"
                            @mousedown="handleCellMouseDown($event, cell.index)"
                            @mouseenter="extendDragAt(cell.index)"
                        >
                            <span class="animal-calendar__cell-inner">
                                <span class="animal-calendar__day-number">{{ cell.date.getDate() }}</span>
                                <span v-if="cell.extra > 0" class="animal-calendar__more">+{{ cell.extra }}</span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="overlaySegments.length > 0" class="animal-calendar__events-layer" aria-hidden="true">
                <div
                    v-for="segment in overlaySegments"
                    :key="`${monthKey}-evt-${segment.index}-${segment.row}`"
                    :data-color="segment.event.color ?? 'teal'"
                    :data-span="segment.span > 1 ? 'true' : undefined"
                    :data-start="segment.index % COLS === 0 ? 'true' : undefined"
                    :data-end="segment.endIndex % COLS === COLS - 1 ? 'true' : undefined"
                    :data-preview="segment.event === previewEvent ? 'true' : undefined"
                    class="animal-calendar__event"
                    :style="eventBarStyle(segment)"
                >
                    <slot name="event" :event="segment.event" :segment="segment" :time="eventTimeOf(segment)">
                        <span v-if="eventTimeOf(segment)" class="animal-calendar__event-time">{{
                            eventTimeOf(segment)
                        }}</span>
                        <span class="animal-calendar__event-title">{{ segment.event.title }}</span>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// ============================================
// Calendar —— Animal Island Style
// 轻量月面板：容器与 DatePicker 同源（奶油卡片 + 青绿主色）
// 强调色固定为 DatePicker 的选中色（青绿）。组件不提供主题切换：
// 其他组件也只有语义化的 color / type，没有整套换色开关
// ============================================

/*
 * 面板尺寸完全由宽度推导：组件测量自身宽度后下发 --animal-calendar-scale
 * （= 实际宽度 / 基准宽度 750），下面所有度量都是「基准值 × 系数」。
 * 因此面板变大时行高、事项条、字号一起跟着放大，不需要 size 档位。
 *
 * 硬约束：单元格高度必须容得下「日期数字带 42 + 2 条事项行 22 × 2 = 86 ≤ 104」，
 * 否则同一周的第 2 条事项条会越出格子、盖住下一周的日期数字。
 * 上面的基准值与 Calendar.vue 的 LAYOUT_BASE 一一对应；基准宽度下改任何取值都必须同步那边，
 * 两边的硬约束算式都写死常量值，避免各自漂移成对不上的数字。
 */
@base-scale: var(--animal-calendar-scale, 1);
@number-size: 28px; /* 日期圆直径 */
/* 面板左右内边距：表格与绝对定位的事项叠加层共用同一缩进，才能保持列宽对齐 */
@body-pad: 8px;

.animal-calendar {
    --animal-calendar-accent: @primary-color;
    --animal-calendar-accent-soft: fade(@primary-color, 14%);
    --animal-calendar-accent-tint: @primary-color-bg;
    --animal-calendar-header-height: calc(32px * @base-scale);
    --animal-calendar-number-size: calc(@number-size * @base-scale);
    --animal-calendar-cell-height: calc(104px * @base-scale);
    --animal-calendar-row-height: calc(22px * @base-scale);
    --animal-calendar-bar-height: calc(17px * @base-scale);

    display: block;
    width: 100%;
    font-family: @font-family;
    user-select: none;
    -webkit-user-select: none;
}

/* 头部：上/下月导航 + 年月标签 + 今天 */
.animal-calendar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @spacing-sm;
    margin-bottom: @spacing-sm;
}

.animal-calendar__header-group {
    display: flex;
    align-items: center;
    gap: 2px;
}

.animal-calendar__nav-btn {
    display: flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #a0936e;
    cursor: pointer;
    transition: all @motion-duration-fast @motion-ease;

    &:hover {
        background: fade(@warm-color-soft, 10%);
        color: var(--animal-calendar-accent);
    }

    &:focus-visible {
        outline: 2px solid var(--animal-calendar-accent);
        outline-offset: 1px;
    }
}

.animal-calendar__nav-icon {
    display: block;
    flex-shrink: 0;
}

.animal-calendar__month-label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: @spacing-xs @spacing-md;
    border-radius: @border-radius-sm;
    background: @bg-color-input;
    color: @warm-color-soft;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.01em;
}

.animal-calendar__month-icon {
    display: block;
    flex-shrink: 0;

    /* Icon 内置描边是深灰，这里按状态换成强调色 */
    :deep(svg) {
        stroke: var(--animal-calendar-accent);
    }
}

.animal-calendar__today-btn {
    margin-right: 2px;
    padding: @spacing-xs @spacing-md;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #8a7b66;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all @motion-duration-fast @motion-ease;

    &:hover {
        background: fade(@warm-color-soft, 10%);
        color: @warm-color-soft;
    }

    &:focus-visible {
        outline: 2px solid var(--animal-calendar-accent);
        outline-offset: 1px;
    }
}

/* 面板：奶油卡片，与 DatePicker 弹出面板同款描边与圆角 */
.animal-calendar__body {
    position: relative;
    /* 上下左右都留出内边距：下方额外为 2 行事项带预留高度（表格自身只占 6 行日期） */
    padding: @body-pad @body-pad calc(var(--animal-calendar-row-height) * 2 + 6px + @body-pad);
    border: 1.5px solid #e8dcc8;
    border-radius: @border-radius-lg;
    background:
        radial-gradient(circle, rgba(196, 184, 158, 0.15) 1.1px, transparent 1.1px) 0 0 / 28px 28px,
        radial-gradient(circle, rgba(196, 184, 158, 0.1) 0.8px, transparent 0.8px) 7px 7px / 14px 14px,
        #fffdf7;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
}

.animal-calendar__table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.animal-calendar__week-cell {
    height: var(--animal-calendar-header-height);
    color: @text-color-disabled;
    font-size: @font-size-sm;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
}

.animal-calendar__cell {
    /* 日期数字与事项条都以格子的内容盒为准（左右各 5px），
       这样 7 列网格里的跨天条与日期圆共用同一条轨道，接缝处才能连成一条。
       顶部 5px 内边距把 numberBand 的上下留白对称化，避免日期圆贴到格顶；
       日期圆下方空间由 numberBand 统一控制，格子不再额外设 padding-bottom */
    height: var(--animal-calendar-cell-height);
    padding: 5px 5px 0;
    box-sizing: border-box;
    vertical-align: top;
    border-radius: @border-radius-sm;
    cursor: pointer;
    transition: background @motion-duration-fast @motion-ease;

    &:hover {
        background: #f4f0e4;
    }

    &:focus-visible {
        outline: 2px solid var(--animal-calendar-accent);
        outline-offset: -2px;
    }
}

.animal-calendar__cell--outside {
    cursor: pointer;
}

.animal-calendar__cell--selected,
.animal-calendar__cell--selected:hover {
    background: var(--animal-calendar-accent-tint);
}

/* 开启拖拽创建后，日期格改用十字光标提示可拖拽 */
.animal-calendar[data-draggable='true'] .animal-calendar__cell {
    cursor: crosshair;
}

/* 日期数字：固定圆形，位置与叠加层解耦，悬停/选中直接换色。
   字号随面板缩放（根节点上已按宽度设好），描边与背景仍挂在圆上 */
.animal-calendar__day-number {
    display: block;
    width: var(--animal-calendar-number-size);
    height: var(--animal-calendar-number-size);
    border-radius: 50%;
    color: @warm-color-soft;
    /* 字号固定 13px：日期圆直径会随面板放大，但数字本身再放大就会溢出圆外 */
    font-size: 13px;
    font-weight: 500;
    line-height: var(--animal-calendar-number-size);
    text-align: center;
    transition: all @motion-duration-fast @motion-ease;
}

.animal-calendar__cell:hover .animal-calendar__day-number {
    color: #5a4530;
    font-weight: 700;
}

.animal-calendar__cell--outside .animal-calendar__day-number {
    color: @text-color-disabled;
    font-weight: 400;
}

.animal-calendar__cell--today .animal-calendar__day-number {
    box-shadow: inset 0 0 0 1.5px var(--animal-calendar-accent);
    color: var(--animal-calendar-accent);
    font-weight: 700;
}

.animal-calendar__cell--selected .animal-calendar__day-number,
.animal-calendar__cell--selected:hover .animal-calendar__day-number {
    background: var(--animal-calendar-accent);
    box-shadow: none;
    color: #fff;
    font-weight: 700;
}

/* 事项折叠提示：超过 2 条时展示 +N */
.animal-calendar__more {
    display: block;
    margin: 2px 0 6px;
    padding: 1px 5px;
    border-radius: 8px;
    background: var(--animal-calendar-accent-soft);
    color: var(--animal-calendar-accent);
    font-size: 10px;
    font-weight: 700;
    line-height: 1.5;
    text-align: center;
}

/* 事项叠加层：绝对定位覆盖整个日期区，列宽 = 表格 7 等分列的宽度。
   left / width / top 都由组件算好后内联下发：
     left  = 列序 × 列宽 + 5px（与日期圆同一条内容轨道）
     width = 跨列数 × 列宽 - 10px
     top   = 表头 + 周序 × 单元格高 + 日期数字带 + 事项行 × 行高
   之所以用算好的像素值而不是 grid-column：事项条是绝对定位元素，
   已脱离网格布局，写 grid-column 不会生效。 */
.animal-calendar__events-layer {
    position: absolute;
    top: @body-pad;
    right: @body-pad;
    bottom: 0;
    left: @body-pad;
    pointer-events: none;
}

.animal-calendar__event {
    position: absolute;
    /* top 由组件算到「行首」，再用 0.5em 的位移把条在行内垂直居中 */
    top: calc(var(--animal-calendar-bar-top, 0px) + var(--animal-calendar-row-height) / 2);
    left: var(--animal-calendar-bar-left, 0);
    width: var(--animal-calendar-bar-width, 0);
    height: var(--animal-calendar-bar-height, 17px);
    margin: 0;
    transform: translateY(-50%);
    padding: 0 6px;
    overflow: hidden;
    border: 1px solid var(--animal-calendar-accent-soft);
    border-radius: 10px;
    background: var(--animal-calendar-accent-soft);
    color: @warm-color-soft;
    /* 字号随面板缩放，固定 11px 会让大面板显得字太小 */
    font-size: calc(11px * @base-scale);
    font-weight: 600;
    /* 行高与条高一致，单行垂直居中；文字溢出交给内部 span 做省略号 */
    line-height: var(--animal-calendar-bar-height, 17px);
    white-space: nowrap;
}

.animal-calendar__event-title,
.animal-calendar__event-time {
    display: inline;
}

/* 跨天条：接缝处的空档收窄到 1px（只够分开圆角），视觉上连成一条 */
.animal-calendar__event[data-span='true'] {
    margin-right: 1px;
    margin-left: 1px;
    border-radius: 6px;
}

/* 整周条的两端贴齐网格边缘，不再往内缩 */
.animal-calendar__event[data-start='true'] {
    margin-left: 0;
}

.animal-calendar__event[data-end='true'] {
    margin-right: 0;
}

.animal-calendar__event-time {
    margin-right: @spacing-xs;
    color: @text-color-secondary;
    font-variant-numeric: tabular-nums;
}

/* 事项配色：实色圆点色系，保留一件一色 */
.animal-calendar__event[data-color='teal'] {
    border-color: rgba(244, 150, 40, 0.5);
    background: #ffe4cc;
    color: #b04a1f;
}

.animal-calendar__event[data-color='amber'] {
    border-color: rgba(255, 193, 7, 0.5);
    background: #fff3d1;
    color: #8a6a08;
}

.animal-calendar__event[data-color='coral'] {
    border-color: rgba(255, 138, 101, 0.5);
    background: #ffe7de;
    color: #a44b32;
}

.animal-calendar__event[data-color='green'] {
    border-color: rgba(111, 186, 44, 0.5);
    background: #eaf6db;
    color: #4a7a1d;
}

.animal-calendar__event[data-color='purple'] {
    border-color: rgba(155, 127, 224, 0.5);
    background: #f0eafb;
    color: #6849b8;
}

/* 拖拽创建预览条：虚线描边区别于已有事项 */
.animal-calendar__event[data-preview='true'] {
    border-style: dashed;
}

@media (prefers-reduced-motion: reduce) {
    .animal-calendar__cell,
    .animal-calendar__day-number,
    .animal-calendar__nav-btn,
    .animal-calendar__today-btn {
        transition: none;
    }
}
</style>
