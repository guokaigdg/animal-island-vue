// 背景图案类型（dots-* 波点壁纸的底色与 Card pattern-* 系列一致）：
// - default 奶油色波点（默认）
// - grid 24px 网格（边框色细线）
// - dots-dark-green 深绿波点
// - sprinkles 彩色针糖（圆柱形糖针随机散落）
// - sweet-corner / coffee-break 场景背景图（cover 铺满）
// - 其余 12 色 dots-* 底色对应 Card pattern-* 系列的粉彩波点壁纸
export type BackgroundType =
    | 'default'
    | 'grid'
    | 'dots-dark-green'
    | 'sprinkles'
    | 'sweet-corner'
    | 'coffee-break'
    | 'dots-pink'
    | 'dots-purple'
    | 'dots-blue'
    | 'dots-yellow'
    | 'dots-orange'
    | 'dots-teal'
    | 'dots-green'
    | 'dots-red'
    | 'dots-lime-green'
    | 'dots-yellow-green'
    | 'dots-brown'
    | 'dots-warm-peach-pink';

export interface BackgroundProps {
    /** 背景图案类型（dots-* 底色与 Card pattern-* 系列一致），默认奶油色波点 */
    type?: BackgroundType;
    /** 子内容，渲染在图案背景之上 */
    children?: unknown;
}
