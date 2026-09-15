export type ProgressSize = 'small' | 'middle' | 'large';
export type ProgressInfoPosition = 'inside' | 'right' | 'top';

/**
 * 进度条 fill 背景场景图（与 React ProgressVariant 对齐）
 *  - sweet-corner: 甜点店角（默认）
 *  - forest-grove: 森林树丛
 *  - starry-camp:  星空露营
 *  - coffee-break: 咖啡时光
 */
export type ProgressVariant = 'sweet-corner' | 'forest-grove' | 'starry-camp' | 'coffee-break';

export interface ProgressProps {
    /** 当前百分比，0–100 */
    percent: number;
    /** 尺寸 */
    size?: ProgressSize;
    /** 是否显示百分比文字 */
    showInfo?: boolean;
    /** fill 背景场景图（默认 sweet-corner） */
    variant?: ProgressVariant;
    /** 百分比文字位置（Vue 扩展，React 固定置于进度条右侧） */
    infoPosition?: ProgressInfoPosition;
    /** 自定义文字格式化（默认 `${percent}%`） */
    infoFormat?: (percent: number) => string;
    /** 进度条 fill 宽度动画时长（秒），0 = 不动画 */
    duration?: number;
    /** 无可见标题时给 progressbar 一个无障碍标签（WCAG aria-progressbar-name 必需） */
    'aria-label'?: string;
    /** 关联外部可见标题的 id */
    'aria-labelledby'?: string;
}
