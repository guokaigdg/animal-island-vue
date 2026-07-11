export type WalletSize = 'small' | 'medium' | 'large';

export interface WalletProps {
    /** 金额数值，数字会按千分位格式化；字符串则原样展示 */
    value?: number | string;
    /** 自定义货币图标（默认使用钱袋图标） */
    icon?: string;
    /** 尺寸预设 */
    size?: WalletSize;
    /** 千分位分隔符，默认 ","，传 "" 可关闭 */
    thousandSeparator?: string;
}
