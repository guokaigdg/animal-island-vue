import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from './Footer.vue';

const thisYear = new Date().getFullYear();

describe('Footer', () => {
    it('默认渲染版权栏（当前年份 + 默认文案）', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.tagName).toBe('FOOTER');
        expect(root.classList.contains('animal-footer')).toBe(true);
        expect(wrapper.text()).toBe(`© ${thisYear} All Rights Reserved.`);
    });

    it('text 可自定义文案', () => {
        const wrapper = mount(Footer, { props: { text: 'Pocket Projects Inc.' } });
        expect(wrapper.text()).toContain(`© ${thisYear} Pocket Projects Inc.`);
    });

    it('year 可自定义年份', () => {
        const wrapper = mount(Footer, { props: { text: 'Acme', year: 2020 } });
        expect(wrapper.text()).toContain('© 2020 Acme');
    });

    it('year 缺省时动态取当前年份', () => {
        const wrapper = mount(Footer, { props: { text: 'Only' } });
        expect(wrapper.text()).toBe(`© ${thisYear} Only`);
    });

    it('className 与 style 经 attribute fallthrough 透传到根 <footer>', () => {
        const wrapper = mount(Footer, { attrs: { class: 'x', style: { fontSize: '14px' } } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('x')).toBe(true);
        expect(root.style.fontSize).toBe('14px');
    });
});
