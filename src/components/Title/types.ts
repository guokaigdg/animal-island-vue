export type TitleSize = 'small' | 'middle' | 'large';

export type TitleColor =
    | 'default'
    | 'app-pink'
    | 'purple'
    | 'app-blue'
    | 'app-yellow'
    | 'app-orange'
    | 'app-teal'
    | 'app-green'
    | 'app-red'
    | 'lime-green'
    | 'yellow-green'
    | 'brown'
    | 'warm-peach-pink';

/** 视觉变体（ribbon=默认缎带；plain=纯文字） */
export type TitleVariant = 'ribbon' | 'plain';

export interface TitleProps {
    /** 尺寸 */
    size?: TitleSize;
    /** 配色，与 Card 同名色板 */
    color?: TitleColor;
    /** 视觉变体 */
    variant?: TitleVariant;
}