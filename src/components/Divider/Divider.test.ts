import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { FishIcon } from 'naive-icons-vue';
import Divider from './Divider.vue';

describe('Divider', () => {
    it('默认 type=dashed-brown', () => {
        const wrapper = mount(Divider);
        expect(wrapper.classes()).toContain('animal-divider');
        expect(wrapper.classes()).toContain('animal-divider--dashed-brown');
    });

    it('支持自定义 type', () => {
        const wrapper = mount(Divider, { props: { type: 'dashed-brown' } });
        expect(wrapper.classes()).toContain('animal-divider--dashed-brown');
    });

    it('应用 className 与 style', () => {
        const wrapper = mount(Divider, {
            attrs: { class: 'x', style: 'width: 100px' },
        });
        expect(wrapper.classes()).toContain('x');
        expect(wrapper.element.style.width).toBe('100px');
    });

    it('icon 模式下渲染图标组件相连分割线', () => {
        const wrapper = mount(Divider, { props: { icon: FishIcon } });
        expect(wrapper.classes()).toContain('animal-divider--icon');
        expect(wrapper.find('svg').exists()).toBe(true);
        expect(wrapper.find('.animal-divider__icon-cycle').exists()).toBe(true);
    });
});
