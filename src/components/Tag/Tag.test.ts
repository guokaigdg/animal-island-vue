import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from './Tag.vue';

describe('Tag', () => {
    describe('rendering', () => {
        it('默认渲染 children 文本', () => {
            const wrapper = mount(Tag, { slots: { default: 'hello' } });
            expect(wrapper.text()).toContain('hello');
        });

        it('默认应用基础 tag 类与 medium/solid 尺寸', () => {
            const wrapper = mount(Tag, { slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag');
            expect(wrapper.classes()).toContain('animal-tag--medium');
            expect(wrapper.classes()).toContain('animal-tag--solid');
        });

        it('支持 className 与 style', () => {
            const wrapper = mount(Tag, {
                attrs: { class: 'x', style: 'margin-left: 4px' },
                slots: { default: 't' },
            });
            expect(wrapper.classes()).toContain('x');
            expect(wrapper.attributes('style')).toContain('margin-left: 4px');
        });
    });

    describe('size', () => {
        it('size=small 应用对应类', () => {
            const wrapper = mount(Tag, { props: { size: 'small' }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag--small');
        });

        it('size=large 应用对应类', () => {
            const wrapper = mount(Tag, { props: { size: 'large' }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag--large');
        });
    });

    describe('variant', () => {
        it('variant=outlined 应用对应类', () => {
            const wrapper = mount(Tag, { props: { variant: 'outlined' }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag--outlined');
        });

        it('variant=dashed 应用对应类', () => {
            const wrapper = mount(Tag, { props: { variant: 'dashed' }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag--dashed');
        });
    });

    describe('color', () => {
        it('color=default 不应用任何 color 类', () => {
            const wrapper = mount(Tag, { props: { color: 'default' }, slots: { default: 'x' } });
            expect(wrapper.classes()).not.toContain('animal-tag--colored');
        });

        it('color=app-pink + solid 应用 color-app-pink-solid 类', () => {
            const wrapper = mount(Tag, {
                props: { color: 'app-pink', variant: 'solid' },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain('animal-tag--app-pink');
        });

        it('color=purple + outlined 应用 color-purple-outlined 类', () => {
            const wrapper = mount(Tag, {
                props: { color: 'purple', variant: 'outlined' },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain('animal-tag--purple');
        });

        it('color=app-blue + dashed 应用 color-app-blue-dashed 类', () => {
            const wrapper = mount(Tag, {
                props: { color: 'app-blue', variant: 'dashed' },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain('animal-tag--app-blue');
        });
    });

    describe('closable', () => {
        it('closable=true 渲染关闭按钮', () => {
            const wrapper = mount(Tag, { props: { closable: true }, slots: { default: 'x' } });
            expect(wrapper.find('button[aria-label="close"]').exists()).toBe(true);
        });

        it('点击关闭按钮触发 onClose', async () => {
            const wrapper = mount(Tag, {
                props: { closable: true },
                slots: { default: 'x' },
            });
            await wrapper.get('button[aria-label="close"]').trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it('disabled 状态下点击关闭按钮不触发 onClose', async () => {
            const wrapper = mount(Tag, {
                props: { closable: true, disabled: true },
                slots: { default: 'x' },
            });
            const btn = wrapper.get('button[aria-label="close"]');
            expect(btn.attributes('disabled')).toBeDefined();
            await btn.trigger('click');
            expect(wrapper.emitted('close')).toBeUndefined();
        });
    });

    describe('clickable', () => {
        it('提供 onClick 后标签渲染为 role=button 且可点击', async () => {
            const onClick = vi.fn();
            const wrapper = mount(Tag, {
                attrs: { onClick },
                slots: { default: 'x' },
            });
            expect(wrapper.attributes('role')).toBe('button');
            expect(wrapper.classes()).toContain('animal-tag--clickable');
            await wrapper.trigger('click');
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('disabled 状态下不响应 onClick', async () => {
            const onClick = vi.fn();
            const wrapper = mount(Tag, {
                props: { disabled: true },
                attrs: { onClick },
                slots: { default: 'x' },
            });
            expect(wrapper.classes()).toContain('animal-tag--disabled');
            await wrapper.trigger('click');
            expect(onClick).not.toHaveBeenCalled();
        });

        it('键盘 Enter 触发 onClick', async () => {
            const onClick = vi.fn();
            const wrapper = mount(Tag, {
                attrs: { onClick },
                slots: { default: 'x' },
            });
            await wrapper.trigger('keydown', { key: 'Enter' });
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('未提供 onClick 时不渲染为 button', () => {
            const wrapper = mount(Tag, { slots: { default: 'x' } });
            expect(wrapper.attributes('role')).toBeUndefined();
        });
    });

    describe('disabled', () => {
        it('应用 is-disabled 类', () => {
            const wrapper = mount(Tag, { props: { disabled: true }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain('animal-tag--disabled');
        });
    });

    describe('event isolation', () => {
        it('点击关闭按钮不会冒泡触发 onClick', async () => {
            const onClick = vi.fn();
            const wrapper = mount(Tag, {
                props: { closable: true },
                attrs: { onClick },
                slots: { default: 'x' },
            });
            await wrapper.get('button[aria-label="close"]').trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
            expect(onClick).not.toHaveBeenCalled();
        });
    });
});
