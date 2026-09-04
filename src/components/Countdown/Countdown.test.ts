import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Countdown from './Countdown.vue';

describe('Countdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-19T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('按指定格式渲染剩余时间', () => {
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 65_000, format: 'HH:mm:ss' },
        });
        // 滚动数字条对 DOM 可见性断言不可用，读屏文本承载完整格式化值
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:01:05');
    });

    it('每秒更新并在归零时触发回调', async () => {
        const onChange = vi.fn();
        const onFinish = vi.fn();
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 2_000, onChange, onFinish },
        });

        vi.advanceTimersByTime(1_000);
        await nextTick();
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:00:01');
        vi.advanceTimersByTime(1_000);
        await nextTick();
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:00:00');
        expect(onChange).toHaveBeenLastCalledWith(0);
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('支持 Date、天数格式和前缀插槽', () => {
        const wrapper = mount(Countdown, {
            props: {
                value: new Date(Date.now() + (24 * 60 * 60 + 2 * 60 * 60 + 3 * 60 + 4) * 1_000),
                format: 'DD 天 HH:mm:ss',
            },
            slots: { prefix: () => '活动结束还有' },
        });
        expect(wrapper.find('.animal-countdown__prefix').text()).toBe('活动结束还有');
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('01 天 02:03:04');
    });

    it('过期时间稳定显示零且只完成一次', async () => {
        const onFinish = vi.fn();
        const wrapper = mount(Countdown, {
            props: { value: Date.now() - 1_000, onFinish },
        });
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:00:00');
        expect(onFinish).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(2_000);
        await nextTick();
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('value 变化后重新开始计时', async () => {
        const onFinish = vi.fn();
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 2_000, onFinish },
        });
        vi.advanceTimersByTime(2_000);
        await nextTick();
        expect(onFinish).toHaveBeenCalledTimes(1);

        await wrapper.setProps({ value: Date.now() + 3_000 });
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:00:03');
        vi.advanceTimersByTime(3_000);
        await nextTick();
        expect(onFinish).toHaveBeenCalledTimes(2);
    });

    it('数字条通过 translateY 滚动到当前数字', () => {
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 65_000, format: 'HH:mm:ss' },
        });
        const strips = wrapper.findAll('.animal-countdown__digit-strip');
        expect(strips.length).toBe(6);
        // '00:01:05' → 初始 pos = 数字本身（20 面数字条，每面 5%）
        const transforms = strips.map((s) => (s.element as HTMLElement).style.transform);
        expect(transforms).toEqual([
            'translateY(-0%)',
            'translateY(-0%)',
            'translateY(-0%)',
            'translateY(-5%)',
            'translateY(-0%)',
            'translateY(-25%)',
        ]);
        // 每个数字条包含 0-9 两轮共 20 个数字面
        expect(strips[0].element.children.length).toBe(20);
    });

    it('秒位 0→9 回绕时单向向下滚动', async () => {
        // 60s 剩余显示 '00:01:00'，1 秒后 '00:00:59'：秒个位 0→9 回绕
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 60_000, format: 'mm:ss' },
        });
        vi.advanceTimersByTime(1_000);
        await nextTick();
        expect(wrapper.find('.animal-countdown__sr-only').text()).toBe('00:59');
        const strips = wrapper.findAll('.animal-countdown__digit-strip');
        // 秒个位 9：回绕后落在下一循环（pos ≥ 10），而非反向跳回第一循环
        const secondsOnes = strips[3].element as HTMLElement;
        expect(secondsOnes.style.transform).toBe('translateY(-45%)');
    });

    it('应用尺寸、风格和自定义属性', () => {
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 1_000, size: 'large', variant: 'island' },
            attrs: { class: 'custom', 'aria-label': '出发倒计时' },
        });
        const timer = wrapper.find('[role="timer"]');
        expect(timer.classes()).toContain('animal-countdown--large');
        expect(timer.classes()).toContain('animal-countdown--island');
        expect(timer.classes()).toContain('custom');
        expect(timer.attributes('aria-label')).toBe('出发倒计时');
        expect(timer.attributes('aria-live')).toBe('off');
    });

    it('bordered 默认无边框，开启后应用边框类', async () => {
        const wrapper = mount(Countdown, {
            props: { value: Date.now() + 1_000 },
        });
        expect(wrapper.find('[role="timer"]').classes()).not.toContain('animal-countdown--bordered');
        await wrapper.setProps({ bordered: true });
        expect(wrapper.find('[role="timer"]').classes()).toContain('animal-countdown--bordered');
    });
});
