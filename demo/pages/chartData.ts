import type { ChartProps, ChartType, ChartMapRegion } from '@/components/Chart';

/** 图表分类的轻量元信息；侧栏与切换器共用。 */
export interface ChartPageInfo {
    type: ChartType;
    label: string;
    englishLabel: string;
    desc: string;
}

export const CHART_PAGES: readonly ChartPageInfo[] = [
    { type: 'column', label: '柱状图', englishLabel: 'Column', desc: '分类数值对比，支持分组与正负值堆叠。' },
    { type: 'bar', label: '条状图', englishLabel: 'Bar', desc: '横向比较与排名，长分类名称更容易阅读。' },
    { type: 'line', label: '折线图', englishLabel: 'Line', desc: '连续趋势与多系列比较，支持曲线和缺测断点。' },
    { type: 'area', label: '面积图', englishLabel: 'Area', desc: '用柔和填充表达趋势与体量。' },
    { type: 'mount', label: '山峰图', englishLabel: 'Mountain', desc: '海岛山丘形状的分类数值展示。' },
    { type: 'mix', label: '混合图', englishLabel: 'Mixed', desc: '柱状、折线和面积组合，共用同一数值轴。' },
    { type: 'pie', label: '饼图', englishLabel: 'Pie', desc: '用扇区面积表达各项占比。' },
    { type: 'ring', label: '环形图', englishLabel: 'Ring', desc: '环形占比与中心合计。' },
    { type: 'rose', label: '玫瑰图', englishLabel: 'Rose', desc: '等角度扇区，通过面积表达数值。' },
    { type: 'radar', label: '雷达图', englishLabel: 'Radar', desc: '多个维度的共同量纲对比，缺测不自动补零。' },
    { type: 'scatter', label: '散点图', englishLabel: 'Scatter', desc: '观察两个数值维度的分布与关系。' },
    { type: 'bubble', label: '气泡图', englishLabel: 'Bubble', desc: '气泡面积表达第三个数值维度。' },
    { type: 'arcbar', label: '圆弧进度', englishLabel: 'ArcBar', desc: '多项指标的目标完成进度。' },
    { type: 'gauge', label: '仪表盘', englishLabel: 'Gauge', desc: '单个数值的刻度、指针与当前读数。' },
    { type: 'funnel', label: '漏斗图', englishLabel: 'Funnel', desc: '按业务顺序展示阶段转化，不自动重排数据。' },
    { type: 'word', label: '词云图', englishLabel: 'WordCloud', desc: '按权重排列词条，支持数据查看与点击。' },
    { type: 'candle', label: 'K线图', englishLabel: 'Candlestick', desc: '开盘、收盘、最高、最低四个值的区间变化。' },
    { type: 'time', label: '时序图', englishLabel: 'TimeSeries', desc: '按真实时间间隔排列的数据趋势。' },
    { type: 'map', label: '地图统计', englishLabel: 'Map', desc: '使用调用方提供的区域轮廓展示空间统计。' },
];

const categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const trend = [32, 46, 38, 62, 55, 79, 68];
const comparison = [24, 31, 42, 48, 39, 61, 54];
const proportions = [
    { name: '果园', value: 38 },
    { name: '海岸', value: 27 },
    { name: '露营地', value: 21 },
    { name: '花田', value: 14 },
];

/** 虚构岛屿分区轮廓，使用平面坐标，不代表真实行政区边界。 */
const regions: ChartMapRegion[] = [
    { name: '果园', polygons: [[[0, 2], [1, 5], [4, 6], [5, 3], [3, 2]]] },
    { name: '海岸', polygons: [[[5, 3], [4, 6], [7, 5], [9, 3], [8, 1]]] },
    { name: '露营地', polygons: [[[0, 2], [3, 2], [5, 3], [5, 0], [2, -1]]] },
    { name: '花田', polygons: [[[5, 3], [8, 1], [7, -1], [5, 0]]] },
];

