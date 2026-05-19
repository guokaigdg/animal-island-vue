export type InputSize = 'small' | 'middle' | 'large';

export interface InputProps {
    modelValue?: string;
    size?: InputSize;
    allowClear?: boolean;
    status?: 'error' | 'warning';
    shadow?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    readonly?: boolean;
    maxlength?: number;
}
