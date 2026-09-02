import type { CSSProperties, VNode } from 'vue';
import type { PaginationProps } from '../Pagination/types';

export type TableRecord = Record<string, unknown>;

export interface TableColumn<T extends TableRecord = TableRecord> {
    title: string | (() => VNode | string);
    dataIndex?: keyof T & string;
    /** Custom cell renderer. Use slot `cell-{dataIndex}` for richer control. */
    render?: (value: unknown, record: T, index: number) => VNode | string | number | null;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    style?: CSSProperties;
}

export interface TableRowAttributes {
    class?: string | string[] | Record<string, boolean>;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
    onDblclick?: (e: MouseEvent) => void;
    [key: string]: unknown;
}

export interface TableProps<T extends TableRecord = TableRecord> {
    columns?: TableColumn<T>[];
    dataSource?: T[];
    rowKey?: string | ((record: T) => string);
    striped?: boolean;
    showHeader?: boolean;
    rowClassName?: string | ((record: T, index: number) => string);
    onRow?: (record: T, index: number) => TableRowAttributes;
    loading?: boolean;
    emptyText?: string;
    scroll?: { x?: number | string; y?: number | string };
    /** 分页配置；传入对象开启客户端分页，false 或缺省不分页（total 由 Table 内部按数据量计算，无需传入） */
    pagination?: false | TablePagination;
}

/** Table 分页配置（同 PaginationProps，但 total 由 Table 内部按 dataSource 长度计算） */
export type TablePagination = Omit<PaginationProps, 'total'>;
