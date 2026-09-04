import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from './Footer.vue';

describe('Footer', () => {
    it('渲染 animal-footer 根元素', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer')).toBe(true);
        expect(root.textContent).toContain('🎄');
    });

    it('默认 seamless=false 不添加 seamless 类', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer--seamless')).toBe(false);
    });

    it('显式 seamless={true} 添加 seamless 类', () => {
        const wrapper = mount(Footer, { props: { seamless: true } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer--seamless')).toBe(true);
    });

    it('seamless={false} 关闭无缝拼接', () => {
        const wrapper = mount(Footer, { props: { seamless: false } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer--seamless')).toBe(false);
    });
});
