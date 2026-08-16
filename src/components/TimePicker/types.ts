export type TimePickerSize = 'small' | 'middle' | 'large';

export type TimePickerStatus = 'error' | 'warning';

/** 时分秒对象 */
export type TimePart = { h: number; m: number; s: number };

export interface TimePickerProps {
    /** 当前选中时间（受控），格式 HH:mm:ss，清空时为 null */
    modelValue?: string | null;
    /** 默认选中时间（非受控），格式 HH:mm:ss */
    defaultValue?: string | null;
    /** 占位文本 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否允许一键清空 */
    allowClear?: boolean;
    /** 尺寸 */
    size?: TimePickerSize;
    /** 校验状态 */
    status?: TimePickerStatus;
    /** 展示格式，支持 HH/mm/ss/H/m/s 占位符，默认 HH:mm:ss；包含 ss 时面板显示秒列 */
    format?: string;
    /** 小时步进（默认 1） */
    hourStep?: number;
    /** 分钟步进（默认 1） */
    minuteStep?: number;
    /** 秒步进（默认 1） */
    secondStep?: number;
    /** 受控展开状态 */
    open?: boolean;
    /** 对外暴露的无障碍标签（无可见 label 时使用） */
    ariaLabel?: string;
    /** 关联外部可见 label 的 id */
    ariaLabelledBy?: string;
}
