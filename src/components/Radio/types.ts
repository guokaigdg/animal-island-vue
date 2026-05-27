export type RadioSize = 'small' | 'middle' | 'large';
export type RadioValue = string | number;

export interface RadioOption {
    /** 选项标签 */
    label: string;
    /** 选项值 */
    value: RadioValue;
    /** 是否禁用该选项 */
    disabled?: boolean;
}

export interface RadioProps {
    /** 受控选中值（v-model） */
    modelValue?: RadioValue;
    /** 选项列表 */
    options: RadioOption[];
    /** 尺寸 */
    size?: RadioSize;
    /** 禁用全部 */
    disabled?: boolean;
    /** 布局方向 */
    direction?: 'horizontal' | 'vertical';
}
