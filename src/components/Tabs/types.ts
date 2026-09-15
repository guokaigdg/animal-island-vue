import type { VNode } from 'vue';

export interface TabItem {
    /** 唯一 key */
    key: string;
    /** 标签标题 */
    label: string;
    /** 面板内容，对应 React 的 children；不传时由同名具名插槽渲染 */
    children?: VNode;
}

export interface TabsProps {
    /** 标签页配置列表 */
    items: TabItem[];
    /** 当前激活标签 (v-model) — 受控 */
    modelValue?: string;
    /** 当前激活标签 — 受控，对应 React 同名属性（优先级高于 modelValue） */
    activeKey?: string;
    /** 默认激活标签（非受控） */
    defaultActiveKey?: string;
    /** 是否启用叶子摆动动画（React 中已废弃，仅保留参数以对齐 API） */
    leafAnimation?: boolean;
    /** 是否显示选中状态阴影 */
    shadow?: boolean;
    /** 无可见标题时给 tablist 一个无障碍标签 */
    ariaLabel?: string;
}
