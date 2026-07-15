import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Card from './Card.vue';

describe('Card', () => {
    it('渲染 children', () => {
        const wrapper = mount(Card, {
            slots: { default: h('span', { 'data-testid': 'c' }, 'hi') },
        });
        expect(wrapper.find('[data-testid="c"]').exists()).toBe(true);
    });

    it('默认不带类型/颜色/花纹相关类', () => {
        const wrapper = mount(Card, { slots: { default: 'x' } });
        expect(wrapper.classes()).toContain('animal-card');
        expect(wrapper.classes()).not.toContain('animal-card--dashed');
    });

    it('默认不应用 card-hoverable 类', () => {
        const wrapper = mount(Card, { slots: { default: 'x' } });
        expect(wrapper.classes()).not.toContain('animal-card--hoverable');
    });

    it('hoverable=false 显式不应用 card-hoverable 类', () => {
        const wrapper = mount(Card, {
            props: { hoverable: false },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).not.toContain('animal-card--hoverable');
    });

    it('hoverable=true 应用 card-hoverable 类', () => {
        const wrapper = mount(Card, {
            props: { hoverable: true },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--hoverable');
    });

    it('hoverable 与 type / color / pattern 自由组合', () => {
        const wrapper = mount(Card, {
            props: {
                hoverable: true,
                type: 'dashed',
                color: 'app-pink',
                pattern: 'purple',
            },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--hoverable');
        expect(wrapper.classes()).toContain('animal-card--dashed');
        expect(wrapper.classes()).toContain('animal-card--color-app-pink');
        expect(wrapper.classes()).toContain('animal-card--pattern-purple');
    });

    it('type=dashed 应用对应类', () => {
        const wrapper = mount(Card, {
            props: { type: 'dashed' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--dashed');
    });

    it('color 非 default 时应用 card-color-${color}', () => {
        const wrapper = mount(Card, {
            props: { color: 'app-pink' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--color-app-pink');
    });

    it('pattern 非 none 时应用 pattern-${pattern}', () => {
        const wrapper = mount(Card, {
            props: { pattern: 'purple' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--pattern-purple');
    });

    it('透传原生 div 属性（onClick / className / style）', () => {
        const wrapper = mount(Card, {
            attrs: {
                class: 'extra',
                style: 'margin-top: 5px',
                'data-testid': 'root',
            },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('extra');
        expect(wrapper.element.style.marginTop).toBe('5px');
        expect(wrapper.attributes('data-testid')).toBe('root');
    });

    // ---------- 补充测试 ----------

    it('type=default 显式不应用 card-dashed', () => {
        const wrapper = mount(Card, {
            props: { type: 'default' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).not.toContain('animal-card--dashed');
    });

    it('color=default 显式不应用任何 card-color-${color} 类', () => {
        const wrapper = mount(Card, {
            props: { color: 'default' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).not.toContain('animal-card--color-app-pink');
        expect(wrapper.classes()).not.toContain('animal-card--color-purple');
    });

    it('pattern=none 显式不应用任何 pattern-${pattern} 类', () => {
        const wrapper = mount(Card, {
            props: { pattern: 'none' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).not.toContain('animal-card--pattern-app-pink');
        expect(wrapper.classes()).not.toContain('animal-card--pattern-default');
    });

    it('color 全部 12 种枚举都生成对应 class', () => {
        const colors = [
            'app-pink',
            'purple',
            'app-blue',
            'app-yellow',
            'app-orange',
            'app-teal',
            'app-green',
            'app-red',
            'lime-green',
            'yellow-green',
            'brown',
            'warm-peach-pink',
        ] as const;
        for (const c of colors) {
            const wrapper = mount(Card, {
                props: { color: c },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain(`animal-card--color-${c}`);
            wrapper.unmount();
        }
    });

    it('pattern 全部 13 种枚举（none 之外的）都生成对应 class', () => {
        const patterns = [
            'default',
            'app-pink',
            'purple',
            'app-blue',
            'app-yellow',
            'app-orange',
            'app-teal',
            'app-green',
            'app-red',
            'lime-green',
            'yellow-green',
            'brown',
            'warm-peach-pink',
        ] as const;
        for (const p of patterns) {
            const wrapper = mount(Card, {
                props: { pattern: p },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain(`animal-card--pattern-${p}`);
            wrapper.unmount();
        }
    });

    it('type + color + pattern 三者组合时同时应用对应 class', () => {
        const wrapper = mount(Card, {
            props: { type: 'dashed', color: 'app-pink', pattern: 'purple' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('animal-card--dashed');
        expect(wrapper.classes()).toContain('animal-card--color-app-pink');
        expect(wrapper.classes()).toContain('animal-card--pattern-purple');
    });

    it('children 为空字符串时正常渲染根 div', () => {
        const wrapper = mount(Card, { slots: { default: '' } });
        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.classes()).toContain('animal-card');
    });

    it('children 为数字 / 字符串 / 节点均可', () => {
        const w1 = mount(Card, { slots: { default: '42' } });
        expect(w1.text()).toBe('42');
        w1.unmount();

        const w2 = mount(Card, { slots: { default: 'plain text' } });
        expect(w2.text()).toBe('plain text');
        w2.unmount();

        const w3 = mount(Card, {
            slots: { default: h('em', { 'data-testid': 'e' }, 'em') },
        });
        expect(w3.find('[data-testid="e"]').exists()).toBe(true);
    });

    it('onClick 在 Card 上被点击时触发', async () => {
        const onClick = vi.fn();
        const wrapper = mount(Card, {
            attrs: { onClick },
            slots: { default: 'x' },
        });
        await wrapper.trigger('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('className 透传与 hoverable 共存', () => {
        const wrapper = mount(Card, {
            props: { hoverable: true },
            attrs: { class: 'custom' },
            slots: { default: 'x' },
        });
        expect(wrapper.classes()).toContain('custom');
        expect(wrapper.classes()).toContain('animal-card--hoverable');
    });

    it('aria-* / data-* 透传', () => {
        const wrapper = mount(Card, {
            attrs: {
                'aria-label': 'card',
                'data-testid': 'card-root',
                role: 'region',
            },
            slots: { default: 'x' },
        });
        expect(wrapper.attributes('aria-label')).toBe('card');
        expect(wrapper.attributes('data-testid')).toBe('card-root');
        expect(wrapper.attributes('role')).toBe('region');
    });
});