/** 根据类型构造独立示例，所有数据结构都可直接复制用于公开 Chart API。 */
export function exampleProps(type: ChartType, alternate = false): ChartProps {
    const values = alternate ? [51, 35, 72, 49, 86, 60, 93] : trend;
    if (['pie', 'ring', 'rose', 'funnel', 'map'].includes(type))
        return {
            type,
            series: [
                {
                    name: '到访人数',
                    data: proportions.map((p, i) => ({ ...p, value: alternate ? p.value + i * 7 + 5 : p.value })),
                },
            ],
            regions: type === 'map' ? regions : undefined,
            showLabels: type === 'map',
        };
    if (type === 'radar')
        return {
            type,
            categories: ['生态', '服务', '交通', '设施', '景观'],
            max: 100,
            series: [
                { name: '本月', data: alternate ? [86, 70, 90, 60, 85] : [72, 90, 65, 82, 94] },
                { name: '上月', data: [60, 74, 78, 65, 81] },
            ],
        };
    if (type === 'scatter' || type === 'bubble')
        return {
            type,
            series: [
                {
                    name: '海岸活动',
                    data: [
                        { name: '拾贝', x: 12, y: alternate ? 42 : 28, size: 12 },
                        { name: '钓鱼', x: 30, y: 55, size: 25 },
                        { name: '潜水', x: 46, y: 38, size: 18 },
                        { name: '观景', x: 65, y: 72, size: 38 },
                    ],
                },
                {
                    name: '林间活动',
                    data: [
                        { name: '采果', x: 20, y: 42, size: 20 },
                        { name: '野餐', x: 42, y: 64, size: 32 },
                        { name: '露营', x: 58, y: 48, size: 16 },
                    ],
                },
            ],
        };
    if (type === 'gauge' || type === 'arcbar')
        return {
            type,
            min: 0,
            max: 100,
            valueFormatter: (value) => `${Math.round(value)}%`,
            series:
                type === 'gauge'
                    ? [{ name: '岛屿舒适度', data: [alternate ? 91 : 72] }]
                    : [
                          { name: '植树目标', data: [alternate ? 88 : 72] },
                          { name: '步道维护', data: [alternate ? 76 : 58] },
                      ],
        };
    if (type === 'word')
        return {
            type,
            series: [
                {
                    name: '提及次数',
                    data: ['海风', '露营', '星空', '果园', '钓鱼', '日落', '咖啡', '贝壳', '花田', '步道', '朋友', '野餐'].map(
                        (name, i) => ({ name, value: (alternate ? 15 - i : 12 - i) * 8 })
                    ),
                },
            ],
        };
    if (type === 'candle')
        return {
            type,
            categories: ['10/01', '10/02', '10/03', '10/04', '10/05', '10/06'],
            min: 20,
            series: [
                {
                    name: '集市价格（示例）',
                    data: [
                        { open: 40, close: 55, low: 32, high: 62 },
                        { open: 55, close: 48, low: 44, high: 66 },
                        { open: 48, close: alternate ? 70 : 62, low: 42, high: 74 },
                        { open: 62, close: 68, low: 54, high: 78 },
                        { open: 68, close: 51, low: 47, high: 72 },
                        { open: 51, close: 64, low: 45, high: 70 },
                    ],
                },
            ],
        };
    if (type === 'time')
        return {
            type,
            series: [
                {
                    name: '实时到访',
                    data: [0, 5, 15, 20, 45, 60].map((minutes, i) => ({
                        name: `${minutes} 分钟`,
                        x: Date.UTC(2026, 9, 31, 2, minutes),
                        y: values[i],
                    })),
                },
            ],
        };
    return {
        type,
        categories,
        series: [
            { name: '本周', data: values, type: 'column' },
            { name: '上周', data: comparison, type: type === 'mix' ? 'line' : undefined },
        ],
    };
}
