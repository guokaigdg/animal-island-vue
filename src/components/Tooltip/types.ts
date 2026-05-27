export type TooltipPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';

export type TooltipTrigger = 'hover' | 'focus' | 'click';

/** default 标准矩形；island 动森不规则有机气泡 */
export type TooltipVariant = 'default' | 'island';

export interface TooltipProps {
    /** 提示内容 */
    title?: string;
    /** 位置 */
    placement?: TooltipPlacement;
    /** 触发方式 */
    trigger?: TooltipTrigger;
    /** 视觉风格 */
    variant?: TooltipVariant;
    /** 是否显示边框 */
    bordered?: boolean;
}
