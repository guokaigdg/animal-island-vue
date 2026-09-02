export type PaginationVariant = 'orange' | 'teal';

export interface PaginationProps {
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
    /** 配色：orange 琥珀橘（默认）/ teal 青 */
    variant?: PaginationVariant;
}
