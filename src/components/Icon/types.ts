import { HTMLAttributes, type Component } from 'vue';

export type IconName =
    | 'Airplane'
    | 'Anchor'
    | 'Apple'
    | 'Balloon'
    | 'Bear'
    | 'Bee'
    | 'Bell'
    | 'Bicycle'
    | 'Bird'
    | 'Book'
    | 'Bookmark'
    | 'Bulb'
    | 'Butterfly'
    | 'Cactus'
    | 'Cake'
    | 'Calendar'
    | 'Camera'
    | 'Candle'
    | 'Car'
    | 'Cart'
    | 'Cat'
    | 'Chat'
    | 'Check'
    | 'Cherry'
    | 'Clock'
    | 'Close'
    | 'Cloud'
    | 'Code'
    | 'Coffee'
    | 'Compass'
    | 'CreditCard'
    | 'Dog'
    | 'Donut'
    | 'Download'
    | 'Edit'
    | 'Eye'
    | 'File'
    | 'Fish'
    | 'Flag'
    | 'Flame'
    | 'Flower'
    | 'Folder'
    | 'Fox'
    | 'Frog'
    | 'Gift'
    | 'Globe'
    | 'Headphones'
    | 'Heart'
    | 'Home'
    | 'Icecream'
    | 'Image'
    | 'Key'
    | 'Ladybug'
    | 'Lamp'
    | 'Leaf'
    | 'Lemon'
    | 'Location'
    | 'Lock'
    | 'Magnet'
    | 'Mail'
    | 'Map'
    | 'Mic'
    | 'Moon'
    | 'Mushroom'
    | 'Music'
    | 'Owl'
    | 'Paintbrush'
    | 'Pencil'
    | 'Penguin'
    | 'Phone'
    | 'Play'
    | 'Plus'
    | 'Rabbit'
    | 'Rainbow'
    | 'Refresh'
    | 'Rocket'
    | 'Sailboat'
    | 'Save'
    | 'Search'
    | 'Settings'
    | 'Share'
    | 'ShoppingBag'
    | 'Smile'
    | 'Snail'
    | 'Snowflake'
    | 'Star'
    | 'Strawberry'
    | 'Sun'
    | 'Tag'
    | 'Thermometer'
    | 'ThumbsUp'
    | 'Train'
    | 'Trash'
    | 'Tree'
    | 'Trophy'
    | 'Umbrella'
    | 'Upload'
    | 'User'
    | 'Video'
    | 'Watermelon'
    | 'Wifi';

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
} as const;

export type PaletteColor = keyof typeof NAIVE_PALETTE;

export const ICON_CATEGORIES = [
    'interface',
    'action',
    'media',
    'navigation',
    'communication',
    'nature',
    'animals',
    'food',
    'objects',
    'transport',
    'emoji',
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];
