export type BadgeSize = 'small' | 'medium';

export type BadgeColor =
    | 'app-red'
    | 'app-pink'
    | 'app-orange'
    | 'app-yellow'
    | 'app-teal'
    | 'app-green'
    | 'app-blue'
    | 'purple'
    | 'lime-green'
    | 'yellow-green'
    | 'brown'
    | 'warm-peach-pink';

export interface BadgeProps {
    /** 展示的内容：数字 / 字符串；需要图标等结构化内容时改用 #count 插槽 */
    count?: string | number;
    /** 展示封顶的数字值，超过时显示为 `${overflowCount}+` */
    overflowCount?: number;
    /** 数值为 0 时是否展示 */
    showZero?: boolean;
    /** 不展示数字，只展示一个小圆点 */
    dot?: boolean;
    /** 尺寸，仅对数字角标生效（dot 尺寸固定） */
    size?: BadgeSize;
    /** 颜色，与 Card / Tag 调色板一致 */
    color?: BadgeColor;
    // 默认插槽：被包裹的元素；不传即为独立使用
    // #count 插槽：自定义角标内容，优先于 count 属性
}
