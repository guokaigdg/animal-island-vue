export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'paragraph';

export interface SkeletonProps {
    /** 是否显示骨架屏（false 时直接渲染 children） */
    loading?: boolean;
    /** 骨架屏变体 */
    variant?: SkeletonVariant;
    /** 是否启用动画 */
    active?: boolean;
    /** 行数（paragraph 模式有效） */
    rows?: number;
    /** 宽度（text/circle/rect 模式有效） */
    width?: number | string;
    /** 每行宽度（paragraph 模式有效，可传数组对不同行指定不同宽度） */
    rowWidths?: (number | string)[];
    /** 宽高（circle / rect 模式有效） */
    widthValue?: number | string;
    heightValue?: number | string;
}

export interface SkeletonButtonProps {
    size?: 'small' | 'middle' | 'large';
    active?: boolean;
}

export interface SkeletonInputProps {
    size?: 'small' | 'middle' | 'large';
    active?: boolean;
}

export interface SkeletonAvatarProps {
    size?: 'small' | 'middle' | 'large';
    shape?: 'circle' | 'square';
    active?: boolean;
}
