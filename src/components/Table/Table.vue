<script setup lang="ts" generic="T extends TableRecord">
import { computed, useAttrs, type CSSProperties, type VNode } from 'vue';
import type { TableColumn, TableRecord } from './types';

const attrs = useAttrs();

const props = withDefaults(
    defineProps<{
        columns?: TableColumn<T>[];
        dataSource?: T[];
        rowKey?: string | ((record: T) => string);
        striped?: boolean;
        showHeader?: boolean;
        loading?: boolean;
        emptyText?: string;
        scroll?: { x?: number | string; y?: number | string };
    }>(),
    {
        columns: () => [] as TableColumn<T>[],
        dataSource: () => [] as T[],
        rowKey: 'key',
        striped: true,
        showHeader: true,
        loading: false,
        emptyText: '暂无数据',
    },
);

defineSlots<{
    [key: `cell-${string}`]: (scope: { value: unknown; record: T; index: number }) => unknown;
    [key: `header-${string}`]: (scope: { column: TableColumn<T> }) => unknown;
    empty?: () => unknown;
}>();

function getRowKey(record: T, index: number): string {
    if (typeof props.rowKey === 'function') return props.rowKey(record);
    const v = (record as TableRecord)[props.rowKey];
    return v != null ? String(v) : String(index);
}

function cellAlign(c: TableColumn<T>): CSSProperties['textAlign'] {
    return c.align ?? 'left';
}

function renderCustom(
    col: TableColumn<T>,
    record: T,
    index: number,
): VNode | string | number | null {
    if (!col.render) return null;
    const value = col.dataIndex ? (record as TableRecord)[col.dataIndex] : undefined;
    return col.render(value, record, index);
}

const wrapperStyle = computed<CSSProperties>(() => ({
    overflowX: props.scroll?.x ? 'auto' : undefined,
    overflowY: props.scroll?.y ? 'auto' : undefined,
    maxHeight: typeof props.scroll?.y === 'number' ? `${props.scroll.y}px` : props.scroll?.y,
}));
</script>

<template>
    <div class="animal-table-wrapper" :style="wrapperStyle" v-bind="attrs">
        <table
            class="animal-table"
            :class="{ 'animal-table--loading': loading }"
        >
            <thead v-if="showHeader" class="animal-table__head">
                <tr class="animal-table__head-row">
                    <th
                        v-for="(col, i) in columns"
                        :key="i"
                        class="animal-table__th"
                        :style="{
                            width: typeof col.width === 'number' ? col.width + 'px' : col.width,
                            textAlign: cellAlign(col),
                            ...col.style,
                        }"
                    >
                        <component :is="typeof col.title === 'function' ? col.title : 'span'">
                            <template v-if="typeof col.title !== 'function'">{{ col.title }}</template>
                        </component>
                    </th>
                </tr>
            </thead>
            <tbody class="animal-table__body">
                <tr v-if="dataSource.length === 0">
                    <td
                        :colspan="columns.length || 1"
                        class="animal-table__empty-cell"
                    >
                        <div class="animal-table__empty">
                            <slot name="empty">
                                <svg viewBox="0 0 24 24" width="48" height="48" class="animal-table__empty-icon">
                                    <path
                                        fill="currentColor"
                                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"
                                    />
                                </svg>
                                <span>{{ emptyText }}</span>
                            </slot>
                        </div>
                    </td>
                </tr>
                <tr
                    v-for="(record, index) in dataSource"
                    v-else
                    :key="getRowKey(record, index)"
                    class="animal-table__row"
                    :class="{ 'animal-table__row--striped': striped && index % 2 === 1 }"
                >
                    <td
                        v-for="(col, ci) in columns"
                        :key="ci"
                        class="animal-table__cell"
                        :style="{ textAlign: cellAlign(col), ...col.style }"
                    >
                        <slot
                            v-if="col.dataIndex && $slots[`cell-${col.dataIndex}`]"
                            :name="`cell-${col.dataIndex}`"
                            :value="(record as TableRecord)[col.dataIndex]"
                            :record="record"
                            :index="index"
                        />
                        <template v-else-if="col.render">
                            <component :is="() => renderCustom(col, record, index)" />
                        </template>
                        <template v-else>
                            {{ col.dataIndex ? (record as TableRecord)[col.dataIndex] : '' }}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="loading" class="animal-table__loader">
            <div class="animal-table__spinner">
                <svg viewBox="0 0 50 50" width="40" height="40">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-dasharray="31.4 31.4"
                    />
                </svg>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-table-wrapper {
    position: relative;
    width: 100%;
    background: rgb(247, 243, 223);
    border-radius: 20px;
    padding: 6px;
    box-sizing: border-box;
}

.animal-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-family: @font-family;

    &--loading {
        opacity: 0.7;
        pointer-events: none;
    }

    &__head {
        background: rgb(247, 243, 223);
    }

    &__head-row {
        position: relative;
    }

    &__th {
        padding: 16px 20px;
        font-size: @font-size-base;
        font-weight: 700;
        color: #725d42;
        white-space: nowrap;
        letter-spacing: 0.02em;
        background: transparent;
    }

    &__body {
        background: rgb(247, 243, 223);
    }

    &__empty-cell {
        padding: 60px 20px;
        text-align: center;
    }

    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        color: #9f927d;
        font-size: @font-size-base;
    }

    &__empty-icon {
        opacity: 0.5;
    }

    &__row {
        position: relative;
        transition: all 0.25s @motion-ease;

        &--striped {
            background: rgba(248, 248, 240, 0.6);
        }

        &:hover {
            background-image: repeating-linear-gradient(
                -45deg,
                rgba(25, 200, 185, 0.6),
                rgba(25, 200, 185, 0.6) 10px,
                rgba(14, 196, 182, 0.6) 10px,
                rgba(14, 196, 182, 0.6) 20px
            );
            background-size: 28.28px 28.28px;
            clip-path: inset(0 0 0 0 round 30px);

            .animal-table__cell {
                color: #3d2e1e;
            }
        }
    }

    &__head-row::after,
    &__row::after {
        content: '';
        position: absolute;
        left: 20px;
        right: 20px;
        bottom: 0;
        height: 1px;
        background: repeating-linear-gradient(
            90deg,
            rgb(240, 232, 216) 0,
            rgb(240, 232, 216) 6px,
            transparent 6px,
            transparent 12px
        );
        transition: opacity 0.25s @motion-ease;
    }

    &__row:last-child::after {
        display: none;
    }

    &__row:hover::after {
        opacity: 0;
    }

    &__cell {
        padding: 14px 20px;
        font-size: @font-size-base;
        font-weight: 500;
        color: #725d42;
        line-height: 1.6;
        transition: all 0.25s @motion-ease;
    }

    &__loader {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(247, 243, 223, 0.8);
        backdrop-filter: blur(2px);
    }

    &__spinner {
        color: @primary-color;
        animation: animal-table-spin 1s linear infinite;

        circle {
            animation: animal-table-dash 1.5s ease-in-out infinite;
        }
    }
}

@keyframes animal-table-spin {
    to { transform: rotate(360deg); }
}
@keyframes animal-table-dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
