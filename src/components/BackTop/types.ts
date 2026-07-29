export interface BackTopProps {
    /** 滚动容器，默认 window */
    target?: () => HTMLElement | Window;
    /** 滚动多少 px 后显示，默认 400 */
    visibilityHeight?: number;
    /** 点击回到顶部后的回调 */
    onClick?: (e: MouseEvent) => void;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: Record<string, string | number>;
    /** 滚动动画时长(ms)，默认 300 */
    duration?: number;
}
