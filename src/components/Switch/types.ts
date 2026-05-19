export type SwitchSize = 'small' | 'default';

export interface SwitchProps {
    modelValue?: boolean;
    defaultChecked?: boolean;
    size?: SwitchSize;
    disabled?: boolean;
    loading?: boolean;
}
