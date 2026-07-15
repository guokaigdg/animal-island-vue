import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Title from './Title.vue';

describe('Title', () => {
    it('渲染 children 文本', () => {
        const wrapper = mount(Title, { slots: { default: 'Hello' } });
        expect(wrapper.text()).toContain('Hello');
    });

    it('默认 size=middle 字号 20px', () => {
        const wrapper = mount(Title, { slots: { default: 'X' } });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.attributes('style')).toContain('font-size: 20px');
    });

    it('size=large 字号 28px', () => {
        const wrapper = mount(Title, { props: { size: 'large' }, slots: { default: 'X' } });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.attributes('style')).toContain('font-size: 28px');
    });

    it('color 非 default 时应用 color-${color}', () => {
        const wrapper = mount(Title, { props: { color: 'app-pink' }, slots: { default: 'X' } });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.classes()).toContain('animal-title__ribbon--app-pink');
    });

    it('应用 className 与 style 到根 span', () => {
        const wrapper = mount(Title, {
            attrs: { class: 'my-t', style: 'margin-left: 4px' },
            slots: { default: 'X' },
        });
        expect(wrapper.classes()).toContain('my-t');
        expect(wrapper.attributes('style')).toContain('margin-left: 4px');
    });
});
