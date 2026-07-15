import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from './Footer.vue';

describe('Footer', () => {
    it('默认 type=tree', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer')).toBe(true);
        expect(root.classList.contains('animal-footer--tree')).toBe(true);
    });

    it('type=sea 不带 tree 类（sea 由默认背景实现）', () => {
        const wrapper = mount(Footer, { props: { type: 'sea' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer')).toBe(true);
        expect(root.classList.contains('animal-footer--tree')).toBe(false);
        expect(root.classList.contains('animal-footer--sea')).toBe(true);
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
