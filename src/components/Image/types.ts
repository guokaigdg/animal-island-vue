export type ImageColor =
    | 'white'
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

export interface ImageProps {
    /** 图片地址（必填） */
    src: string;
    /** 图片替代文本（无障碍）；留空表示装饰性图片 */
    alt?: string;
    /** 图片宽度 */
    width?: number | string;
    /** 图片高度 */
    height?: number | string;
    /** 背景颜色（Card pattern 同款底色，无花纹；'white' 为纯白，默认 white） */
    color?: ImageColor;
    /** 是否启用懒加载 */
    lazy?: boolean;
    /** 点击图片弹出大图预览（默认开启） */
    preview?: boolean;
}
