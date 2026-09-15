import type { CSSProperties, VNode } from 'vue';
import type { PaginationProps } from '../Pagination/types';

export type TableRecord = Record<string, unknown>;

export interface TableColumn<T extends TableRecord = TableRecord> {
    /** 列标题，支持纯文本或返回 VNode 的渲染函数（等价于 React 的 ReactNode title） */
    title: VNode | string | (() => VNode | string);
    /** 数据字段名（点号分隔的嵌套字段或数组路径） */
    dataIndex?: keyof T & string;
    /** Custom cell renderer. Use slot `cell-{dataIndex}` for richer control. */
    render?: (value: unknown, record: T, index: number) => VNode | string | number | null;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    style?: CSSProperties;
}

/** 与 React 端 TableColumn 对齐的别名（历史命名 ColumnType） */
export type ColumnType<T extends TableRecord = TableRecord> = TableColumn<T>;

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
    /** 空数据时展示的内容（React 端为 ReactNode，Vue 端兼容 string | VNode） */
    emptyText?: string | VNode;
    scroll?: { x?: number | string; y?: number | string };
    /** 分页配置；传入对象开启客户端分页，false 或缺省不分页（total 由 Table 内部按数据量计算，无需传入） */
    pagination?: false | TablePagination;
    /** 额外的 class（React 端为 className，作用于 <table> 元素） */
    className?: string;
    /** 透传到最外层滚动容器的内联样式 */
    style?: CSSProperties;
}

/** Table 分页配置（同 PaginationProps，但 total 由 Table 内部按 dataSource 长度计算） */
export type TablePagination = Omit<PaginationProps, 'total'>;
