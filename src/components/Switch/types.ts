export type SwitchSize = 'small' | 'default';

export interface SwitchProps {
    /** 是否选中（受控，对应 v-model） */
    modelValue?: boolean;
    /** 是否选中（受控，React `checked` prop 的别名） */
    checked?: boolean;
    /** 默认是否选中（非受控初始值） */
    defaultChecked?: boolean;
    /** 尺寸 */
    size?: SwitchSize;
    /** 禁用 */
    disabled?: boolean;
    /** 加载状态 */
    loading?: boolean;
    /** 选中时文案 */
    checkedChildren?: string | number;
    /** 未选中时文案 */
    unCheckedChildren?: string | number;
}
