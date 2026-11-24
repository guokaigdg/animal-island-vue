import type { ChartMark, ChartScene } from './geometry';
import type { ChartType } from './types';

/** 支持同分类对比的图表；散点与气泡的横坐标相同不代表同一分类。 */
export const SHARED_TYPES = new Set<ChartType>([
    'column',
    'bar',
    'line',
    'area',
    'mount',
    'mix',
    'candle',
    'time',
    'radar',
]);

/** 交互身份包含业务名称与图表类型，避免换图或换系列后误锁定相同数组下标。 */
export function interactionKey(mark: ChartMark): string {
    // JSON 编码避免名称中包含分隔符造成身份碰撞。
    return JSON.stringify([mark.point.type, mark.point.seriesName, mark.point.name, mark.key]);
}

/** 同分类聚合保留缺测，不跨时间戳合并时序值，也不把下标相同的散点混为一组。 */
export function relatedMarks(marks: ChartMark[], active: ChartMark, shared: boolean): ChartMark[] {
    // 时序图必须按真实 x 关联，不能按原始数组下标关联不同采样时间。
    if (!shared) return [active];
    return marks.filter((mark) =>
        active.point.type === 'time' ? mark.point.x === active.point.x : mark.point.dataIndex === active.point.dataIndex
    );
}

/** 坐标图按行列、雷达按维度角度命中；单项提示限制在数据点邻近范围。 */
export function nearestMark(scene: ChartScene, x: number, y: number, shared: boolean): ChartMark | undefined {
    const { plot, polarPlot, marks } = scene;
    if (polarPlot) {
        if (Math.hypot(x - polarPlot.cx, y - polarPlot.cy) > polarPlot.radius) return undefined;
    } else if (!plot || x < plot.left || x > plot.right || y < plot.top || y > plot.bottom) {
        return undefined;
    }
    const angle = polarPlot ? Math.atan2(x - polarPlot.cx, polarPlot.cy - y) : 0;
    let nearest: ChartMark | undefined;
    let distance = Infinity;
    // 雷达按维度索引定位，零值仍属于原维度；余弦距离保证首尾角度连续。
    for (const mark of marks) {
        let value = Math.hypot(x - mark.x, y - mark.y);
        if (shared && polarPlot) {
            value = 1 - Math.cos(angle - (Math.PI * 2 * mark.point.dataIndex) / polarPlot.count);
        } else if (shared && plot) {
            value = Math.abs((plot.horizontal ? y : x) - (mark.axisPosition ?? mark.x));
        }
        if (
            value < distance ||
            (value === distance &&
                nearest &&
                Math.hypot(x - mark.x, y - mark.y) < Math.hypot(x - nearest.x, y - nearest.y))
        ) {
            nearest = mark;
            distance = value;
        }
    }
    return shared || distance <= 24 ? nearest : undefined;
}
