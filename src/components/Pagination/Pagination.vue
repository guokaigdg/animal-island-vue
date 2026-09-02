<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { PaginationVariant } from './types';

interface Props {
    /** 数据总数 */
    total: number;
    /** 当前页（受控，v-model:current） */
    current?: number;
    /** 默认当前页 */
    defaultCurrent?: number;
    /** 每页条数（受控，v-model:pageSize） */
    pageSize?: number;
    /** 默认每页条数 */
    defaultPageSize?: number;
    /** 是否显示每页条数切换器 */
    showSizeChanger?: boolean;
    /** 可选的每页条数列表 */
    pageSizeOptions?: number[];
    /** 是否显示快速跳转输入框 */
    showQuickJumper?: boolean;
    /** 是否显示总条数文本 */
    showTotal?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 配色：orange 琥珀橘（DatePicker 范围选择同款，默认）/ teal 青 */
    variant?: PaginationVariant;
}

const props = withDefaults(defineProps<Props>(), {
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: false,
    disabled: false,
    variant: 'orange',
});

const emit = defineEmits<{
    (e: 'update:current', page: number): void;
    (e: 'update:pageSize', size: number): void;
    (e: 'change', page: number, pageSize: number): void;
    (e: 'showSizeChange', current: number, size: number): void;
}>();

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

/** 生成页码序列：首尾页 + 当前页邻域 + 省略号 */
function getPageItems(current: number, pageCount: number): PageItem[] {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const items: PageItem[] = [1];
    if (current > 3) items.push('ellipsis-left');
    const start = Math.max(2, current - 1);
    const end = Math.min(pageCount - 1, current + 1);
    for (let i = start; i <= end; i += 1) items.push(i);
    if (current < pageCount - 2) items.push('ellipsis-right');
    items.push(pageCount);
    return items;
}

// 内部状态：仅在非受控（未传对应 prop）时生效
const innerPage = ref(props.defaultCurrent);
const innerPageSize = ref(props.defaultPageSize);

const pageSize = computed(() => props.pageSize ?? innerPageSize.value);
const pageCount = computed(() => Math.max(1, Math.ceil(Math.max(0, props.total) / pageSize.value)));
const page = computed(() => Math.min(props.current ?? innerPage.value, pageCount.value));
const items = computed(() => getPageItems(page.value, pageCount.value));

function changePage(next: number) {
    const target = Math.min(Math.max(1, next), pageCount.value);
    if (target === page.value) return;
    if (props.current === undefined) innerPage.value = target;
    emit('update:current', target);
    emit('change', target, pageSize.value);
}

function changePageSize(size: number) {
    const nextPageCount = Math.max(1, Math.ceil(Math.max(0, props.total) / size));
    const targetPage = Math.min(page.value, nextPageCount);
    if (props.pageSize === undefined) innerPageSize.value = size;
    if (props.current === undefined) innerPage.value = targetPage;
    emit('update:pageSize', size);
    emit('update:current', targetPage);
    emit('showSizeChange', targetPage, size);
    if (targetPage !== page.value || size !== pageSize.value) emit('change', targetPage, size);
}

// ---------- 每页条数切换器：胶囊触发器 + 上弹选项列表 ----------
const sizeOpen = ref(false);
const sizeChangerRef = ref<HTMLDivElement | null>(null);

function toggleSizeChanger() {
    if (props.disabled) return;
    sizeOpen.value = !sizeOpen.value;
}

function handleSizeMouseDown(e: MouseEvent) {
    if (sizeChangerRef.value && !sizeChangerRef.value.contains(e.target as Node)) {
        sizeOpen.value = false;
    }
}

function handleSizeKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') sizeOpen.value = false;
}

watch(sizeOpen, (open) => {
    if (open) {
        document.addEventListener('mousedown', handleSizeMouseDown);
        document.addEventListener('keydown', handleSizeKeyDown);
    } else {
        document.removeEventListener('mousedown', handleSizeMouseDown);
        document.removeEventListener('keydown', handleSizeKeyDown);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleSizeMouseDown);
    document.removeEventListener('keydown', handleSizeKeyDown);
});

function selectSize(opt: number) {
    sizeOpen.value = false;
    if (opt !== pageSize.value) changePageSize(opt);
}

const sizeOptions = computed(() => props.pageSizeOptions ?? [10, 20, 50, 100]);

// ---------- 快速跳转输入框：Enter 或失焦跳页 ----------
const jumperText = ref('');

