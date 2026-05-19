export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonHTMLType = 'submit' | 'reset' | 'button';

export interface ButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    danger?: boolean;
    ghost?: boolean;
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
    htmlType?: ButtonHTMLType;
}
