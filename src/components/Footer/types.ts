/**
 * 对齐 React 端 `FooterProps`：版权栏组件。
 * React 的 `className` / `style` 在 Vue 端由 attribute fallthrough 自动透传到根 <footer>，
 * 因此不在此声明为 props（一旦声明，Vue 会把它们从 attrs 中摘除，反而导致透传失效）。
 */
export interface FooterProps {
    /** 版权文案，默认 `All Rights Reserved.` */
    text?: string;
    /** 年份，默认取当前年份（动态获取） */
    year?: number;
}