function jump() {
    const target = parseInt(jumperText.value, 10);
    jumperText.value = '';
    if (!Number.isNaN(target)) changePage(target);
}
</script>

<template>
    <nav
        class="animal-pagination"
        :class="[`animal-pagination--${variant}`, { 'animal-pagination--disabled': disabled }]"
        aria-label="分页"
    >
        <span v-if="showTotal" class="animal-pagination__total">共 {{ total }} 条</span>
        <button
            type="button"
            class="animal-pagination__item"
            :disabled="disabled || page <= 1"
            aria-label="上一页"
            @click="changePage(page - 1)"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 5l-7 7 7 7"
                />
            </svg>
        </button>
        <template v-for="item in items" :key="item">
            <button
                v-if="typeof item === 'number'"
                type="button"
                class="animal-pagination__item"
                :class="{ 'animal-pagination__item--active': item === page }"
                :disabled="disabled"
                :aria-current="item === page ? 'page' : undefined"
                @click="changePage(item)"
            >
                {{ item }}
            </button>
            <span v-else class="animal-pagination__ellipsis" aria-hidden="true">···</span>
        </template>
        <button
            type="button"
            class="animal-pagination__item"
            :disabled="disabled || page >= pageCount"
            aria-label="下一页"
            @click="changePage(page + 1)"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
        <div v-if="showSizeChanger" ref="sizeChangerRef" class="animal-pagination__size-changer">
            <button
                type="button"
                class="animal-pagination__size-trigger"
                :class="{ 'animal-pagination__size-trigger--open': sizeOpen }"
                :disabled="disabled"
                aria-haspopup="listbox"
                :aria-expanded="sizeOpen"
                :aria-label="`每页 ${pageSize} 条`"
                @click="toggleSizeChanger"
            >
                <span>{{ pageSize }} 条/页</span>
                <span class="animal-pagination__caret">
                    <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" focusable="false">
                        <path fill="currentColor" d="M12 16.5L5.5 9h13z" />
                    </svg>
                </span>
            </button>
            <ul v-if="sizeOpen" class="animal-pagination__size-list" role="listbox" aria-label="选择每页条数">
                <li
                    v-for="opt in sizeOptions"
                    :key="opt"
                    role="option"
                    :aria-selected="opt === pageSize"
                    class="animal-pagination__size-option"
                    :class="{ 'animal-pagination__size-option--active': opt === pageSize }"
                    @click="selectSize(opt)"
                >
                    {{ opt }} 条/页
                </li>
            </ul>
        </div>
        <span v-if="showQuickJumper" class="animal-pagination__jumper">
            跳至
            <input
                v-model="jumperText"
                class="animal-pagination__jumper-input"
                type="text"
                :disabled="disabled"
                inputmode="numeric"
                aria-label="跳转到指定页"
                @input="jumperText = jumperText.replace(/[^\d]/g, '')"
                @keydown.enter="jump"
                @blur="jump"
            />
            页
        </span>
    </nav>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// 视觉语言：
// - 页码/翻页为幽灵格子（透明底正圆），配色两套 ——
//   orange（默认）：DatePicker 范围选择琥珀色系（hover #ffd54f / 选中 #ffc107）
//   teal：DatePicker 单选青色系（hover #e6f9f6 / 选中 #19c8b9）
// - 每页条数切换器参考 Select 组件：白底 2px #e8dcc8 边框触发器（箭头展开旋转）、
//   #ffeea0 圆角弹层、hover 手指光标动画、选中项金色 pill bar
.animal-pagination {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    box-sizing: border-box;
    font-family: @font-family;
    font-size: 14px;
    color: #725d42;
    user-select: none;
    -webkit-user-select: none;
}

// 根级修饰类必须放在顶层（不能嵌套在 .animal-pagination 内，否则编译成后代选择器）
.animal-pagination--disabled {
    opacity: 0.6;
}

.animal-pagination__total {
    margin-right: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #a09080;
    white-space: nowrap;
}

// ---------- 页码 / 前后翻页：幽灵正圆格子 ----------
.animal-pagination__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #725d42;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    transition: all 0.15s ease;

    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 1px;
    }

    &:disabled {
        color: #d4c9b4;
        cursor: not-allowed;
        background: transparent;
    }
}

// 当前页公共态：加粗 + 默认光标（底色由配色变体提供）
.animal-pagination__item--active {
    color: #fff;
    font-weight: 700;
    cursor: default;
}

