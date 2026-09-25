import type { CSSProperties, InjectionKey, VNode } from 'vue';

export type AvatarShape = 'circle' | 'square';

export type AvatarSize = 'small' | 'middle' | 'large';

export interface AvatarProps {
    /** 形状：circle 圆形（默认） / square 圆角方形 */
    shape?: AvatarShape;
    /** 尺寸：预设 small / middle / large，或任意像素数值 */
    size?: number | AvatarSize;
    /** 图片地址；加载失败自动回退到 icon / 文字 */
    src?: string;
    /** 图片替代文本（无障碍）；仅图片头像生效 */
    alt?: string;
    /** 图标占位：src 为空或加载失败时展示；未传时默认使用用户图标 */
    icon?: VNode;
    /** 文字/图标与头像边界的间距（px），文字过宽时按比例自动缩小字号 */
    gap?: number;
    /** 图片加载失败回调；返回 false 可阻止回退到占位内容 */
    onError?: () => boolean;
}

export interface AvatarGroupProps {
    /** 最多显示的头像数量，超出部分折叠为 "+N" */
    maxCount?: number;
    /** 折叠 "+N" 头像的自定义样式 */
    maxStyle?: CSSProperties;
    /** 传递给子 Avatar 的尺寸（子级未显式指定时生效） */
    size?: number | AvatarSize;
    /** 传递给子 Avatar 的形状 */
    shape?: AvatarShape;
    /** 头像组内头像间距（px） */
    gap?: number;
}

/** AvatarGroup 通过 provide / inject 下发给子 Avatar 的上下文（防止重复注入 props） */
export interface AvatarGroupContext {
    size?: number | AvatarSize;
    shape?: AvatarShape;
}

export const avatarGroupKey: InjectionKey<AvatarGroupContext> = Symbol('avatarGroup');