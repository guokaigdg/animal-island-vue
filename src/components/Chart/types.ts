import type { VNode } from 'vue';

/** 图表类型；沿用 uCharts 常见类型名称，time 为按时间坐标排列的折线。 */
export type ChartType =
    | 'column'
    | 'bar'
    | 'line'
    | 'area'
    | 'mount'
    | 'mix'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'ring'
    | 'rose'
    | 'radar'
    | 'arcbar'
    | 'gauge'
    | 'funnel'
    | 'word'
    | 'candle'
    | 'map'
    | 'time';

/** 普通数值点；散点/气泡/时序使用 x、y，其他图表使用 value。 */
export interface ChartPoint {
    /** 数据名称，用于提示、扇区图例和地图区域匹配 */
    name?: string;
    /** 数值 */
    value?: number;
    /** 横坐标；time 类型使用毫秒时间戳 */
    x?: number;
    /** 纵坐标 */
    y?: number;
    /** 气泡正数权重，面积与权重成正比，默认 1；非正数不绘制 */
    size?: number;
    /** 单点颜色，优先于系列色 */
    color?: string;
}

/** 单根 K 线，开盘、收盘应位于最低与最高价之间。 */
export interface ChartCandle {
    /** 名称，通常为日期 */
    name?: string;
    /** 开盘值 */
    open: number;
    /** 收盘值 */
    close: number;
    /** 最低值 */
    low: number;
    /** 最高值 */
    high: number;
}

/** null 表示缺测；非有限数和不完整坐标也按缺测处理。 */
export type ChartDatum = number | null | ChartPoint | ChartCandle;

/** 一个数据系列；名称在同一图表内应唯一。 */
export interface ChartSeries {
    /** 图例与提示使用的系列名 */
    name: string;
    /** 数值、坐标或 K 线数据 */
    data: readonly ChartDatum[];
    /** 系列颜色 */
    color?: string;
    /** 仅 mix 使用，默认 column；共用同一数值轴 */
    type?: 'column' | 'line' | 'area';
}

/** 地图区域，使用同一平面坐标系，纵坐标向上；可提供多个闭合轮廓。 */
export interface ChartMapRegion {
    /** 与数据点 name 对应的区域名 */
    name: string;
    /** 多边形轮廓；相交/嵌套轮廓按 evenodd 填充规则绘制 */
    polygons: readonly (readonly (readonly [number, number])[])[];
}

/** 点击数据点返回的原始数据及位置。 */
export interface ChartDataEvent {
    /** 图表类型 */
    type: ChartType;
    /** 原始系列下标 */
    seriesIndex: number;
    /** 原始数据下标 */
    dataIndex: number;
    /** 系列名称 */
    seriesName: string;
    /** 数据名称 */
    name: string;
    /** 数值；K 线为收盘值 */
    value: number;
    /** 调用方传入的原始数据 */
    datum: ChartDatum;
}

/** 提示中的一行数据，比例按当前可见数据计算。 */
export interface ChartTooltipItem extends ChartDataEvent {
    /** 图形颜色 */
    color: string;
    /** 已格式化的数值，包含坐标或 K 线信息 */
    formattedValue: string;
    /** 饼/环/玫瑰占比，或漏斗相对首阶段比例；范围口径为百分数 */
    percentage?: number;
    /** 漏斗相对上一个可见阶段的转化率，百分数；分母为零时省略 */
    conversion?: number;
}

/** 自定义提示的上下文，不包含内部绘图节点。 */
export interface ChartTooltipContext {
    /** 图表类型 */
    type: ChartType;
    /** 当前分类或项目名称 */
    name: string;
    /** 当前可见系列或单点数据 */
    items: readonly ChartTooltipItem[];
    /** 是否通过点击或键盘锁定 */
    locked: boolean;
}

/** 自定义提示渲染结果；返回 null 时隐藏提示。 */
export type ChartTooltipRender = (context: ChartTooltipContext) => VNode | VNode[] | string | number | null;

/** 数据提示配置，兼容原有布尔开关。 */
export interface ChartTooltipOptions {
    /** axis 聚合同分类/同时间/同雷达维度；其余图表回退单点，默认 axis */
    trigger?: 'axis' | 'item';
    /** 显示坐标辅助线，默认 true */
    crosshair?: boolean;
    /** 显示占比与漏斗转化率，默认 true */
    showPercentage?: boolean;
    /** 自定义提示内容；返回 null 时隐藏提示 */
    render?: ChartTooltipRender;
}

/** 海岛风统计图，共用图例、数据提示、键盘访问与空态。 */
export interface ChartProps {
    /** 图表类型，默认 column */
    type?: ChartType;
    /** 数据系列；饼/环/玫瑰/漏斗/词云/地图读取首个系列 */
    series: readonly ChartSeries[];
    /** 分类标签；缺省时采用点名称或从 1 开始的序号 */
    categories?: readonly string[];
    /** 标题 */
    title?: string | VNode;
    /** 辅助说明 */
    description?: string | VNode;
    /** 绘图区高度，默认 300，最小 180px */
    height?: number;
    /** 配色组；系列色与单点色优先于此值 */
    colors?: readonly string[];
    /** 显示可点击图例，默认 true */
    legend?: boolean;
    /** 数据提示开关或配置，默认 true；触摸或键盘聚焦也可查看 */
    tooltip?: boolean | ChartTooltipOptions;
    /** 高亮当前数据或图例并淡化其他图形，默认 true */
    highlight?: boolean;
    /** 点击/Enter/Space 锁定读数，再次激活或 Escape 解除，默认 true */
    selectable?: boolean;
    /** 柱状/条状图采用正负分开的堆叠，默认 false */
    stacked?: boolean;
    /** 折线/面积/混合/时序图使用平滑曲线，山峰图使用圆润峰顶，默认 false */
    smooth?: boolean;
    /** 显示坐标轴与网格，默认 true */
    showAxes?: boolean;
    /** 显示扇区、漏斗或数据点标签，默认 false */
    showLabels?: boolean;
    /** 数值轴/雷达/仪表盘最小值；圆弧与仪表盘默认 0 */
    min?: number;
    /** 数值轴/雷达/仪表盘最大值；圆弧与仪表盘默认 100 */
    max?: number;
    /** 数值格式化，供刻度、数据提示、数值中心使用 */
    valueFormatter?: (value: number) => string;
    /** 数值横轴格式化；时序图默认显示本地 HH:mm */
    xFormatter?: (value: number) => string;
    /** 地图轮廓，仅 map 使用；不内置或请求地理数据 */
    regions?: readonly ChartMapRegion[];
    /** 加载状态，默认 false */
    loading?: boolean;
    /** 空态内容 */
    emptyText?: string | VNode;
    /** 入场淡入，默认 true；遵循减少动态效果设置 */
    animated?: boolean;
}
