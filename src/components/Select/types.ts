export interface SelectOption {
    key: string;
    label: string;
}

export interface SelectProps {
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
}
