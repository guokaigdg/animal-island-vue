import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Cursor from './Cursor.vue';

describe('Cursor', () => {
    it('渲染 children 并包含 animal-cursor 类', () => {
        const wrapper = mount(Cursor, {
            slots: {
                default: () => h('span', { 'data-testid': 'child' }, 'child'),
            },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-cursor')).toBe(true);
        expect(wrapper.find('[data-testid="child"]').exists()).toBe(true);
    });

    it('forceAll=true（默认）应用 animal-cursor--force', () => {
        const wrapper = mount(Cursor, { slots: { default: () => 'x' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-cursor--force')).toBe(true);
    });

    it('forceAll=false 应用 animal-cursor--scoped', () => {
        const wrapper = mount(Cursor, { props: { forceAll: false }, slots: { default: () => 'x' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-cursor--scoped')).toBe(true);
    });

    it('应用 className 与 style', () => {
        const wrapper = mount(Cursor, {
            attrs: { class: 'extra', style: 'padding: 4px;' },
            slots: { default: () => 'x' },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('extra')).toBe(true);
        expect(root.getAttribute('style')).toContain('padding: 4px');
    });
});
