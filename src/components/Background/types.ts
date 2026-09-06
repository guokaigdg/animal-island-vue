export type BackgroundType = 'dots' | 'sprinkles';

export interface BackgroundProps {
    /**
     * 背景图案类型，默认 `'dots'`。
     * - `dots`：两层错位圆点波点壁纸
     * - `sprinkles`：圆柱形彩色针糖壁纸（随机散落）
     */
    type?: BackgroundType;
}
