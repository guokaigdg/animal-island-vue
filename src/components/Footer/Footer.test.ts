import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from './Footer.vue';

const thisYear = new Date().getFullYear();

describe('Footer', () => {
    it('默认渲染版权栏（当前年份 + 默认文案）', () => {
        const wrapper = mount(Footer);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-footer')).toBe(true);
        expect(root.tagName).toBe('FOOTER');
        expect(root.textContent).toContain(`© ${thisYear} All Rights Reserved.`);
    });

    it('text 可自定义文案', () => {
        const wrapper = mount(Footer, { props: { text: 'Pocket Projects Inc.' } });
        expect(wrapper.element.textContent).toContain(`© ${thisYear} Pocket Projects Inc.`);
    });

    it('year 可自定义年份', () => {
        const wrapper = mount(Footer, { props: { text: 'Acme', year: 2020 } });
        expect(wrapper.element.textContent).toContain('© 2020 Acme');
    });

    it('className / style 由 fallthrough 透传到根元素', () => {
        const wrapper = mount(Footer, { attrs: { class: 'custom', style: 'fontSize: 14px;' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('custom')).toBe(true);
        expect(root.style.fontSize).toBe('14px');
    });

    it('year prop 变化时年份随之更新', async () => {
        const wrapper = mount(Footer, { props: { text: 'Acme', year: 2020 } });
        expect(wrapper.element.textContent).toContain('© 2020 Acme');
        await wrapper.setProps({ year: 2021 });
        expect(wrapper.element.textContent).toContain('© 2021 Acme');
    });
});
