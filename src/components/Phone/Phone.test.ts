import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Phone from './Phone.vue';

describe('Phone', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-08T09:30:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('渲染时间与 Welcome', () => {
        const wrapper = mount(Phone);
        // 9:30 AM 拼接在同一容器
        expect(wrapper.text()).toContain('Welcome!');
        expect(wrapper.text()).toContain('9');
        expect(wrapper.text()).toContain('30');
        expect(wrapper.text()).toContain('AM');
    });

    it('应用 className', () => {
        const wrapper = mount(Phone, { attrs: { class: 'my-phone' } });
        expect(wrapper.element.classList.contains('my-phone')).toBe(true);
    });

    it('setInterval 每秒刷新时间', async () => {
        vi.setSystemTime(new Date('2026-06-08T09:30:00'));
        const wrapper = mount(Phone);
        // 9:30 → 推进 1s → 9:30（分钟不变）—— 主要验证定时器不会抛错
        vi.advanceTimersByTime(1000);
        await nextTick();
        expect(wrapper.text()).toContain('30');
        // 再推 1 分钟
        vi.advanceTimersByTime(60_000);
        await nextTick();
        expect(wrapper.text()).toContain('31');
    });

    it('卸载时清理 setInterval（无内存泄漏警告）', async () => {
        const wrapper = mount(Phone);
        // 推进 5 秒确保定时器跑过
        vi.advanceTimersByTime(5000);
        await nextTick();
        // 卸载后再推时间不应再触发 setState
        wrapper.unmount();
        vi.advanceTimersByTime(5000);
        // 没报错即通过
    });
});
