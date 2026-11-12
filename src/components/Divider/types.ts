import type { Component } from 'vue';

export type DividerType = 'dashed-brown' | 'thin' | 'hairline' | 'wave-yellow' | 'squiggle';

export interface DividerProps {
    /** 分隔线类型（type 与 icon 二选一，icon 优先） */
    type?: DividerType;
    /**
     * 图标组件（如 naive-icons-vue 的 FishIcon）；传入时渲染「图标 + 连接线」循环相连的装饰分割线，铺满整行。
     * 与 React 版一致：图标自身决定实际尺寸（给图标组件传 size），iconSize 只用于算循环节奏。
     */
    icon?: Component;
    /** 图标占位宽度（px），仅用于计算「图标 + 连接线」的循环节奏，默认 24 */
    iconSize?: number;
    /** 图标间距（px），即相邻图标之间的连接线长度，默认 8（紧密相连） */
    iconGap?: number;
}
