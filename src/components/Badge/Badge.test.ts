import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Badge from './Badge.vue';
import type { BadgeColor } from './types';

const setup = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) => {
    const wrapper = mount(Badge, { props, ...options });
    const sup = () => wrapper.find('sup');
    const hasIndicator = () => sup().exists();
    return { wrapper, sup, hasIndicator };
};

/** 带被包裹元素的挂载（等价于 React 版的 children） */
const withChild = (props: Record<string, unknown> = {}, child = '头像') =>
    mount(Badge, { props, slots: { default: h('span', {}, child) } });

describe('Badge', () => {
    describe('rendering', () => {
        it('渲染 count 数字', () => {
            const { wrapper } = setup({ count: 5 });
            expect(wrapper.text()).toBe('5');
        });

        it('包裹默认插槽并叠加角标', () => {
            const wrapper = withChild({ count: 5 });
            expect(wrapper.classes()).toContain('animal-badge');
            expect(wrapper.classes()).not.toContain('animal-badge--standalone');
            expect(wrapper.text()).toContain('头像');
            expect(wrapper.text()).toContain('5');
        });

        it('默认应用 medium 尺寸与 app-red 颜色', () => {
            const { sup } = setup({ count: 5 });
            expect(sup().classes()).toContain('animal-badge--medium');
            expect(sup().classes()).toContain('animal-badge--color-app-red');
        });

        it('渲染为 sup 元素，便于附着在被包裹元素右上角', () => {
            const { hasIndicator } = setup({ count: 5 });
            expect(hasIndicator()).toBe(true);
        });

        it('支持 class 与 style', () => {
            const wrapper = mount(Badge, {
                props: { count: 1 },
                attrs: { class: 'x', style: 'margin-left: 4px' },
            });
            expect(wrapper.classes()).toContain('x');
            expect(wrapper.attributes('style')).toContain('margin-left: 4px');
        });

        it('透传原生属性', () => {
            const wrapper = mount(Badge, { props: { count: 1 }, attrs: { 'aria-label': '未读消息' } });
            expect(wrapper.attributes('aria-label')).toBe('未读消息');
        });
    });

    describe('count 显隐', () => {
        it('不传 count 时不渲染角标', () => {
            const { hasIndicator } = setup({}, { slots: { default: h('span', {}, '头像') } });
            expect(hasIndicator()).toBe(false);
        });

        it('count 为 0 时默认隐藏', () => {
            const { hasIndicator } = setup({ count: 0 });
            expect(hasIndicator()).toBe(false);
        });

        it('count 为 0 且 showZero 时展示', () => {
            const { wrapper } = setup({ count: 0, showZero: true });
            expect(wrapper.text()).toBe('0');
        });

        it('字符串 "0" 同样按零值处理', () => {
            const { hasIndicator } = setup({ count: '0' });
            expect(hasIndicator()).toBe(false);
        });

        it('空字符串 count 不渲染角标', () => {
            const { hasIndicator } = setup({ count: '' }, { slots: { default: h('span', {}, '头像') } });
            expect(hasIndicator()).toBe(false);
        });

        it('纯空白字符串 count 不渲染角标', () => {
            const { hasIndicator } = setup({ count: '   ' }, { slots: { default: h('span', {}, '头像') } });
            expect(hasIndicator()).toBe(false);
        });

        it('空字符串 count 在 dot 模式下仍展示小圆点', () => {
            const { sup } = setup({ count: '', dot: true }, { slots: { default: h('span', {}, '头像') } });
            expect(sup().classes()).toContain('animal-badge--dot');
        });

        it('#count 插槽作为自定义角标内容', () => {
            const wrapper = mount(Badge, {
                props: { count: 99 },
                slots: { count: h('span', { 'data-testid': 'icon' }, 'icon') },
            });
            expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('icon');
        });

        it('#count 插槽内容不参与封顶', () => {
            const wrapper = mount(Badge, {
                props: { count: 100, overflowCount: 1 },
                slots: { count: h('span', { 'data-testid': 'icon' }, 'icon') },
            });
            expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true);
            expect(wrapper.text()).not.toContain('1+');
        });

        it('原生 title 展示真实数值', () => {
            const { sup } = setup({ count: 1000 });
            expect(sup().attributes('title')).toBe('1000');
        });

        it('显式传入 title 时优先使用，且不落到根节点', () => {
            const wrapper = mount(Badge, { props: { count: 1000 }, attrs: { title: '未读 1000 条' } });
            expect(wrapper.find('sup').attributes('title')).toBe('未读 1000 条');
            expect(wrapper.attributes('title')).toBeUndefined();
        });
    });

    describe('overflowCount', () => {
        it('默认超过 99 显示 99+', () => {
            const { wrapper } = setup({ count: 100 });
            expect(wrapper.text()).toBe('99+');
        });

        it('count 等于 99 时不封顶', () => {
            const { wrapper } = setup({ count: 99 });
            expect(wrapper.text()).toBe('99');
        });

        it('自定义 overflowCount', () => {
            const { wrapper } = setup({ count: 99, overflowCount: 10 });
            expect(wrapper.text()).toBe('10+');
        });

        it('数字字符串参与封顶换算', () => {
            const { wrapper } = setup({ count: '1000', overflowCount: 999 });
            expect(wrapper.text()).toBe('999+');
        });

        it('非数字字符串不参与封顶，原样展示', () => {
            const { wrapper } = setup({ count: 'NEW', overflowCount: 1 });
            expect(wrapper.text()).toBe('NEW');
        });
    });

    describe('dot', () => {
        it('dot 只渲染小圆点，不渲染数字', () => {
            const { sup } = setup({ count: 5, dot: true }, { slots: { default: h('span', {}, '头像') } });
            expect(sup().classes()).toContain('animal-badge--dot');
            expect(sup().text()).toBe('');
        });

        it('dot 未传 count 时也展示', () => {
            const { sup } = setup({ dot: true }, { slots: { default: h('span', {}, '头像') } });
            expect(sup().classes()).toContain('animal-badge--dot');
        });

        it('dot 且 count 为 0 时隐藏', () => {
            const { hasIndicator } = setup({ dot: true, count: 0 });
            expect(hasIndicator()).toBe(false);
        });

        it('dot 时不设置 title', () => {
            const { sup } = setup({ dot: true, count: 5 });
            expect(sup().attributes('title')).toBeUndefined();
        });
    });

    describe('size', () => {
        it('size=small 应用对应类', () => {
            const { sup } = setup({ count: 5, size: 'small' });
            expect(sup().classes()).toContain('animal-badge--small');
        });

        it('size=medium 应用对应类', () => {
            const { sup } = setup({ count: 5, size: 'medium' });
            expect(sup().classes()).toContain('animal-badge--medium');
        });
    });

    describe('正圆与胶囊', () => {
        it('1–2 位内容锁成正圆', () => {
            const { sup } = setup({ count: 9 });
            expect(sup().classes()).toContain('animal-badge--circle');
        });

        it('3 位内容（封顶后）回退为胶囊', () => {
            const { sup } = setup({ count: 100 });
            expect(sup().classes()).not.toContain('animal-badge--circle');
        });

        it('两格全角字回退为胶囊', () => {
            const { sup } = setup({ count: '热更' });
            expect(sup().classes()).not.toContain('animal-badge--circle');
        });

        it('一格全角字仍是正圆', () => {
            const { sup } = setup({ count: '新' });
            expect(sup().classes()).toContain('animal-badge--circle');
        });
    });

    describe('color', () => {
        const COLORS: BadgeColor[] = [
            'app-red',
            'app-pink',
            'app-orange',
            'app-yellow',
            'app-teal',
            'app-green',
            'app-blue',
            'purple',
            'lime-green',
            'yellow-green',
            'brown',
            'warm-peach-pink',
        ];

        it.each(COLORS)('color=%s 应用对应类', (color) => {
            const { sup } = setup({ count: 5, color });
            expect(sup().classes()).toContain(`animal-badge--color-${color}`);
        });
    });

    describe('独立使用', () => {
        it('未传默认插槽时应用 standalone 类', () => {
            const { wrapper } = setup({ count: 11 });
            expect(wrapper.classes()).toContain('animal-badge--standalone');
        });

        it('传入默认插槽时不应用 standalone 类', () => {
            const wrapper = withChild({ count: 11 });
            expect(wrapper.classes()).not.toContain('animal-badge--standalone');
        });
    });
});
