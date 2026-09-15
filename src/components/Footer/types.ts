import type { IconName } from '../Icon/types';

/**
 * 对齐 React 端 `FooterProps`。
 * 注意：React 的 `className` / `style` 在 Vue 端由 attribute fallthrough 自动透传到根元素，
 * 因此不在此声明为 props（一旦声明，Vue 会把它们从 attrs 中摘除，反而导致透传失效）。
 */
export interface FooterProps {
    /** 图标大小（px），同 Icon 默认 24 */
    size?: number;
    /** 指定单一图标名（共 101 个，如 Heart）；传入时整条链仅用该图标相连铺满，缺省则按全部 101 个图标序列相连 */
    name?: IconName;
}
