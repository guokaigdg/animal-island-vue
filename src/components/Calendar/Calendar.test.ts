import { describe, it, expect, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import Calendar from './Calendar.vue';
import type { CalendarEvent, CalendarEventTitle } from './types';

const MONTH_LABEL = '.animal-calendar__month-label';
const CELL = 'animal-calendar__cell';
const MORE = '.animal-calendar__more';
const EVENT = '.animal-calendar__event';
const TODAY_BTN = '.animal-calendar__today-btn';
const BODY = '.animal-calendar__body';
const HEADER = '.animal-calendar__header';
const LAYER = '.animal-calendar__events-layer';

const pad = (n: number) => `${n}`.padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthLabel = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月`;

const setup = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) => {
    const wrapper = mount(Calendar, { props, ...options }) as VueWrapper;
    const cell = (date: string) => wrapper.find(`[data-date="${date}"]`);
    const monthText = () => wrapper.find(MONTH_LABEL).text();
    const style = (el: Element) => (el as HTMLElement).style;
    const press = async (date: string, button = 0) => {
        await cell(date).trigger('mousedown', { button });
    };
    return { wrapper, cell, monthText, style, press };
};

/** 走一遍真实拖拽：按下 → 经过中间格子 → 在终点抬起 */
const drag = async (wrapper: VueWrapper, from: string, to: string) => {
    const dates = wrapper.findAll('[data-date]').map((w) => w.attributes('data-date')!);
    const fromIndex = dates.indexOf(from);
    const toIndex = dates.indexOf(to);
    const step = fromIndex <= toIndex ? 1 : -1;
    const path: string[] = [];
    for (let i = fromIndex; i !== toIndex + step; i += step) path.push(dates[i]);

    await wrapper.find(`[data-date="${path[0]}"]`).trigger('mousedown', { button: 0 });
    for (const date of path.slice(1)) {
        await wrapper.find(`[data-date="${date}"]`).trigger('mouseenter');
    }
    await wrapper.trigger('pointerup');
};

const eventsOf = (list: Array<{ title?: CalendarEventTitle; start: string } & Partial<CalendarEvent>>) =>
    list as CalendarEvent[];

/** 受控包装：验证组件完全跟随父级 state。 */
const ControlledPanelHost = defineComponent({
    props: { initial: { type: String, required: true } },
    emits: ['change'],
    setup(props, { emit }) {
        const panel = ref(props.initial);
        return () =>
            h(Calendar, {
                panelValue: panel.value,
                'onUpdate:panelValue': (v: string) => {
                    panel.value = v;
                },
                onPanelChange: (v: string) => emit('change', v),
            });
    },
});

const ControlledValueHost = defineComponent({
    props: { initial: { type: String, required: true } },
    emits: ['change'],
    setup(props, { emit }) {
        const value = ref(props.initial);
        return () =>
            h(Calendar, {
                value: value.value,
                panelValue: '2026-08',
                'onUpdate:modelValue': (v: string) => {
                    value.value = v;
                },
                onChange: (v: string) => emit('change', v),
            });
    },
});

describe('Calendar', () => {
    describe('rendering', () => {
        it('渲染当前月份面板：年月标签 + 星期表头 + 42 个日期格', () => {
            const { wrapper, monthText } = setup({ panelValue: '2026-08-10' });
            expect(monthText()).toBe('2026年8月');
            expect(wrapper.find('[role="grid"]').exists()).toBe(true);
            expect(wrapper.findAll('[role="columnheader"]').map((w) => w.text())).toEqual([
                '日',
                '一',
                '二',
                '三',
                '四',
                '五',
                '六',
            ]);
            expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42);
        });

        it('面板固定补满 6 周，首尾带出上下月日期', () => {
            const { cell } = setup({ panelValue: '2026-08' });
            expect(cell('2026-07-26').exists()).toBe(true);
            expect(cell('2026-09-05').exists()).toBe(true);
            expect(cell('2026-07-26').text()).toContain('26');
        });

        it('默认选中今天，并按选中日期定位面板', () => {
            const today = new Date();
            const { cell, monthText } = setup();
            expect(monthText()).toBe(monthLabel(today));
            expect(cell(dateKey(today)).attributes('aria-selected')).toBe('true');
        });

        it('非受控 defaultValue 选中指定日期', () => {
            const { cell } = setup({ defaultValue: '2026-08-10', panelValue: '2026-08' });
            expect(cell('2026-08-10').attributes('aria-selected')).toBe('true');
            expect(cell('2026-08-11').attributes('aria-selected')).toBeUndefined();
        });

        it('受控 value 驱动选中态', async () => {
            const { wrapper, cell } = setup({ value: '2026-08-10', panelValue: '2026-08' });
            expect(cell('2026-08-10').attributes('aria-selected')).toBe('true');
            await wrapper.setProps({ value: '2026-08-20' });
            expect(cell('2026-08-20').attributes('aria-selected')).toBe('true');
            expect(cell('2026-08-10').attributes('aria-selected')).toBeUndefined();
        });

        it('面板按自身宽度推导缩放系数，事项条随之定位', () => {
            // 7/26 是视图第一格：top = 表头 + 0 × 单元格 + 日期数字带
            const { wrapper, style } = setup({
                panelValue: '2026-08',
                width: 750,
                events: eventsOf([{ title: '晨会', start: '2026-07-26' }]),
            });
            // 750 正好是基准宽度，系数为 1；top = 表头 32 + 周序 0 + 数字带 42 + 半行 11
            expect(style(wrapper.element).getPropertyValue('--animal-calendar-scale')).toBe('1');
            const bar = wrapper.find('[data-color]').element;
            expect(style(bar).getPropertyValue('--animal-calendar-bar-top')).toBe('85px');
        });

        it('系数随宽度线性放大，并被上下限夹住', async () => {
            const { wrapper, style } = setup({ panelValue: '2026-08', width: 1125 });
            expect(style(wrapper.element).getPropertyValue('--animal-calendar-scale')).toBe('1.5');

            await wrapper.setProps({ width: 320 });
            expect(style(wrapper.element).getPropertyValue('--animal-calendar-scale')).toBe('0.6');

            await wrapper.setProps({ width: 4000 });
            expect(style(wrapper.element).getPropertyValue('--animal-calendar-scale')).toBe('2');
        });

        it('同一周的第 2 条事项仍落在单元格内，不压到下一周', () => {
            // 回归：日期数字带 + 2 条事项行必须塞得进单元格（42 + 22 × 2 = 86 ≤ 104），
            // 否则第 2 行事项条会盖住下一周的日期数字
            const { wrapper, style } = setup({
                panelValue: '2026-08',
                width: 750,
                events: eventsOf([
                    { title: 'A', start: '2026-08-03' },
                    { title: 'B', start: '2026-08-03' },
                ]),
            });
            const tops = wrapper
                .findAll('[data-color]')
                .map((bar) => Number.parseFloat(style(bar.element).getPropertyValue('--animal-calendar-bar-top')));
            // 8/3 落在视图第 2 周：top = 表头 32 + 1 × 104 + 数字带 42 + (行序 + 0.5) × 22
            expect(tops).toEqual([189, 211]);
            // 最后一条的条底（top + 半行 + 半个条高）仍在单元格高 104 之内
            const lastRowBottom = 32 + 1 * 104 + 42 + 1.5 * 22 + 17 / 2;
            expect(lastRowBottom).toBeLessThan(32 + 2 * 104);
        });

        it('width 设面板宽度，且不覆盖调用方传入的 style.width', async () => {
            const { wrapper, style } = setup({ panelValue: '2026-08', width: 900 });
            expect(style(wrapper.element).width).toBe('900px');

            await wrapper.setProps({ width: 900 });
            await wrapper.vm.$forceUpdate();
            const overridden = mount(Calendar, {
                props: { panelValue: '2026-08', width: 900 },
                attrs: { style: 'width: 600px;' },
            });
            expect((overridden.element as HTMLElement).style.width).toBe('600px');
        });

        it('头部常显：年月标签、年/月箭头与「今天」都在', () => {
            const { wrapper, monthText } = setup({ panelValue: '2026-08' });
            expect(monthText()).toBe('2026年8月');
            ['上一年', '上个月', '下个月', '下一年'].forEach((label) => {
                expect(wrapper.find(`[aria-label="${label}"]`).exists()).toBe(true);
            });
            expect(wrapper.find(TODAY_BTN).text()).toBe('今天');
        });

        it('class 与 style 透传到根节点', () => {
            const wrapper = mount(Calendar, { attrs: { class: 'my-cal', style: 'margin-top: 8px;' } });
            expect(wrapper.classes()).toContain('animal-calendar');
            expect(wrapper.classes()).toContain('my-cal');
            expect(wrapper.attributes('style')).toContain('margin-top: 8px');
        });

        it('aria-label / aria-labelledby 落到 grid 容器上', () => {
            const wrapper = mount(Calendar, { props: { ariaLabel: '排期', ariaLabelledBy: 'cal-label' } });
            expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('排期');
            expect(wrapper.find('[role="grid"]').attributes('aria-labelledby')).toBe('cal-label');
        });
    });

    describe('events', () => {
        it('同日事项渲染在对应单元格上方', () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([
                    { title: '晨会', start: '2026-08-10' },
                    { title: '评审', start: '2026-08-10' },
                ]),
            });
            expect(wrapper.findAll('.animal-calendar__event-title').map((w) => w.text())).toEqual(['晨会', '评审']);
            expect(cell('2026-08-10').attributes('aria-label')).toBe('2026-08-10 2 项事项：晨会，评审');
        });

        it('跨日期事项渲染成横跨多列的连续条', () => {
            const { wrapper, style } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '海岛团建', start: '2026-08-12', end: '2026-08-18', color: 'amber' }]),
            });
            // 8/12（周三）起，先跨到当周周六，共 4 格；8/16-8/18 落在下一周，是第二个片段
            const bars = wrapper.findAll(EVENT);
            expect(bars).toHaveLength(2);
            expect(bars[0].attributes('data-color')).toBe('amber');
            expect(bars[0].attributes('data-span')).toBe('true');
            // 8/12（周三）落在第 4 列，跨 4 列
            expect(style(bars[0].element).getPropertyValue('--animal-calendar-bar-left')).toBe(
                'calc((100% / 7) * 3 + 5px)'
            );
            expect(style(bars[0].element).getPropertyValue('--animal-calendar-bar-width')).toBe(
                'calc((100% / 7) * 4 - 10px)'
            );
        });

        it('跨日期条在周与周之间自行分段并各自收尾', () => {
            const { wrapper, style } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '长假', start: '2026-08-05', end: '2026-08-18' }]),
            });
            // 8/5（周三）-8/8 收尾、8/9-8/15 整周、8/16-8/18 续接
            const bars = wrapper.findAll(`${EVENT}[data-span="true"]`);
            expect(bars).toHaveLength(3);
            expect(bars[0].attributes('data-end')).toBe('true');
            expect(style(bars[0].element).getPropertyValue('--animal-calendar-bar-width')).toBe(
                'calc((100% / 7) * 4 - 10px)'
            );
            expect(bars[1].attributes('data-start')).toBe('true');
            expect(bars[1].attributes('data-end')).toBe('true');
            expect(style(bars[1].element).getPropertyValue('--animal-calendar-bar-left')).toBe(
                'calc((100% / 7) * 0 + 5px)'
            );
            expect(style(bars[1].element).getPropertyValue('--animal-calendar-bar-width')).toBe(
                'calc((100% / 7) * 7 - 10px)'
            );
            expect(bars[2].attributes('data-start')).toBe('true');
            expect(style(bars[2].element).getPropertyValue('--animal-calendar-bar-width')).toBe(
                'calc((100% / 7) * 3 - 10px)'
            );
        });

        it('整周事项从周日铺到周六，两侧不留接缝', () => {
            const { wrapper, style } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '整周', start: '2026-08-09', end: '2026-08-15' }]),
            });
            const bar = wrapper.find(EVENT);
            expect(style(bar.element).getPropertyValue('--animal-calendar-bar-width')).toBe(
                'calc((100% / 7) * 7 - 10px)'
            );
            expect(bar.attributes('data-start')).toBe('true');
            expect(bar.attributes('data-end')).toBe('true');
        });

        it('同一天事项超过 2 条时折叠成 +N', () => {
            const { cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([
                    { title: 'A', start: '2026-08-13' },
                    { title: 'B', start: '2026-08-13' },
                    { title: 'C', start: '2026-08-13' },
                    { title: 'D', start: '2026-08-13' },
                ]),
            });
            expect(cell('2026-08-13').text()).toContain('+2');
            expect(cell('2026-08-13').attributes('aria-label')).toBe('2026-08-13 4 项事项：A，B，C，D');
        });

        it('showTime 的事项展示起始时间', () => {
            const { wrapper } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '晨会', start: '2026-08-10 09:30', showTime: true }]),
            });
            expect(wrapper.find('.animal-calendar__event-time').text()).toBe('09:30');
            expect(wrapper.find('.animal-calendar__event-title').text()).toBe('晨会');
        });

        it('showEventTime 设为 false 时只展示标题', () => {
            const { wrapper } = setup({
                panelValue: '2026-08',
                showEventTime: false,
                events: eventsOf([{ title: '晨会', start: '2026-08-10 09:30', showTime: true }]),
            });
            expect(wrapper.find('.animal-calendar__event-time').exists()).toBe(false);
            expect(wrapper.find('.animal-calendar__event-title').text()).toBe('晨会');
        });

        it('跨周事项只在首段展示时间，续接段只保留标题', () => {
            const { wrapper } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '团建', start: '2026-08-05 08:00', end: '2026-08-18', showTime: true }]),
            });
            const bars = wrapper.findAll(`${EVENT}[data-span="true"]`);
            expect(bars).toHaveLength(3);
            // 三个片段里只有首段带时间，续接段只保留标题
            expect(bars.map((bar) => bar.text())).toEqual(['08:00团建', '团建', '团建']);
            expect(bars.flatMap((bar) => bar.findAll('.animal-calendar__event-time').map((t) => t.text()))).toEqual([
                '08:00',
            ]);
        });

        it('跨天事项不让同周日期整行折叠', () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([
                    { title: '团建', start: '2026-08-12', end: '2026-08-18' },
                    { title: '晨会', start: '2026-08-13' },
                ]),
            });
            // 团建占第 0 行，晨会因此落在第 1 行而不是被折叠
            expect(wrapper.findAll('.animal-calendar__event-title').map((w) => w.text())).toContain('晨会');
            expect(cell('2026-08-13').text()).not.toContain('+');
        });

        it('event 插槽可自定义事项条内容，不影响格子的 aria-label', () => {
            // React 侧 title 是 ReactNode，Vue 侧改为命名插槽；aria-label 始终取 title 纯文本
            const wrapper = mount(Calendar, {
                props: {
                    panelValue: '2026-08',
                    events: eventsOf([{ title: '周会', start: '2026-08-10' }]),
                },
                slots: {
                    event: `<template #event="{ event, time }"><b class="custom">{{ time }}{{ event.title }}</b></template>`,
                },
            });
            expect(wrapper.find('.custom').text()).toBe('周会');
            expect(wrapper.find(`[data-date="2026-08-10"]`).attributes('aria-label')).toBe('2026-08-10 1 项事项：周会');
        });

        it('aria-label 保留数字标题（0 也不当作空值丢掉）', () => {
            const { cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: 0, start: '2026-08-10' }]),
            });
            expect(cell('2026-08-10').attributes('aria-label')).toBe('2026-08-10 1 项事项：0');
        });

        it('aria-label 里同名标题去重后补「等」，不与事项数错位', () => {
            const { cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([
                    { title: '周会', start: '2026-08-10' },
                    { title: '周会', start: '2026-08-10' },
                ]),
            });
            expect(cell('2026-08-10').attributes('aria-label')).toBe('2026-08-10 2 项事项：周会 等');
        });

        it('事项条在头部插入新事项后复用原有 DOM', async () => {
            const keep: CalendarEvent = { title: 'KEEP', start: '2026-08-20' };
            const { wrapper } = setup({ panelValue: '2026-08', events: eventsOf([keep]) });
            const before = [...wrapper.element.querySelectorAll(`${LAYER} > div`)];
            await wrapper.setProps({ events: eventsOf([{ title: 'NEW', start: '2026-08-02' }, keep]) });
            const after = [...wrapper.element.querySelectorAll(`${LAYER} > div`)];
            expect(after).toHaveLength(2);
            // 否则每次在头部插事项都会丢掉所有过渡
            expect(after.filter((node) => before.includes(node))).toHaveLength(1);
        });
    });

    describe('interaction', () => {
        it('点击日期触发 change（非受控内部同步选中态）', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08' });
            await cell('2026-08-10').trigger('click');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('2026-08-10');
            expect(wrapper.emitted('change')![0][0]).toBe('2026-08-10');
            expect(cell('2026-08-10').attributes('aria-selected')).toBe('true');
        });

        it('受控模式由父级回写 value', async () => {
            const wrapper = mount(ControlledValueHost, {
                props: { initial: '2026-08-10' },
                attachTo: document.body,
            });
            await wrapper.find('[data-date="2026-08-20"]').trigger('click');
            expect(wrapper.emitted('change')![0][0]).toBe('2026-08-20');
            expect(wrapper.find('[data-date="2026-08-20"]').attributes('aria-selected')).toBe('true');
            wrapper.unmount();
        });

        it('点击「今天」选中今天并跳转到今天所在月（非受控面板）', async () => {
            const today = new Date();
            const { wrapper, cell, monthText } = setup({ defaultPanelValue: '2020-01' });
            await wrapper.find(TODAY_BTN).trigger('click');
            expect(wrapper.emitted('change')![0][0]).toBe(dateKey(today));
            expect(monthText()).toBe(monthLabel(today));
            expect(cell(dateKey(today)).attributes('aria-selected')).toBe('true');
        });

        it('非受控面板自己翻月（上/下月与上/下年）', async () => {
            // 回归：goToMonth 曾在受控分支才写内部状态，导致不传 panelValue 时箭头点不动
            const { wrapper, monthText } = setup({ defaultPanelValue: '2026-08', defaultValue: '2026-08-10' });

            await wrapper.find('[aria-label="下个月"]').trigger('click');
            expect(monthText()).toBe('2026年9月');

            await wrapper.find('[aria-label="下一年"]').trigger('click');
            expect(monthText()).toBe('2027年9月');

            await wrapper.find('[aria-label="上个月"]').trigger('click');
            expect(monthText()).toBe('2027年8月');

            await wrapper.find('[aria-label="上一年"]').trigger('click');
            expect(monthText()).toBe('2026年8月');
        });

        it('受控面板下「今天」只更新选中值，面板月份由父级决定', async () => {
            const today = new Date();
            const { wrapper, monthText } = setup({ panelValue: '2020-01' });
            await wrapper.find(TODAY_BTN).trigger('click');
            expect(wrapper.emitted('panelChange')![0][0]).toBe(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`);
            expect(wrapper.emitted('change')![0][0]).toBe(dateKey(today));
            // 受控面板不会被内部状态改写
            expect(monthText()).toBe('2020年1月');
        });

        it('点击上/下月与上/下年切换面板并回调 panelChange', async () => {
            const wrapper = mount(ControlledPanelHost, {
                props: { initial: '2026-08' },
                attachTo: document.body,
            });
            const monthText = () => wrapper.find(MONTH_LABEL).text();

            await wrapper.find('[aria-label="下个月"]').trigger('click');
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-09');
            expect(monthText()).toBe('2026年9月');

            await wrapper.find('[aria-label="上个月"]').trigger('click');
            expect(monthText()).toBe('2026年8月');

            await wrapper.find('[aria-label="下一年"]').trigger('click');
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2027-08');
            expect(monthText()).toBe('2027年8月');

            await wrapper.find('[aria-label="上一年"]').trigger('click');
            expect(monthText()).toBe('2026年8月');
            wrapper.unmount();
        });

        it('受控面板下点击日期会请求切换面板月份', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08' });
            // 8 月视图的收尾格属于 9 月
            await cell('2026-09-01').trigger('click');
            expect(wrapper.emitted('panelChange')![0][0]).toBe('2026-09');
            expect(wrapper.emitted('update:panelValue')![0][0]).toBe('2026-09');
        });
    });

    describe('keyboard', () => {
        const keydown = async (wrapper: VueWrapper, key: string) => {
            await wrapper.find(BODY).trigger('keydown', { key });
        };

        it('受控 value 落在面板月外时，光标夹回网格且仍可 Tab 到', () => {
            const { wrapper, cell } = setup({ value: '2026-05-10', defaultPanelValue: '2026-03' });
            const focusable = wrapper.findAll('[data-date][tabindex="0"]');
            expect(focusable).toHaveLength(1);
            // 光标被夹到 3 月网格的末格（3 月 1 日是周日，网格到 4 月 11 日为止）
            expect(focusable[0].element).toBe(cell('2026-04-11').element);
        });

        it('不传 defaultPanelValue 时，受控 value 直接决定面板月份', () => {
            const { cell, monthText } = setup({ value: '2026-12-31' });
            expect(monthText()).toBe('2026年12月');
            expect(cell('2026-12-31').attributes('tabindex')).toBe('0');
        });

        it('受控 value 切到网格外后，光标仍夹在网格内可 Tab 到', async () => {
            const { wrapper, cell } = setup({ value: '2026-10-15', panelValue: '2026-10' });
            expect(cell('2026-10-15').attributes('tabindex')).toBe('0');
            await wrapper.setProps({ value: '2026-12-31' });
            expect(wrapper.findAll('[data-date][tabindex="0"]')).toHaveLength(1);
            // 10 月网格是 09-27 ~ 11-07，光标夹到末格
            expect(cell('2026-11-07').attributes('tabindex')).toBe('0');
        });

        it('受控面板不回写时，方向键越界也不会让网格失去 Tab 停靠点', async () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-10',
                value: '2026-10-28',
                ariaLabel: 'c',
            });
            (cell('2026-10-28').element as HTMLElement).focus();
            for (let i = 0; i < 12; i += 1) await keydown(wrapper, 'ArrowRight');
            expect(wrapper.findAll('[data-date][tabindex="0"]')).toHaveLength(1);
        });

        it('调用方传入的 onPointerup 不会顶掉内部拖拽收尾', async () => {
            const onPointerUp = vi.fn();
            const wrapper = mount(Calendar, {
                props: { panelValue: '2026-08', draggableEvents: true },
                attrs: { onPointerup: onPointerUp },
            });
            await drag(wrapper as unknown as VueWrapper, '2026-08-10', '2026-08-12');
            expect(wrapper.emitted('eventCreate')![0]).toEqual(['2026-08-10', '2026-08-12']);
            expect(onPointerUp).toHaveBeenCalled();
        });

        it('受控 value 在网格外时，选中态与光标夹到同一格，不出现「有焦点却无选中」', () => {
            const { wrapper, cell } = setup({ panelValue: '2026-10', value: '2026-12-31', ariaLabel: 'c' });
            const selected = wrapper.findAll('[aria-selected="true"]');
            expect(selected).toHaveLength(1);
            expect(selected[0].element).toBe(wrapper.find('[data-date][tabindex="0"]').element);
            expect(selected[0].element).toBe(cell('2026-11-07').element);
        });

        it('非受控面板下点上下月补位格：面板跟过去，选中态与光标都落在那一格', async () => {
            const { cell, monthText } = setup({ defaultPanelValue: '2026-08-01' });
            await cell('2026-07-28').trigger('click');
            expect(monthText()).toBe('2026年7月');
            expect(cell('2026-07-28').attributes('aria-selected')).toBe('true');
            expect(cell('2026-07-28').attributes('tabindex')).toBe('0');
        });

        it('只有一个日期格可 Tab 到达（roving tabindex）', () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', defaultValue: '2026-08-10' });
            expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
            expect(cell('2026-08-10').attributes('tabindex')).toBe('0');
        });

        it('方向键移动光标并同步选中可聚焦态', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', defaultValue: '2026-08-10' });
            (cell('2026-08-10').element as HTMLElement).focus();

            await keydown(wrapper, 'ArrowRight');
            expect(cell('2026-08-11').attributes('tabindex')).toBe('0');
            await keydown(wrapper, 'ArrowDown');
            expect(cell('2026-08-18').attributes('tabindex')).toBe('0');
            await keydown(wrapper, 'ArrowUp');
            expect(cell('2026-08-11').attributes('tabindex')).toBe('0');
            await keydown(wrapper, 'ArrowLeft');
            expect(cell('2026-08-10').attributes('tabindex')).toBe('0');
        });

        it('方向键移动后 DOM 焦点跟着走，Enter 选中新光标所在日期', async () => {
            // 回归：此前只改 tabIndex 不搬焦点，第二次 Enter 会落在旧格子上
            const wrapper = mount(Calendar, {
                props: { panelValue: '2026-08', defaultValue: '2026-08-10' },
                attachTo: document.body,
            });
            const cell = (date: string) => wrapper.find(`[data-date="${date}"]`);
            (cell('2026-08-10').element as HTMLElement).focus();

            await keydown(wrapper as unknown as VueWrapper, 'ArrowRight');
            expect(document.activeElement).toBe(cell('2026-08-11').element);

            await keydown(wrapper as unknown as VueWrapper, 'Enter');
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-08-11');

            await keydown(wrapper as unknown as VueWrapper, 'ArrowDown');
            expect(document.activeElement).toBe(cell('2026-08-18').element);
            await keydown(wrapper as unknown as VueWrapper, 'Enter');
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-08-18');
            wrapper.unmount();
        });

        it('Enter / 空格选中当前光标日期，且每次按键只回调一次', async () => {
            // 回归：格子与容器的 keydown 曾各触发一次选中
            const { wrapper, cell } = setup({ panelValue: '2026-08', defaultValue: '2026-08-10' });
            (cell('2026-08-10').element as HTMLElement).focus();

            await keydown(wrapper, 'ArrowRight');
            await keydown(wrapper, 'Enter');
            expect(wrapper.emitted('change')).toHaveLength(1);
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-08-11');

            await keydown(wrapper, 'ArrowRight');
            await keydown(wrapper, ' ');
            expect(wrapper.emitted('change')).toHaveLength(2);
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-08-12');
        });

        it('月内移动光标不翻月', async () => {
            // 回归：此前比较格子下标，几乎每次方向键都会触发 panelChange
            const { wrapper, cell } = setup({ panelValue: '2026-08', defaultValue: '2026-08-10' });
            (cell('2026-08-10').element as HTMLElement).focus();

            await keydown(wrapper, 'ArrowRight');
            await keydown(wrapper, 'ArrowDown');
            await keydown(wrapper, 'ArrowLeft');
            expect(wrapper.emitted('panelChange')).toBeUndefined();
        });

        it('光标跨到别月时面板跟随翻月', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', defaultValue: '2026-08-31' });
            (cell('2026-08-31').element as HTMLElement).focus();

            await keydown(wrapper, 'ArrowRight');
            expect(wrapper.emitted('panelChange')![0][0]).toBe('2026-09');
        });

        it('PageUp / PageDown 翻月', async () => {
            const wrapper = mount(ControlledPanelHost, {
                props: { initial: '2026-08' },
                attachTo: document.body,
            });
            (wrapper.find('[data-date="2026-08-10"]').element as HTMLElement).focus();

            await keydown(wrapper as unknown as VueWrapper, 'PageDown');
            expect(wrapper.find(MONTH_LABEL).text()).toBe('2026年9月');
            await keydown(wrapper as unknown as VueWrapper, 'PageUp');
            expect(wrapper.find(MONTH_LABEL).text()).toBe('2026年8月');
            expect(wrapper.emitted('change')!.at(-1)![0]).toBe('2026-08');
            wrapper.unmount();
        });
    });

    describe('drag to create', () => {
        it('默认关闭拖拽：按下并跨格不会创建事项', async () => {
            const wrapper = mount(Calendar, { props: { panelValue: '2026-08' } });
            await drag(wrapper as unknown as VueWrapper, '2026-08-10', '2026-08-13');
            expect(wrapper.emitted('eventCreate')).toBeUndefined();
        });

        it('开启 draggableEvents 后跨格拖拽回调起止日期', async () => {
            const wrapper = mount(Calendar, { props: { panelValue: '2026-08', draggableEvents: true } });
            await drag(wrapper as unknown as VueWrapper, '2026-08-10', '2026-08-12');
            expect(wrapper.emitted('eventCreate')![0]).toEqual(['2026-08-10', '2026-08-12']);
        });

        it('反向拖拽按时间先后输出起止日期', async () => {
            const wrapper = mount(Calendar, { props: { panelValue: '2026-08', draggableEvents: true } });
            await drag(wrapper as unknown as VueWrapper, '2026-08-14', '2026-08-11');
            expect(wrapper.emitted('eventCreate')![0]).toEqual(['2026-08-11', '2026-08-14']);
        });

        it('拖拽预览渲染为虚线事项条', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', draggableEvents: true });
            await cell('2026-08-10').trigger('mousedown', { button: 0 });
            await cell('2026-08-12').trigger('mouseenter');
            expect(wrapper.find('[data-preview="true"]').exists()).toBe(true);
        });

        it('单击不创建事项，只切换选中', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', draggableEvents: true });
            await cell('2026-08-10').trigger('click');
            expect(wrapper.emitted('eventCreate')).toBeUndefined();
            expect(wrapper.emitted('change')![0][0]).toBe('2026-08-10');
        });

        it('右键拖拽不进入拖拽态，也不创建事项', async () => {
            const { wrapper, cell } = setup({ panelValue: '2026-08', draggableEvents: true });
            await cell('2026-08-10').trigger('mousedown', { button: 2 });
            await cell('2026-08-12').trigger('mouseenter');
            await wrapper.trigger('pointerup');
            expect(wrapper.find('[data-preview="true"]').exists()).toBe(false);
            expect(wrapper.emitted('eventCreate')).toBeUndefined();
        });

        it('抬在月份表头上照常创建事项（表头也在面板内）', async () => {
            const wrapper = mount(Calendar, { props: { panelValue: '2026-08', draggableEvents: true } });
            const cell = (date: string) => wrapper.find(`[data-date="${date}"]`);
            await cell('2026-08-10').trigger('mousedown', { button: 0 });
            await cell('2026-08-12').trigger('mouseenter');
            await wrapper.find(HEADER).trigger('pointerup');
            expect(wrapper.emitted('eventCreate')![0]).toEqual(['2026-08-10', '2026-08-12']);
        });

        it('拖拽预览条占位失败时不折出 +N 徽标', async () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-08',
                draggableEvents: true,
                events: eventsOf([
                    { title: 'E1', start: '2026-08-10', end: '2026-08-16' },
                    { title: 'E2', start: '2026-08-10', end: '2026-08-16' },
                ]),
            });
            expect(cell('2026-08-12').find(MORE).exists()).toBe(false);
            await cell('2026-08-12').trigger('mousedown', { button: 0 });
            await cell('2026-08-13').trigger('mouseenter');
            await wrapper.find(BODY).trigger('pointerup');
            // 预览条在这周已无空行可占，正因如此它折不出片段，此时最考验 +N 不被它污染
            expect(cell('2026-08-12').find(MORE).exists()).toBe(false);
            expect(cell('2026-08-13').find(MORE).exists()).toBe(false);
        });

        it('视图外的事项不参与渲染，也不计入 +N 与格子提示', () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-08',
                events: eventsOf([
                    { title: '上季度总结', start: '2026-05-04', end: '2026-05-06' },
                    { title: '下季度规划', start: '2026-11-02' },
                    { title: '跨过整月', start: '2026-07-01', end: '2026-09-30' },
                ]),
            });
            expect(wrapper.find('.animal-calendar__event-title').exists()).toBe(true);
            expect(wrapper.text()).not.toContain('上季度总结');
            expect(wrapper.text()).not.toContain('下季度规划');
            // 跨过整月的事项在视图内可见，且首格提示只算它一条
            expect(wrapper.findAll('.animal-calendar__event-title').map((w) => w.text())).toEqual(
                Array(6).fill('跨过整月')
            );
            expect(cell('2026-07-26').attributes('aria-label')).toBe('2026-07-26 1 项事项：跨过整月');
            expect(cell('2026-07-26').text()).not.toContain('+');
        });

        it('非法的 start 回退到今天，不会崩溃（今天不在 8 月视图内则不渲染）', () => {
            const { wrapper } = setup({
                panelValue: '2026-08',
                events: eventsOf([{ title: '坏数据', start: 'not-a-date' }]),
            });
            expect(wrapper.find('[role="grid"]').exists()).toBe(true);
            expect(wrapper.text()).not.toContain('坏数据');
        });
    });

    describe('样式类名', () => {
        it('日期格按状态挂 BEM 修饰类', () => {
            const { wrapper, cell } = setup({
                panelValue: '2026-08',
                defaultValue: '2026-08-10',
                draggableEvents: true,
            });
            const today = new Date();
            const todayCell = wrapper.find(`[data-date="${dateKey(today)}"]`);
            if (wrapper.find(`[data-date="${dateKey(today)}"]`).exists()) {
                expect(todayCell.classes()).toContain('animal-calendar__cell--today');
            }
            expect(cell('2026-08-10').classes()).toContain(CELL);
            expect(cell('2026-08-10').classes()).toContain('animal-calendar__cell--selected');
            expect(cell('2026-07-26').classes()).toContain('animal-calendar__cell--outside');
            // 开启拖拽后根节点标记 data-draggable，样式据此换成十字光标
            expect(wrapper.attributes('data-draggable')).toBe('true');
        });

        it('面板未开启拖拽时不标记 data-draggable', () => {
            const { wrapper } = setup({ panelValue: '2026-08' });
            expect(wrapper.attributes('data-draggable')).toBeUndefined();
        });
    });
});
