export type ProgressSize = 'small' | 'middle' | 'large';
export type ProgressInfoPosition = 'inside' | 'right' | 'top';

export interface ProgressProps {
    /** 当前百分比，0–100 */
    percent: number;
    /** 尺寸 */
    size?: ProgressSize;
    /** 是否显示百分比文字 */
    showInfo?: boolean;
    /** 百分比文字位置 */
    infoPosition?: ProgressInfoPosition;
    /** 自定义文字格式化 */
    infoFormat?: (percent: number) => string;
    /** 进度条 fill 宽度动画时长（秒），0 = 不动画 */
    duration?: number;
}
