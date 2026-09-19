import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Title from './Title.vue';

describe('Title', () => {
    it('渲染 children 文本', () => {
        const wrapper = mount(Title, { slots: { default: 'Hello' } });
        expect(wrapper.text()).toContain('Hello');
    });

    it('默认 variant=ribbon 渲染飘带结构', () => {
        const wrapper = mount(Title, { slots: { default: 'X' } });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.attributes('style')).toContain('font-size: 20px');
        expect(wrapper.find('.animal-title__ribbon-front').exists()).toBe(true);
    });

    it('size=large 字号 28px', () => {
        const wrapper = mount(Title, {
            props: { size: 'large', variant: 'ribbon' },
            slots: { default: 'X' },
        });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.attributes('style')).toContain('font-size: 28px');
    });

    it('color 非 default 时应用 color-${color}', () => {
        const wrapper = mount(Title, {
            props: { color: 'app-pink', variant: 'ribbon' },
            slots: { default: 'X' },
        });
        const ribbon = wrapper.get('.animal-title__ribbon');
        expect(ribbon.classes()).toContain('animal-title__color--app-pink');
    });

    it('variant=layer 渲染双层纸结构', () => {
        const wrapper = mount(Title, {
            props: { variant: 'layer' },
            slots: { default: 'Layer' },
        });
        const layer = wrapper.get('.animal-title__layer');
        expect(layer.attributes('style')).toContain('font-size: 20px');
        expect(layer.find('.animal-title__layer-front').exists()).toBe(true);
        expect(wrapper.text()).toContain('Layer');
    });

    it('variant=layer 应用 color 到 layer 元素', () => {
        const wrapper = mount(Title, {
            props: { variant: 'layer', color: 'app-pink' },
            slots: { default: 'X' },
        });
        expect(wrapper.get('.animal-title__layer').classes()).toContain('animal-title__color--app-pink');
    });

    it('variant=tab 渲染折角便签结构', () => {
        const wrapper = mount(Title, {
            props: { variant: 'tab' },
            slots: { default: 'Tab' },
        });
        const tab = wrapper.get('.animal-title__tab');
        expect(tab.attributes('style')).toContain('font-size: 20px');
        expect(tab.find('.animal-title__tab-text').exists()).toBe(true);
        expect(wrapper.text()).toContain('Tab');
    });

    it('variant=tab 应用 color 到 tab 元素', () => {
        const wrapper = mount(Title, {
            props: { variant: 'tab', color: 'lime-green' },
            slots: { default: 'X' },
        });
        expect(wrapper.get('.animal-title__tab').classes()).toContain('animal-title__color--lime-green');
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
