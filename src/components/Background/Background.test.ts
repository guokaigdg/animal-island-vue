import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Background from './Background.vue';

describe('Background', () => {
    it('默认 type=default：应用基础类与奶油色波点类', () => {
        const wrapper = mount(Background);
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-background')).toBe(true);
        expect(root.classList.contains('animal-background--default')).toBe(true);
    });

    it('支持自定义 type=sprinkles', () => {
        const wrapper = mount(Background, { props: { type: 'sprinkles' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-background--sprinkles')).toBe(true);
    });

    it('支持 type=grid（网格壁纸）', () => {
        const wrapper = mount(Background, { props: { type: 'grid' } });
        expect((wrapper.element as HTMLElement).classList.contains('animal-background--grid')).toBe(true);
    });

    it('支持 type=dots-dark-green（深绿波点）与 dots-* 底色对应 Card pattern 系列', () => {
        const darkGreen = mount(Background, { props: { type: 'dots-dark-green' } });
        expect((darkGreen.element as HTMLElement).classList.contains('animal-background--dots-dark-green')).toBe(true);
        const pink = mount(Background, { props: { type: 'dots-pink' } });
        expect((pink.element as HTMLElement).classList.contains('animal-background--dots-pink')).toBe(true);
    });

    it('支持场景背景图 type=sweet-corner / coffee-break（注入 backgroundImage）', () => {
        const sweet = mount(Background, { props: { type: 'sweet-corner' } });
        const sweetRoot = sweet.element as HTMLElement;
        expect(sweetRoot.classList.contains('animal-background--sweet-corner')).toBe(true);
        expect(sweetRoot.style.backgroundImage).toMatch(/url\(.*sweet-corner(\.svg)?/);

        const coffee = mount(Background, { props: { type: 'coffee-break' } });
        const coffeeRoot = coffee.element as HTMLElement;
        expect(coffeeRoot.classList.contains('animal-background--coffee-break')).toBe(true);
        expect(coffeeRoot.style.backgroundImage).toMatch(/url\(.*coffee-break(\.svg)?/);
    });

    it('渲染 children 于背景之上', () => {
        const wrapper = mount(Background, {
            slots: { default: () => '<p>岛屿内容</p>' },
        });
        expect(wrapper.text()).toContain('岛屿内容');
    });

    it('应用 class 与 style，用户 style 覆盖组件注入的 backgroundImage', () => {
        const wrapper = mount(Background, {
            props: { type: 'sweet-corner' },
            attrs: { class: 'extra', style: { height: '100px' } },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('extra')).toBe(true);
        expect(root.getAttribute('style')).toContain('height: 100px');
        expect(root.style.backgroundImage).toMatch(/url\(.*sweet-corner/);

        // 用户显式传 backgroundImage 时覆盖场景图（与 React 版 {...bgImage, ...style} 语义一致）
        const override = mount(Background, {
            props: { type: 'sweet-corner' },
            attrs: { style: { backgroundImage: 'none' } },
        });
        expect((override.element as HTMLElement).style.backgroundImage).toBe('none');
    });
});
