import type { CSSProperties, VNode } from 'vue';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPosition = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type NotificationPlacement = 'top' | 'bottom';

export interface NotificationConfig {
    message: string;
    description?: string;
    duration?: number;
    position?: NotificationPosition;
    type?: NotificationType;
    /** 自定义图标（优先级高于 type 默认图标） */
    icon?: VNode;
    /** 自定义操作按钮，渲染在关闭按钮左侧 */
    btn?: VNode;
    key?: string;
    onClose?: () => void;
    onClick?: () => void;
    /** 自定义关闭图标 */
    closeIcon?: VNode;
    className?: string;
    /** 自定义样式 */
    style?: CSSProperties;
}

export interface NotificationItem extends NotificationConfig {
    key: string;
    type: NotificationType;
    position: NotificationPosition;
    placement: NotificationPlacement;
    createdAt: number;
}

export interface NotificationStatic {
    (config: NotificationConfig | string): void;
    open: (config: NotificationConfig | string) => void;
    success: (config: NotificationConfig | string) => void;
    info: (config: NotificationConfig | string) => void;
    warning: (config: NotificationConfig | string) => void;
    error: (config: NotificationConfig | string) => void;
    destroy: (key?: string) => void;
}
