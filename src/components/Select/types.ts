export interface SelectOption {
    key: string;
    label: string;
}

export interface SelectProps {
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    /** 对外暴露的无障碍标签（无可见 label 时使用） */
    ariaLabel?: string;
    /** 关联外部可见 label 的 id */
    ariaLabelledBy?: string;
}
