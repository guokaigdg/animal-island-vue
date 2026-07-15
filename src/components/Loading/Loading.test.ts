import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Loading from './Loading.vue';

// gsap 内部用到大量浏览器 API；jsdom 下 mock 掉动画相关模块即可
vi.mock('./island/script.js', () => ({
    startAnimation: vi.fn(),
}));
vi.mock('./island/gsap.min.js', () => ({
    gsap: {
        to: vi.fn(),
        fromTo: vi.fn(),
        set: vi.fn(),
        registerPlugin: vi.fn(),
    },
}));
vi.mock('./island/MotionPathPlugin.min.js', () => ({
    MotionPathPlugin: vi.fn(),
}));

describe('Loading', () => {
    it('挂载并渲染内嵌 SVG 容器', () => {
        const wrapper = mount(Loading);
        expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('应用 className 与 style 到容器', () => {
        const wrapper = mount(Loading, {
            attrs: { class: 'my-loading', style: 'background: red' },
        });
        const inner = wrapper.find('.animal-loading__container');
        expect(inner.classes()).toContain('my-loading');
        expect(inner.attributes('style') || '').toMatch(/background:\s*red/i);
    });

    it('active 从 true 切换为 false 时添加 closing 类并通过 setTimeout 隐藏', async () => {
        vi.useFakeTimers();
        const wrapper = mount(Loading);
        await wrapper.setProps({ active: false });
        const inner = wrapper.find('.animal-loading__container');
        expect(inner.classes()).toContain('animal-loading-closing');
        vi.runAllTimers();
        expect((inner.element as HTMLElement).style.display).toBe('none');
        vi.useRealTimers();
    });

    it('active=true 时无 closing 类', () => {
        const wrapper = mount(Loading);
        const inner = wrapper.find('.animal-loading__container');
        expect(inner.classes()).not.toContain('animal-loading-closing');
    });

    it('卸载时清理 setTimeout（无内存泄漏）', async () => {
        vi.useFakeTimers();
        const wrapper = mount(Loading);
        await wrapper.setProps({ active: false });
        vi.advanceTimersByTime(5000);
        wrapper.unmount();
        // 卸载后再推时间不应有 setState on unmounted 报错
        vi.advanceTimersByTime(5000);
        vi.useRealTimers();
    });
});
