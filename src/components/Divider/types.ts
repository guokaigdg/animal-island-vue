import type { IconName } from '../Icon/types';

export type DividerType = 'dashed-brown' | 'thin' | 'hairline' | 'wave-yellow' | 'squiggle';

/** 单图标相连分割线可用的图标名（复用内置图标） */
export type DividerIconName = IconName;

export interface DividerProps {
    /** 分隔线类型（type 与 icon 二选一，icon 优先） */
    type?: DividerType;
    /** 指定单一图标名；传入时渲染「图标 + 连接线」循环相连的装饰分割线，铺满整行 */
    icon?: DividerIconName;
    /** 图标大小（px），同 Icon 默认 24 */
    iconSize?: number;
    /** 图标间距（px），即相邻图标之间的连接线长度，默认 8（紧密相连） */
    iconGap?: number;
}
