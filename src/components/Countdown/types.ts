export type CountdownSize = 'small' | 'middle' | 'large';
export type CountdownVariant = 'default' | 'island';

export interface CountdownProps {
    /** 结束时间，可以传时间戳或 Date */
    value: number | Date;
    /** 输出格式，支持 DD、HH、mm、ss，默认 HH:mm:ss */
    format?: string;
    /** 尺寸 */
    size?: CountdownSize;
    /** 显示风格 */
    variant?: CountdownVariant;
    /** 数字块是否带边框，默认无 */
    bordered?: boolean;
}
