import { HTMLAttributes, type Component } from 'vue';
import { ICON_NAMES } from './src/_svg-data';

/**
 * 图标名联合类型：从 ICON_NAMES 派生，避免与 _svg-data.ts 各写一份而漂移。
 *
 * React 侧的 IconName 带 Icon 后缀（'AirplaneIcon'），Vue 侧刻意用裸名（'Airplane'）——
 * 消费方写的是 `<Icon name="Airplane">`。改名会破坏所有既有消费方。
 */
export type IconName = (typeof ICON_NAMES)[number];

/** Vue 图标组件类型（任意可作为 `<component :is>` 的组件） */
export type IconComponent = Component;

export interface SVGIconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    fill?: string;
    title?: string;
    class?: string;
    style?: string | Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * 对齐 React 端 `IconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>`。
 *
 * `@vue-ignore` 是必需的：`Omit<...>` 是映射类型，Vue SFC 编译器无法把它解析成运行时 props 声明，
 * 否则任何引入 Icon.vue 的测试/构建都会报 "Failed to resolve extends base type"。
 * 加 ignore 后，HTML 通用属性（id / data-* / aria-* / class / style 等）作为透传 attrs 处理，
 * Icon.vue 已通过 `v-bind="attrs"` 手动转发，运行时行为与 React 的 `{...rest}` 展开一致。
 */
export interface IconProps extends /* @vue-ignore */ Omit<HTMLAttributes, 'color'> {
    name?: IconName;
    icon?: IconComponent;
    src?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    /** 填充色，默认 none。只作用于根 <svg>，内层图形的 fill 是设计值不受影响（与 React 一致） */
    fill?: string;
    bounce?: boolean;
}

export const NAIVE_PALETTE = {
    ink: '#2A2A2A',
    navy: '#264653',
    orange: '#E76F51',
    yellow: '#E9C46A',
    pink: '#F4A6A4',
    green: '#588157',
    teal: '#2A9D8F',
    brown: '#8B5E3C',
    cream: '#FAEDCD',
    white: '#FFFFFF',
} as const;

export type PaletteColor = keyof typeof NAIVE_PALETTE;

// 分类定义下沉到 _svg-data.ts：图标数据里带 category 字段，类型定义跟着数据走。
// 公共 API 不变——这两个名字仍然从 ./types 导出。
export { ICON_CATEGORIES } from './src/_svg-data';
export type { IconCategory } from './src/_svg-data';
