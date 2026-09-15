import type { VNode } from 'vue';

export interface TypewriterProps {
    /** 需要逐字显示的内容，支持 VNode，保留原有元素结构/换行/样式（对应默认插槽） */
    children?: VNode | VNode[] | string;
    /** 每字间隔 (ms), 默认 90 */
    speed?: number;
    /**
     * 外部触发重新播放。值变化即重启动画。
     * 常见用法是把弹窗的 open 次数或一个递增的 key 传进来。
     */
    trigger?: unknown;
    /** 是否自动从头开始播放，默认 true；设为 false 可直接显示全部 */
    autoPlay?: boolean;
    /** 播放完成回调 */
    onDone?: () => void;
}
