import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from './Footer.vue';

describe('Footer', () => {
    it('渲染 animal-footer 根元素，内容为图标链（非 emoji 文本）', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer')).toBe(true);
        // React 端 Footer 是「全部内置 Icon 相连」的图标链
        expect(root.querySelectorAll('svg').length).toBeGreaterThan(10);
    });

    it('默认使用全部图标铺满（单个 cycle 含多个图标）', () => {
        const wrapper = mount(Footer);
        const firstCycle = wrapper.get('.animal-footer__cycle');
        expect(firstCycle.findAll('svg').length).toBeGreaterThan(10);
    });

    it('size 控制图标尺寸', () => {
        const wrapper = mount(Footer, { props: { size: 32 } });
        expect(wrapper.get('svg').attributes('style')).toContain('32px');
    });

    it('name 指定单一图标名时整条链只用该图标', () => {
        const wrapper = mount(Footer, { props: { name: 'Heart' } });
        const firstCycle = wrapper.get('.animal-footer__cycle');
        expect(firstCycle.findAll('svg').length).toBe(1);
    });

    it('className / style 由 fallthrough 透传到根元素', () => {
        const wrapper = mount(Footer, { attrs: { class: 'custom', style: 'margin: 4px;' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('custom')).toBe(true);
        expect(root.getAttribute('style')).toContain('margin: 4px');
    });
});
