/**
 * 图标渲染的共享运行时，逻辑对齐上游 `guokaigdg/naive-icons` 的 `src/iconProps.ts`。
 *
 * 单独成文件的原因：164 个 `XxxIcon.vue` 薄壳与 `Icon.vue` 都需要这套逻辑，
 * 之前 `parseSvgAttrs` 在每个薄壳里各抄了一份。
 */

/** 基础描边宽度，所有图标的描边都是相对它设计的（相对 48×48 画布） */
export const BASE_STROKE_WIDTH = 3.5;

/**
 * 把 strokeWidth 归一成合法数值。字符串要能缩放（"7" 与 7 等价），
 * 非法值（'abc' / NaN / Infinity / 负数）回落基准。0 合法，表示不描边。
 */
export function resolveStrokeWidth(strokeWidth?: number | string | null): number {
    // Number('') 是 0 而非 NaN，空串必须单独挡掉，否则会静默变成「不描边」
    const raw = typeof strokeWidth === 'string' ? strokeWidth.trim() : strokeWidth;
    const n = typeof raw === 'string' ? Number(raw || NaN) : raw;
    return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : BASE_STROKE_WIDTH;
}

/**
 * 把 strokeWidth 当作相对 BASE_STROKE_WIDTH 的缩放系数。
 *
 * 必须这样而不能只改根 <svg>：stroke-width 可继承，但子元素一旦自带值就不再继承。
 * 库里有 397 处内层自带 stroke-width，其中相当一部分是刻意的粗细层次，
 * 只改根节点会让 strokeWidth={7} 变成「外框 7、内层还是 3.5 与 4」。
 *
 * 默认 3.5 → scale 1，设计值一根线都不变；传 7 → scale 2，整体加倍且层次保持。
 */
export function scaledStroke(strokeWidth?: number | string | null): (designed: number) => number {
    const scale = resolveStrokeWidth(strokeWidth) / BASE_STROKE_WIDTH;
    // 不取整会输出 11.428571428571429 这种 17 位浮点
    return (designed: number) => Math.round(designed * scale * 100) / 100;
}

/**
 * 按 strokeWidth 等比缩放内层图形里的描边宽度。
 *
 * React 版是编译期把 `sw(2)` 写进 JSX；Vue 版内层是 v-html 里的静态字符串，
 * 只能在这里做字符串变换。默认 3.5 → scale 1，原样返回，不产生任何多余的 DOM 属性变更。
 */
export function scaleInnerStrokes(inner: string, strokeWidth?: number | string | null): string {
    if (resolveStrokeWidth(strokeWidth) === BASE_STROKE_WIDTH) return inner;
    const sw = scaledStroke(strokeWidth);
    return inner.replace(/stroke-width="([0-9.]+)"/g, (_match, value: string) => `stroke-width="${sw(Number(value))}"`);
}

/**
 * 解析 `_svg-data.ts` 里存的根属性串。
 *
 * 只认 `key="value"` 这种引号形式 —— JSX 的 `strokeWidth={3.5}` 会被静默丢弃，
 * 所以生成器必须把 attrs 写成 SVG 原生 kebab 写法。
 */
export function parseSvgAttrs(attrStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /([a-zA-Z-]+)=(?:"([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrStr)) !== null) {
        result[m[1]] = m[2] !== undefined ? m[2] : m[3];
    }
    return result;
}
