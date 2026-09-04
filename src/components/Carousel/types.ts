export interface CarouselProps {
    /** 当前索引（v-model）— 受控 */
    modelValue?: number;
    /** 非受控模式的初始索引 */
    defaultActiveIndex?: number;
    /** 是否自动播放 */
    autoplay?: boolean;
    /** 自动播放间隔，单位毫秒 */
    interval?: number;
    /** 是否首尾循环 */
    loop?: boolean;
    /** 是否显示左右箭头 */
    showArrows?: boolean;
    /** 是否显示圆点指示器 */
    showDots?: boolean;
    /** 鼠标悬停时是否暂停自动播放；键盘焦点进入时始终暂停 */
    pauseOnHover?: boolean;
    /** 无障碍标签 */
    ariaLabel?: string;
}
