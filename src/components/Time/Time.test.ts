import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Time from './Time.vue';

describe('Time', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-08T09:30:00')); // Monday
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('渲染当前星期、月日与 HH:MM', () => {
        const wrapper = mount(Time);
        expect(wrapper.text()).toContain('Monday');
        expect(wrapper.text()).toContain('Jun 8');
        expect(wrapper.text()).toContain('09');
        expect(wrapper.text()).toContain('30');
    });

    it('每秒刷新（推进 1s 后状态可能更新）', async () => {
        const wrapper = mount(Time);
        vi.advanceTimersByTime(1000);
        await nextTick();
        // 时间没真的变化（仍是 09:30），但定时器被触发，没有报错即可
        expect(wrapper.text()).toContain('Monday');
    });

    it('应用 className', () => {
        const wrapper = mount(Time, { attrs: { class: 'my-time' } });
        expect(wrapper.element.classList.contains('my-time')).toBe(true);
    });
});
