export type CheckboxSize = 'small' | 'middle' | 'large';
export type CheckboxValue = string | number;

export interface CheckboxOption {
    label: string;
    value: CheckboxValue;
    disabled?: boolean;
}

export interface CheckboxProps {
    modelValue?: CheckboxValue[];
    options: CheckboxOption[];
    size?: CheckboxSize;
    disabled?: boolean;
    direction?: 'horizontal' | 'vertical';
}
