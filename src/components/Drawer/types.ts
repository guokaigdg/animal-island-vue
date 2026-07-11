import type { CSSProperties } from 'vue';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
    /** 是否可见 */
    open: boolean;
    /** 标题 */
    title?: string;
    /** 弹出位置，默认 'right' */
    placement?: DrawerPlacement;
    /** 宽度（left / right 时生效），默认 378 */
    width?: number | string;
    /** 高度（top / bottom 时生效），默认 300 */
    height?: number | string;
    /** 点击遮罩关闭，默认 true */
    maskClosable?: boolean;
    /** 背景下沉景深效果，默认 true */
    pushBackground?: boolean;
    /** 底部区域，传 null 或不传则不渲染 */
    footer?: string;
    /** 关闭回调 */
    onClose?: () => void;
    /** 遮罩层自定义样式 */
    maskStyle?: CSSProperties;
}
