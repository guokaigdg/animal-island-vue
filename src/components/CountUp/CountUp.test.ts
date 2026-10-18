import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CountUp from './CountUp.vue';
import type { CountUpEasing, CountUpEasingName, CountUpRenderState } from './types';

const NUMBER = '.animal-count-up__number';
const SR_ONLY = '.animal-count-up__sr-only';
const EFFECTS = '.animal-count-up__effects';
const BADGE_WRAP = '.animal-count-up__badge-wrap';

/** 每帧 16ms，与浏览器 rAF 节奏一致 */
const FRAME = 16;

describe('CountUp', () => {
    /**
     * 本仓库的 vitest 2.1.9 里，sinon 的 fake requestAnimationFrame 会在一次
     * advanceTimersByTime 末尾把帧挤成 burst、时间戳几乎不推进，导致基于时间戳的动画
     * 无法在中途被观测（React 仓用的是 vitest 4，行为不同）。
     * 因此这里自己接管 rAF：用可控队列 + 手动时钟逐帧精确推进；
     * celebrate / repeat 的 setTimeout 仍交给 fake timers。
     */
    let clock = 0;
    let nextFrameId = 1;
    let frameQueue: { id: number; cb: FrameRequestCallback }[] = [];
    const cancelled = new Set<number>();

    /** 推进一帧 */
    const tick = async () => {
        clock += FRAME;
        const pending = frameQueue.filter((f) => !cancelled.has(f.id));
        pending.forEach((f) => cancelled.delete(f.id));
        frameQueue = [];
        pending.forEach((f) => f.cb(clock));
        await nextTick();
    };

    /** 按 16ms 一帧推进，模拟 ms 毫秒的动画 */
    const run = async (ms: number) => {
        for (let i = 0; i < Math.max(1, Math.round(ms / FRAME)); i++) await tick();
    };

    /** 只推进 setTimeout 计时器（celebrate / repeat），不跑帧 */
    const wait = async (ms: number) => {
        vi.advanceTimersByTime(ms);
        await nextTick();
    };

    beforeEach(() => {
        vi.useFakeTimers();
        clock = 0;
        nextFrameId = 1;
        frameQueue = [];
        cancelled.clear();
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            const id = nextFrameId++;
            frameQueue.push({ id, cb });
            return id;
        });
        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            cancelled.add(id);
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    const setup = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) =>
        mount(CountUp, { props: { end: 10, ...props }, ...options });

    const numberText = (wrapper: ReturnType<typeof setup>) => wrapper.find(NUMBER).text();
    const readableText = (wrapper: ReturnType<typeof setup>) => wrapper.find(SR_ONLY).text();

    it('未开始计数时展示起始值，并把它播报给读屏', () => {
        const wrapper = setup({ end: 1320, start: 100 });
        expect(wrapper.attributes('role')).toBe('status');
        expect(numberText(wrapper)).toBe('100');
        expect(readableText(wrapper)).toBe('100');
    });

    it('按 duration 从 start 计数到 end，计数中不打扰读屏', async () => {
        const wrapper = setup({ isCounting: true, end: 1000, duration: 1 });
        expect(readableText(wrapper)).toBe('');

        await run(500);
        const midway = Number(numberText(wrapper));
        expect(midway).toBeGreaterThan(0);
        expect(midway).toBeLessThan(1000);
        expect(readableText(wrapper)).toBe('');

        await run(700);
        expect(numberText(wrapper)).toBe('1000');
        expect(readableText(wrapper)).toBe('1000');
    });

    it('结束时触发 complete 与 update', async () => {
        const wrapper = setup({ isCounting: true, end: 100, duration: 1 });

        await run(1_200);
        const complete = wrapper.emitted('complete')!;
        expect(complete).toHaveLength(1);
        // 回调参数是累计动画时长（秒）
        expect(complete[0][0]).toBeGreaterThanOrEqual(1);
        const update = wrapper.emitted('update')!;
        expect(update[update.length - 1][0]).toBe(100);
    });

    it('duration=0 直接显示目标值', () => {
        const wrapper = setup({ isCounting: true, end: 86, duration: 0 });
        expect(numberText(wrapper)).toBe('86');
        expect(readableText(wrapper)).toBe('86');
    });

    it('支持千分位、小数位、小数点与前后缀插槽', () => {
        const wrapper = setup(
            {
                isCounting: true,
                end: 1320.5,
                decimalPlaces: 1,
                thousandsSeparator: ',',
                duration: 0,
            },
            { slots: { prefix: '¥', suffix: '分' } }
        );
        expect(numberText(wrapper)).toBe('1,320.5');
        expect(readableText(wrapper)).toBe('1,320.5');
        expect(wrapper.text()).toContain('分');
        expect(wrapper.text()).toContain('¥');
    });

    it('小数位默认取 start / end 中较大的小数位数', () => {
        const wrapper = setup({ isCounting: true, start: 0.5, end: 2.25, duration: 0 });
        expect(numberText(wrapper)).toBe('2.25');
    });

    it('支持自定义小数点符号', () => {
        const wrapper = setup({ isCounting: true, end: 1.5, decimalPlaces: 1, decimalSeparator: ',', duration: 0 });
        expect(numberText(wrapper)).toBe('1,5');
    });

    it('formatter 优先级高于内置格式化', () => {
        const wrapper = setup({
            isCounting: true,
            end: 100,
            duration: 0,
            thousandsSeparator: ',',
            formatter: (value: number) => `${Math.round(value)} 分`,
        });
        expect(numberText(wrapper)).toBe('100 分');
        // 读屏文本始终使用默认数字格式，保证可读性
        expect(readableText(wrapper)).toBe('100');
    });

    it('默认作用域插槽接管渲染，并可 reset 重播', async () => {
        let state: CountUpRenderState | null = null;
        const wrapper = setup(
            { isCounting: true, end: 10, duration: 1 },
            {
                slots: {
                    default: (slotProps: CountUpRenderState) => {
                        state = slotProps;
                        return `v${Math.round(slotProps.value)}`;
                    },
                },
            }
        );
        await run(1_200);
        expect(numberText(wrapper)).toBe('v10');

        state!.reset();
        await nextTick();
        expect(numberText(wrapper)).toBe('v0');
        await run(1_200);
        expect(numberText(wrapper)).toBe('v10');
    });

    it('通过组件 ref 暴露的 reset 从指定值重播', async () => {
        const wrapper = setup({ isCounting: true, start: 0, end: 100, duration: 1 });
        await run(1_200);
        expect(numberText(wrapper)).toBe('100');

        (wrapper.vm as unknown as { reset: (n?: number) => void }).reset(50);
        await nextTick();
        expect(numberText(wrapper)).toBe('50');
    });

    it('内置缓动曲线都能走到目标值，自定义与未知曲线也不会中断', async () => {
        const easings: CountUpEasingName[] = ['linear', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic', 'easeOutExpo'];
        const custom = vi.fn((progress: number) => progress * progress);
        const samples: CountUpEasing[] = [...easings, custom, 'not-a-curve' as CountUpEasing];

        const wrapper = mount({
            components: { CountUp },
            template: `<div>
                <CountUp v-for="(easing, index) in samples" :key="index" :easing="easing"
                          :is-counting="true" :end="100" :duration="1" />
            </div>`,
            setup: () => ({ samples }),
        });

        await run(1_200);
        const numbers = wrapper.findAll(NUMBER).map((node) => node.text());
        expect(numbers).toHaveLength(samples.length);
        expect(numbers.every((text) => text === '100')).toBe(true);
        expect(custom).toHaveBeenCalled();
    });

    it('updateInterval 控制刷新频率', async () => {
        const wrapper = setup({ isCounting: true, end: 100, duration: 1, updateInterval: 1, easing: 'linear' });
        await run(500);
        // 间隔 1 秒：前半段仍显示起点
        expect(numberText(wrapper)).toBe('0');
        await run(700);
        expect(numberText(wrapper)).toBe('100');
    });

    it('isCounting 置为 false 暂停，再置为 true 从暂停处继续', async () => {
        const wrapper = setup({ isCounting: true, end: 1000, duration: 2 });
        await run(500);
        const paused = Number(numberText(wrapper));
        expect(paused).toBeGreaterThan(0);

        await wrapper.setProps({ isCounting: false });
        await run(1_000);
        expect(Number(numberText(wrapper))).toBe(paused);

        await wrapper.setProps({ isCounting: true });
        await run(500);
        expect(Number(numberText(wrapper))).toBeGreaterThan(paused);
    });

    it('end 变化时自动重播', async () => {
        const wrapper = setup({ isCounting: true, end: 100, duration: 1 });
        await run(1_200);
        expect(numberText(wrapper)).toBe('100');

        await wrapper.setProps({ end: 500 });
        expect(numberText(wrapper)).toBe('0');
        await run(1_200);
        expect(numberText(wrapper)).toBe('500');
    });

    it('repeat 开启时延迟自动重播', async () => {
        const wrapper = setup({ isCounting: true, end: 100, duration: 1, repeat: true, repeatDelay: 0.5 });

        await run(1_200);
        expect(wrapper.emitted('complete')).toHaveLength(1);
        expect(numberText(wrapper)).toBe('100');

        // 越过 0.5s 重播点：计时器到点 → runToken 递增 → 从头开始
        await wait(600);
        await nextTick();
        expect(numberText(wrapper)).toBe('0');

        await run(1_200);
        expect(wrapper.emitted('complete')).toHaveLength(2);
        expect(numberText(wrapper)).toBe('100');
    });

    it('repeatStartAt 指定重播起始值', async () => {
        const wrapper = setup({
            isCounting: true,
            end: 100,
            duration: 1,
            repeat: true,
            repeatDelay: 0.5,
            repeatStartAt: 40,
        });
        await run(1_200);
        expect(numberText(wrapper)).toBe('100');

        await wait(600);
        await nextTick();
        expect(numberText(wrapper)).toBe('40');
    });

    it('duration=0 排下的重播计时器会在依赖变化时被取消', async () => {
        const wrapper = setup({ isCounting: true, end: 10, duration: 0, repeat: true, repeatDelay: 0.5 });
        expect(wrapper.emitted('complete')).toHaveLength(1);

        // duration 变化会重跑 watch：上一次（duration=0 分支）排的重播计时器必须一起被清掉
        await wrapper.setProps({ duration: 0.3 });
        await run(150);
        const midway = numberText(wrapper);
        expect(midway).not.toBe('0');

        // 越过原定 500ms 重播点：旧计时器若残留，这里会重新从 start 开始
        await wait(600);
        expect(numberText(wrapper)).toBe(midway);

        await run(300);
        expect(wrapper.emitted('complete')).toHaveLength(2);
    });

    it('环境不支持 requestAnimationFrame 时静态展示且不报错', async () => {
        vi.stubGlobal('requestAnimationFrame', undefined);
        const wrapper = setup({ isCounting: true, end: 100, duration: 1 });
        await run(1_200);
        expect(numberText(wrapper)).toBe('0');
    });

    it('默认不渲染庆祝动效', async () => {
        const wrapper = setup({ isCounting: true, end: 10, duration: 1 });
        await run(1_200);
        expect(wrapper.text()).not.toContain('完美！');
        expect(wrapper.classes()).not.toContain('animal-count-up--celebrating');
    });

    it('celebrate 不传 text 时不渲染贴纸，动效结束后收起', async () => {
        const wrapper = setup({ isCounting: true, end: 10, duration: 1, celebrate: true });
        await run(1_200);

        expect(wrapper.classes()).toContain('animal-count-up--celebrating');
        // 没传 text 就没有贴纸
        expect(wrapper.find(BADGE_WRAP).exists()).toBe(false);
        // 装饰层对辅助技术隐藏
        expect(wrapper.find(EFFECTS).attributes('aria-hidden')).toBe('true');

        await wait(1_000);
        expect(wrapper.classes()).not.toContain('animal-count-up--celebrating');
    });

    it('celebrate.text 支持文案，并在动效结束后收起', async () => {
        const wrapper = setup({ isCounting: true, end: 10, duration: 1, celebrate: { text: '完美！' } });
        await run(1_200);
        expect(wrapper.text()).toContain('完美！');

        await wait(1_000);
        expect(wrapper.find(BADGE_WRAP).exists()).toBe(false);
    });

    it('#celebrate 插槽优先于 celebrate.text', async () => {
        const wrapper = setup(
            { isCounting: true, end: 10, duration: 1, celebrate: { text: '来自 prop' } },
            { slots: { celebrate: '来自插槽' } }
        );
        await run(1_200);
        expect(wrapper.text()).toContain('来自插槽');
        expect(wrapper.text()).not.toContain('来自 prop');
    });

    it('应用尺寸、风格、边框与自定义属性', () => {
        const wrapper = mount(CountUp, {
            props: { end: 10, size: 'large', variant: 'island', bordered: true },
            attrs: { class: 'custom', 'aria-label': '本局得分', 'data-testid': 'score' },
        });
        expect(wrapper.classes()).toContain('animal-count-up--large');
        expect(wrapper.classes()).toContain('animal-count-up--island');
        expect(wrapper.classes()).toContain('animal-count-up--bordered');
        expect(wrapper.classes()).toContain('custom');
        expect(wrapper.attributes('data-testid')).toBe('score');
        expect(wrapper.attributes('aria-label')).toBe('本局得分');
    });

    describe('digitRoll 数码管逐位滚动', () => {
        const CHAR = '.animal-count-up__char';
        const WHEEL = '.animal-count-up__wheel';

        it('默认关闭，此时渲染的是普通文本而不是滚轮', () => {
            const wrapper = mount(CountUp, { props: { end: 42, isCounting: true } });
            expect(wrapper.findAll(WHEEL)).toHaveLength(0);
            expect(wrapper.find(`${NUMBER}--roll`).exists()).toBe(false);
        });

        it('开启后每个数字位生成一根 10 格滚轮，非数字位保持静止', async () => {
            const wrapper = mount(CountUp, { props: { end: 1350, isCounting: true, duration: 0, digitRoll: true } });
            await nextTick();
            // "1350" → 4 根滚轮
            expect(wrapper.findAll(WHEEL)).toHaveLength(4);
            expect(wrapper.findAll(CHAR)).toHaveLength(4);
            expect(wrapper.find(`${NUMBER}--roll`).exists()).toBe(true);
            // 静止到目标值时每根滚轮停在对应数字
            expect(wrapper.findAll(WHEEL).map((w) => w.attributes('style'))).toEqual([
                'transform: translateY(-10%);',
                'transform: translateY(-30%);',
                'transform: translateY(-50%);',
                'transform: translateY(0%);',
            ]);
        });

        it('分隔符与前后缀不生成滚轮', async () => {
            const wrapper = mount(CountUp, {
                props: {
                    end: 1320.5,
                    isCounting: true,
                    duration: 0,
                    digitRoll: true,
                    thousandsSeparator: ',',
                    decimalPlaces: 1,
                },
            });
            await nextTick();
            // "1,320.5" → 5 个数字位（1 3 2 0 5）+ 2 个静态字符（千分位逗号、小数点）
            expect(wrapper.findAll(WHEEL)).toHaveLength(5);
            expect(wrapper.findAll(CHAR)).toHaveLength(7);
            expect(wrapper.findAll(`${CHAR}--wheel`)).toHaveLength(5);
        });

        it('数值变化时滚轮跟着换挡', async () => {
            const wrapper = mount(CountUp, { props: { end: 9, isCounting: false, digitRoll: true } });
            await nextTick();
            expect(wrapper.find(WHEEL).attributes('style')).toBe('transform: translateY(0%);');

            await wrapper.setProps({ isCounting: true, duration: 1 });
            await run(1_000);
            // 0 → 9，最高那根滚轮滚到 9（即 -90%）
            expect(wrapper.find(WHEEL).attributes('style')).toBe('transform: translateY(-90%);');
        });

        it('默认插槽接管渲染时不生成滚轮，插槽优先', async () => {
            const wrapper = mount(CountUp, {
                props: { end: 7, isCounting: true, duration: 0, digitRoll: true },
                slots: { default: '<b class="own">自定义</b>' },
            });
            await nextTick();
            expect(wrapper.findAll(WHEEL)).toHaveLength(0);
            expect(wrapper.find('.own').exists()).toBe(true);
        });

        it('读屏文本不随滚轮变化，仍在静止后播报最终值', async () => {
            const wrapper = mount(CountUp, { props: { end: 88, isCounting: true, duration: 0, digitRoll: true } });
            await nextTick();
            expect(wrapper.find(SR_ONLY).text()).toBe('88');
        });
    });
});