// ---------- 配色变体 ----------
// orange（默认）—— DatePicker 范围选择琥珀色系
.animal-pagination--orange
    .animal-pagination__item:hover:not(:disabled):not(.animal-pagination__item--active) {
    background: #ffd54f;
    color: #725d42;
}

.animal-pagination--orange .animal-pagination__item--active:hover {
    background: #ffb400;
}

.animal-pagination--orange .animal-pagination__item--active {
    background: #ffc107;
}

// teal —— DatePicker 单选青色系
.animal-pagination--teal
    .animal-pagination__item:hover:not(:disabled):not(.animal-pagination__item--active) {
    background: #e6f9f6;
    color: #19c8b9;
}

.animal-pagination--teal .animal-pagination__item--active {
    background: #19c8b9;
}

.animal-pagination--teal .animal-pagination__item--active:hover {
    background: #3dd4c6;
}

.animal-pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 32px;
    color: #c4b89e;
    font-weight: 900;
    letter-spacing: 1px;
}

// ---------- 每页条数切换器：参考 Select 组件 ----------
.animal-pagination__size-changer {
    position: relative;
    display: inline-flex;
    margin-left: 8px;
}

// 触发器：白底 + 2px #e8dcc8 边框 + 12px 圆角（同 Select trigger）
.animal-pagination__size-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    height: 34px;
    padding: 0 12px;
    border: 2px solid #e8dcc8;
    border-radius: 12px;
    background: #fff;
    color: #725d42;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        border-color: #d4c4a8;
        background: #fffdf7;
    }

    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 1px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f5f5f0;
    }
}

// 箭头：展开时旋转 180°，颜色跟随配色变体（orange 琥珀 / teal 青）
.animal-pagination__caret {
    display: flex;
    align-items: center;
    color: #a09080;
    transition:
        transform 0.2s ease,
        color 0.2s ease;
}

.animal-pagination__size-trigger--open .animal-pagination__caret {
    transform: rotate(180deg);
}

.animal-pagination--orange .animal-pagination__size-trigger--open .animal-pagination__caret {
    color: #ffb400;
}

.animal-pagination--teal .animal-pagination__size-trigger--open .animal-pagination__caret {
    color: #19c8b9;
}

// 弹层：#ffeea0 圆角 28px（同 Select dropdown），向上弹出
.animal-pagination__size-list {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 10;
    margin: 0;
    padding: 8px 0;
    list-style: none;
    background: #ffeea0;
    border-radius: 28px;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
    animation: animal-pagination-size-list-in 0.2s ease forwards;
}

.animal-pagination__size-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 108px;
    padding: 8px 26px;
    color: #725d42;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        font-weight: 700;
    }
}

// hover 出现动森手指光标（同 Select option:hover::before），浮在弹窗外侧不遮文字
.animal-pagination__size-option:hover::before {
    content: '';
    position: absolute;
    left: -22px;
    top: 50%;
    transform: translateY(-50%);
    width: 35px;
    height: 35px;
    background: url('../../assets/img/cursor/select-cursor.svg') no-repeat center / contain;
    animation: animal-pagination-cursor-slide-in 0.5s ease-out forwards;
}

// 选中项：金色 pill bar 衬底（同 Select pillBar）
.animal-pagination__size-option--active {
    font-weight: 700;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 56%;
        transform: translateY(-50%);
        height: 14px;
        margin: 0 20px;
        background: #ffcc00;
        border-radius: 7px;
        z-index: -1;
        opacity: 0.3;
    }
}

// ---------- 快速跳转 ----------
.animal-pagination__jumper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #8a7b66;
    white-space: nowrap;
}

// 输入框：奶油底胶囊，focus 仅显示文本光标，无额外视觉强调
.animal-pagination__jumper-input {
    box-sizing: border-box;
    width: 52px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50px;
    background: #fffbe7;
    color: #725d42;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    outline: none;
    caret-color: #725d42;

    &::placeholder {
        color: #c4b89e;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #ece8dc;
    }
}

@keyframes animal-pagination-size-list-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes animal-pagination-cursor-slide-in {
    0% {
        opacity: 0;
        transform: translateY(-50%) translateX(-20px) rotate(-15deg);
    }
    60% {
        opacity: 1;
        transform: translateY(-50%) translateX(5px) rotate(5deg);
    }
    100% {
        opacity: 1;
        transform: translateY(-50%) translateX(0) rotate(0deg);
    }
}
</style>
