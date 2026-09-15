import type { HTMLAttributes } from 'vue';

/**
 * 实时时钟卡片 props。
 * 对齐 React 端 `TimeProps = React.HTMLAttributes<HTMLDivElement>`：
 * 接受所有原生 div 属性（class / style / id / aria-* 等），
 * 通过 useAttrs 透传到根元素。
 */
export type TimeProps = HTMLAttributes;
