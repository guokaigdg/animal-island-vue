// 图标组件出口。
//
// 内置图标全部来自 npm 包 naive-icons-vue：升级图标 = 升级 npm 依赖，
// 本仓库不再自研维护 SVG 副本。

export { default as Icon } from './Icon.vue';

// 内置图标注册表：图标名清单与「名字 → 组件」映射
export { ICON_MAP, ICON_NAMES } from './_icons';

// 分类与扁平清单
export { ICON_CATEGORIES, ICON_LIST, ICONS_BY_CATEGORY } from './_categories';

// 调色板
export { NAIVE_PALETTE } from './types';

export type { IconProps, IconName } from './types';
export type { IconComponent, SVGIconProps, PaletteColor, IconCategory } from './types';

// 全部内置图标组件
export * from './icons';
