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
    /** 相框类型：'default' 卡片大阴影+大圆角（默认），'bordered' 边框柔和阴影+小圆角，'stamp' 邮票齿孔边框 */
    variant?: 'default' | 'bordered' | 'stamp';
    /** 邮票类型（variant='stamp'）下的发行年份，如「2026」，印在右上角照片上；留空不显示 */
    stampYear?: string;
    /** 点击图片弹出大图预览（默认开启） */
    preview?: boolean;
}
