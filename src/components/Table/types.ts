import type { CSSProperties, VNode } from 'vue';

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
}
