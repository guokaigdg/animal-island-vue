import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Background from './Background.vue';

describe('Background', () => {
    it('默认 type=dots：仅应用基础 animal-background 类', () => {
        const wrapper = mount(Background);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-background')).toBe(true);
        expect(root.classList.contains('animal-background--sprinkles')).toBe(false);
    });

    it('支持自定义 type=sprinkles', () => {
        const wrapper = mount(Background, { props: { type: 'sprinkles' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-background')).toBe(true);
        expect(root.classList.contains('animal-background--sprinkles')).toBe(true);
    });

    it('渲染 children 于背景之上', () => {
        const wrapper = mount(Background, {
            slots: { default: () => '<p>岛屿内容</p>' },
        });
        expect(wrapper.text()).toContain('岛屿内容');
    });

    it('应用 class 与 style', () => {
        const wrapper = mount(Background, {
            attrs: { class: 'extra', style: 'height: 100px;' },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('extra')).toBe(true);
        expect(root.getAttribute('style')).toContain('height: 100px');
    });
});
