import type { VNode } from 'vue';

/** 空态尺寸，适用于表格单元、卡片与整块内容区。 */
export type NoDataSize = 'small' | 'medium' | 'large';

/** 默认空数据、搜索无结果与简洁空态。 */
export type NoDataVariant = 'default' | 'search' | 'simple';

export interface NoDataProps {
    /** 展示风格，默认 default */
    variant?: NoDataVariant;
    /** 尺寸，默认 medium */
    size?: NoDataSize;
    /** 标题，null / false 隐藏；缺省按 variant 取「暂无数据 / 没有找到相关结果」 */
    title?: string | VNode | null | false;
    /** 说明内容，null / false 隐藏 */
    description?: string | VNode | null | false;
    /** 自定义装饰图标；null / false 隐藏图标。也可用 #icon 插槽 */
    icon?: VNode | null | false;
    /** 操作区，推荐放置 Button；优先于默认插槽 */
    extra?: VNode | string | null | false;
    /** 显示奶油色背景与沙色虚线边框，默认 false */
    bordered?: boolean;
}
