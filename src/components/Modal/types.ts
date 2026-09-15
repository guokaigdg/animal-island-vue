import type { VNode } from 'vue';

export type ModalVariant = 'default' | 'game';

export interface ModalProps {
    /** 是否可见 */
    open: boolean;
    /** 弹窗类型: default 常规圆角矩形, game 异形自然外框。默认 default */
    variant?: ModalVariant;
    /** 标题 */
    title?: string;
    /** 宽度 */
    width?: number | string;
    /** 点击遮罩关闭 */
    maskClosable?: boolean;
    /** 底部按钮区域（ReactNode），为 null 时不渲染；省略时使用 showFooter 决定默认按钮 */
    footer?: VNode | string | null;
    /** 是否展示默认底部按钮（footer 未提供时的便捷开关）。默认 true */
    showFooter?: boolean;
    /** 启用打字机效果（每次 open 切换为 true 时重启） */
    typewriter?: boolean;
    /** 打字机每字间隔 (ms) */
    typeSpeed?: number;
    /** 遮罩层自定义样式 */
    maskStyle?: Record<string, unknown>;
}