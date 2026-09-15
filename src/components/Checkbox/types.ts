export type CheckboxSize = 'small' | 'middle' | 'large';
export type CheckboxValue = string | number;

export interface CheckboxOption {
    label: string | number;
    value: CheckboxValue;
    disabled?: boolean;
}

export interface CheckboxProps {
    /** 选中的值列表（受控，对应 v-model） */
    modelValue?: CheckboxValue[];
    /** 默认选中的值列表（非受控初始值） */
    defaultValue?: CheckboxValue[];
    options: CheckboxOption[];
    size?: CheckboxSize;
    disabled?: boolean;
    direction?: 'horizontal' | 'vertical';
}
