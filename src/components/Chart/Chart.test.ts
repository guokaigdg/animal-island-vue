import { describe, it, expect, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Chart from './Chart.vue';
import { normalize, axisTicks, polar } from './geometry';
import { cartesianScene } from './Cartesian';
import { radarScene } from './Polar';
import { nearestMark, relatedMarks } from './interaction';
import type { ChartProps, ChartType } from './types';

/** 普通类型复用同一组数据，便于验证缺测不会改变原始下标。 */
const basicSeries = [{ name: '到访', data: [12, null, 25] }];

const MARK = '[data-chart-mark]';

type MountProps = Partial<ChartProps> & { series: ChartProps['series']; onDataClick?: (e: unknown) => void };
const mountChart = (props: MountProps): VueWrapper => mount(Chart, { props }) as VueWrapper;
const markByName = (wrapper: VueWrapper, name: string) =>
    wrapper.findAll(MARK).find((m) => m.attributes('aria-label') === name);
const tooltip = (wrapper: VueWrapper) => wrapper.find('[role="tooltip"]');

describe('Chart geometry helpers', () => {
    it('过滤无效输入和非法权重，不将 null 当作零值', () => {
        expect(
            normalize({ series: [{ name: '测量', data: [null, NaN, Infinity, 0, -4] }] }).map((p) => p.value)
        ).toEqual([0, -4]);
        const props: ChartProps = {
            type: 'bubble',
            series: [{ name: '测量', data: [{ x: 1 }, { x: 1, y: 2, size: 0 }, { x: 3, y: 4, size: 9 }] }],
        };
        expect(normalize(props)).toHaveLength(1);
        expect(normalize(props)[0]).toMatchObject({ dataIndex: 2, x: 3, value: 4, size: 9 });
    });

    it('时序按真实时间聚合，分类空白命中使用分类中心且不越出绘图区', () => {
        const props: ChartProps = {
            type: 'time',
            series: [
                {
                    name: '甲',
                    data: [
                        { x: 1000, y: 10 },
                        { x: 2000, y: 20 },
                    ],
                },
                { name: '乙', data: [{ x: 2000, y: 30 }] },
            ],
        };
        const scene = cartesianScene({ props, points: normalize(props), width: 640, height: 300, format: String });
        expect(relatedMarks(scene.marks, scene.marks[0], true)).toHaveLength(1);
        expect(relatedMarks(scene.marks, scene.marks[1], true).map((mark) => mark.point.value)).toEqual([20, 30]);
        expect(nearestMark(scene, scene.marks[0].x, scene.plot!.top + 1, true)?.point.x).toBe(1000);
        expect(nearestMark(scene, 0, 0, true)).toBeUndefined();
    });

    it('雷达空白按角度命中维度，零值和首尾角度保留归属，单项提示与圆外保持边界', () => {
        const props: ChartProps = {
            type: 'radar',
            categories: ['甲', '乙', '丙', '丁'],
            max: 100,
            series: [
                { name: '本期', data: [0, 60, null, 50] },
                { name: '上期', data: [0, 70, 40, 55] },
            ],
        };
        const scene = radarScene({ props, points: normalize(props), width: 640, height: 300, format: String });
        const { cx, cy, radius } = scene.polarPlot!;
        const beforeTop = polar(cx, cy, radius * 0.9, -0.05);
        const afterTop = polar(cx, cy, radius * 0.9, 0.05);
        expect(nearestMark(scene, ...beforeTop, true)?.point.dataIndex).toBe(0);
        expect(nearestMark(scene, ...afterTop, true)?.point.dataIndex).toBe(0);
        const right = polar(cx, cy, radius * 0.95, Math.PI / 2);
        const active = nearestMark(scene, ...right, true)!;
        expect(active.point.dataIndex).toBe(1);
        expect(relatedMarks(scene.marks, active, true).map((mark) => mark.point.value)).toEqual([60, 70]);
        expect(nearestMark(scene, cx, cy + radius * 0.9, true)?.point.seriesName).toBe('上期');
        expect(nearestMark(scene, ...beforeTop, false)).toBeUndefined();
        expect(nearestMark(scene, cx + radius + 1, cy, true)).toBeUndefined();
        expect(nearestMark(scene, cx + radius * 0.9, cy + radius * 0.9, true)).toBeUndefined();
    });

    it('自动刻度易读，同时尊重显式范围', () => {
        expect(axisTicks([32, 79])).toEqual([0, 20, 40, 60, 80]);
        expect(axisTicks([-12, 26])[0]).toBeLessThanOrEqual(-12);
        expect(axisTicks([32, 79], 10, 70)).toEqual([10, 25, 40, 55, 70]);
    });
});

describe('Chart', () => {
    it.each<ChartType>(['column', 'bar', 'line', 'area', 'mount', 'mix', 'pie', 'ring', 'rose', 'funnel', 'word'])(
        '%s 保留有效数据和原始回调下标',
        async (type) => {
            const onDataClick = vi.fn();
            const wrapper = mountChart({ type, title: '到访统计', series: basicSeries, onDataClick });
            const marks = wrapper.findAll(MARK);
            expect(marks).toHaveLength(2);
            const third = markByName(wrapper, '到访，3，25')!;
            await third.trigger('click');
            expect(onDataClick).toHaveBeenCalledWith(expect.objectContaining({ type, dataIndex: 2, value: 25 }));
        }
    );

    it('同分类提示聚合系列，锁定后悬浮其他点不改变读数', async () => {
        const wrapper = mountChart({
            categories: ['周一', '周二'],
            series: [
                { name: '本周', data: [10, 20] },
                { name: '上周', data: [8, 16] },
            ],
        });
        const monday = markByName(wrapper, '本周，周一，10')!;
        await monday.trigger('click');
        expect(tooltip(wrapper).text()).toContain('上周8');
        const tuesday = markByName(wrapper, '本周，周二，20')!;
        await tuesday.trigger('pointerenter');
        // 锁定后悬浮其他点不改变读数
        expect(tooltip(wrapper).text()).toContain('周一');
    });

    it('图例全部隐藏后可恢复，数据明细仍保留', async () => {
        const wrapper = mountChart({ title: '到访统计', series: basicSeries });
        const toggle = wrapper.findAll('button').find((b) => b.text() === '到访')!;
        await toggle.trigger('click');
        expect(toggle.attributes('aria-pressed')).toBe('false');
        expect(wrapper.find('[role="status"]').text()).toContain('所有图例已隐藏');
        expect(wrapper.text()).toContain('查看数据（2）');
        await toggle.trigger('click');
        expect(toggle.attributes('aria-pressed')).toBe('true');
        expect(wrapper.findAll(MARK)).toHaveLength(2);
    });

    it('键盘 Enter 和 Space 激活数据点，Escape 关闭提示', async () => {
        const onDataClick = vi.fn();
        const wrapper = mountChart({ series: [{ name: '目标', data: [42] }], onDataClick });
        const mark = wrapper.find(MARK);
        await mark.trigger('keydown', { key: 'Enter' });
        await mark.trigger('keydown', { key: ' ' });
        expect(onDataClick).toHaveBeenCalledTimes(2);
        expect(tooltip(wrapper).exists()).toBe(true);
        await wrapper.find('.animal-chart').trigger('keydown', { key: 'Escape' });
        expect(tooltip(wrapper).exists()).toBe(false);
    });

    it('加载态与自定义空态不残留数据图形', async () => {
        const wrapper = mountChart({ series: basicSeries, loading: true });
        expect(wrapper.find('[role="figure"]').attributes('aria-busy')).toBe('true');
        expect(wrapper.find('[role="status"]').text()).toContain('正在整理数据');
        expect(wrapper.find('svg').exists()).toBe(false);
        await wrapper.setProps({ loading: false, series: [], emptyText: '尚无访客' });
        expect(wrapper.find('[role="status"]').text()).toContain('尚无访客');
        await wrapper.setProps({ emptyText: h('section', '自定义完整空态') });
        expect(wrapper.find('[role="status"]').text()).toContain('自定义完整空态');
    });

    it('分类折线在缺测处断开，零值仍可访问', () => {
        const wrapper = mountChart({ type: 'line', series: [{ name: '测量', data: [4, 6, null, 0, 8] }] });
        const linePaths = wrapper.findAll('path[stroke-linecap="round"]');
        expect(linePaths).toHaveLength(2);
        expect(linePaths[0].attributes('d')).toMatch(/^M.+ L/);
        expect(markByName(wrapper, '测量，4，0')).toBeTruthy();
    });

    it('堆叠柱的正负值分别从零开始累计', () => {
        const wrapper = mountChart({
            stacked: true,
            min: -20,
            max: 20,
            series: [
                { name: '甲', data: [10, -5] },
                { name: '乙', data: [5, -10] },
            ],
        });
        const bars = wrapper.findAll(`${MARK} rect`);
        const heights = bars.map((bar) => Number(bar.attributes('height')));
        expect(heights[0]).toBeCloseTo(heights[2] * 2);
        expect(heights[3]).toBeCloseTo(heights[1] * 2);
        expect(Number(bars[2].attributes('y')) + heights[2]).toBeCloseTo(Number(bars[0].attributes('y')));
        expect(Number(bars[1].attributes('y')) + heights[1]).toBeCloseTo(Number(bars[3].attributes('y')));
    });

    it('数值坐标保留真实间隔，气泡面积与权重成正比', async () => {
        const wrapper = mountChart({
            type: 'bubble',
            series: [
                {
                    name: '活动',
                    data: [
                        { x: 0, y: 5, size: 1 },
                        { x: 10, y: 6, size: 4 },
                    ],
                },
            ],
        });
        const circles = wrapper.findAll(`${MARK} circle`);
        expect(Number(circles[1].attributes('r')) / Number(circles[0].attributes('r'))).toBeCloseTo(2);
        await wrapper.setProps({
            type: 'time',
            series: [
                {
                    name: '到访',
                    data: [
                        { x: 1000, y: 2 },
                        { x: 2000, y: 3 },
                        { x: 5000, y: 4 },
                    ],
                },
            ],
        });
        const xs = wrapper.findAll(`${MARK} circle`).map((circle) => Number(circle.attributes('cx')));
        expect((xs[2] - xs[1]) / (xs[1] - xs[0])).toBeCloseTo(3);
    });

    it('散点提示保留横纵坐标和自定义格式', async () => {
        const wrapper = mountChart({
            type: 'scatter',
            xFormatter: (v: number) => `${v}天`,
            valueFormatter: (v: number) => `${v}人`,
            series: [{ name: '访客', data: [{ x: 3, y: 8 }] }],
        });
        const mark = markByName(wrapper, '访客，1，3天 · 8人')!;
        await mark.trigger('click');
        expect(tooltip(wrapper).text()).toContain('3天 · 8人');
    });

    it('单项环形仍有内环，零值饼图显示空态', async () => {
        const wrapper = mountChart({ type: 'ring', series: [{ name: '人数', data: [12] }] });
        const path = wrapper.find(`${MARK} path`).attributes('d')!;
        // SVG 整圆首尾重合，需要外环与内环各两段圆弧。
        expect(path.match(/ A/g)).toHaveLength(4);
        expect(wrapper.text()).toContain('合计');
        await wrapper.setProps({ type: 'pie', series: [{ name: '人数', data: [0, -4] }] });
        expect(wrapper.find('[role="status"]').text()).toContain('暂无数据');
    });

    it('雷达缺测系列不补成零值多边形', () => {
        const wrapper = mountChart({
            type: 'radar',
            categories: ['甲', '乙', '丙'],
            series: [{ name: '本期', data: [30, null, 60] }],
        });
        expect(wrapper.findAll('polygon[stroke-width="2.5"]')).toHaveLength(0);
        expect(wrapper.findAll(MARK)).toHaveLength(2);
    });

    it.each<ChartType>(['arcbar', 'gauge'])('%s 限制图形范围但提示仍保留实际值', async (type) => {
        const wrapper = mountChart({ type, series: [{ name: '目标', data: [150] }], max: 100 });
        const mark = wrapper.find(MARK);
        await mark.trigger('click');
        expect(tooltip(wrapper).text()).toContain('150');
    });

    it('K 线提示包含四个值，非法价格区间不绘制', async () => {
        const wrapper = mountChart({
            type: 'candle',
            series: [
                {
                    name: '集市',
                    data: [
                        { open: 4, close: 6, low: 3, high: 8 },
                        { open: 10, close: 6, low: 3, high: 8 },
                    ],
                },
            ],
        });
        const marks = wrapper.findAll(MARK);
        expect(marks).toHaveLength(1);
        await marks[0].trigger('click');
        expect(tooltip(wrapper).text()).toContain('开 4 / 收 6 / 低 3 / 高 8');
    });

    it('地图按区域名关联，不按输入顺序配对', async () => {
        const onDataClick = vi.fn();
        const wrapper = mountChart({
            type: 'map',
            onDataClick,
            series: [
                {
                    name: '人数',
                    data: [
                        { name: '乙', value: 8 },
                        { name: '甲', value: 4 },
                    ],
                },
            ],
            regions: [
                { name: '甲', polygons: [[[0, 0], [1, 0], [1, 1]]] },
                { name: '乙', polygons: [[[1, 0], [2, 0], [2, 1]]] },
            ],
        });
        const mark = markByName(wrapper, '人数，甲，4')!;
        await mark.trigger('click');
        expect(onDataClick).toHaveBeenCalledWith(expect.objectContaining({ name: '甲', dataIndex: 1, value: 4 }));
    });

    it('提示开关、比例口径及自定义内容保持一致，图例可全部恢复', async () => {
        const series = [
            {
                name: '区域',
                data: [
                    { name: '果园', value: 30 },
                    { name: '海岸', value: 70 },
                ],
            },
        ];
        const wrapper = mountChart({ type: 'ring', series });
        await markByName(wrapper, '区域，果园，30')!.trigger('click');
        expect(tooltip(wrapper).text()).toContain('占比 30%');
        await wrapper.findAll('button').find((b) => b.text() === '海岸')!.trigger('click');
        await markByName(wrapper, '区域，果园，30')!.trigger('click');
        expect(tooltip(wrapper).text()).toContain('占比 100%');
        await wrapper.findAll('button').find((b) => b.text() === '果园')!.trigger('click');
        expect(wrapper.find('[role="status"]').text()).toContain('所有图例已隐藏');
        await wrapper.findAll('button').find((b) => b.text() === '恢复全部图例')!.trigger('click');
        expect(wrapper.findAll('button').find((b) => b.text() === '海岸')!.attributes('aria-pressed')).toBe('true');

        await wrapper.setProps({
            selectable: false,
            tooltip: { render: ({ items }: { items: { percentage?: number }[] }) => h('span', `自定义：${items[0].percentage}%`) },
        });
        await markByName(wrapper, '区域，海岸，70')!.trigger('pointerenter');
        expect(tooltip(wrapper).text()).toContain('自定义：70%');
        await wrapper.setProps({ tooltip: false });
        await nextTick();
        expect(tooltip(wrapper).exists()).toBe(false);
    });

    it('class 与 aria-label 透传到根节点', () => {
        const wrapper = mount(Chart, {
            props: { series: basicSeries },
            attrs: { class: 'my-chart', 'aria-label': '自定义图表' },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('my-chart')).toBe(true);
        expect(root.classList.contains('animal-chart')).toBe(true);
        expect(root.getAttribute('aria-label')).toBe('自定义图表');
    });
});
