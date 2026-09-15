export type InputSize = 'small' | 'middle' | 'large';

export interface InputProps {
    /** 输入值（受控，对应 v-model） */
    modelValue?: string;
    /** 默认输入值（非受控初始值） */
    defaultValue?: string;
    /** 输入框尺寸 */
    size?: InputSize;
    /** 前缀内容（React 的 prefix: ReactNode） */
    prefix?: string | number;
    /** 后缀内容（React 的 suffix: ReactNode） */
    suffix?: string | number;
    /** 允许清除 */
    allowClear?: boolean;
    /** 错误状态 */
    status?: 'error' | 'warning';
    /** 是否显示阴影 */
    shadow?: boolean;
    /** 禁用 */
    disabled?: boolean;
    /** 占位符 */
    placeholder?: string;
    /** 输入类型 */
    type?: string;
    /** 只读 */
    readonly?: boolean;
    /** 最大长度 */
    maxLength?: number;
    /** 清除按钮的无障碍标签，默认“清除” */
    clearAriaLabel?: string;
}
