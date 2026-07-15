import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import Tabs from './Tabs.vue';
import type { TabItem } from './types';

const items: TabItem[] = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
];

const paneSlots = {
    a: () => h('div', { 'data-testid': 'pane-a' }, 'PaneA'),
    b: () => h('div', { 'data-testid': 'pane-b' }, 'PaneB'),
    c: () => h('div', { 'data-testid': 'pane-c' }, 'PaneC'),
};

describe('Tabs', () => {
    it('默认渲染第一个 tab 的内容', () => {
        const wrapper = mount(Tabs, { props: { items }, slots: paneSlots });
        expect(wrapper.find('[data-testid="pane-a"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="pane-b"]').exists()).toBe(false);
    });

    it('defaultActiveKey 设置初始 active', () => {
        const wrapper = mount(Tabs, {
            props: { items, defaultActiveKey: 'b' },
            slots: paneSlots,
        });
        expect(wrapper.find('[data-testid="pane-b"]').exists()).toBe(true);
    });

    it('点击 tab 切换内容并触发 change', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Tabs, {
            props: { items, onChange },
            slots: paneSlots,
        });
        const buttons = wrapper.findAll('.animal-tabs__item');
        await buttons[1].trigger('click');
        expect(onChange).toHaveBeenCalledWith('b');
        expect(wrapper.find('[data-testid="pane-b"]').exists()).toBe(true);
    });

    it('受控 modelValue 不自更新', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Tabs, {
            props: { items, modelValue: 'a', 'onUpdate:modelValue': onChange },
            slots: paneSlots,
        });
        const buttons = wrapper.findAll('.animal-tabs__item');
        await buttons[1].trigger('click');
        expect(onChange).toHaveBeenCalledWith('b');
        // 受控下 UI 仍展示 a 的内容
        expect(wrapper.find('[data-testid="pane-a"]').exists()).toBe(true);
    });

    it('受控时父级回写 → UI 切换', async () => {
        const Host = defineComponent({
            setup() {
                const value = ref('a');
                return () =>
                    h(Tabs, {
                        items,
                        modelValue: value.value,
                        'onUpdate:modelValue': (v: string) => {
                            value.value = v;
                        },
                    }, paneSlots);
            },
        });
        const wrapper = mount(Host);
        const buttons = wrapper.findAll('.animal-tabs__item');
        await buttons[2].trigger('click');
        expect(wrapper.find('[data-testid="pane-c"]').exists()).toBe(true);
    });

    it('active 项添加 active 类', () => {
        const wrapper = mount(Tabs, {
            props: { items, defaultActiveKey: 'b' },
            slots: paneSlots,
        });
        const buttons = wrapper.findAll('.animal-tabs__item');
        expect(buttons[1].classes()).toContain('animal-tabs__item--active');
        expect(buttons[0].classes()).not.toContain('animal-tabs__item--active');
    });

    describe('a11y', () => {
        it('tablist / tab / tabpanel 角色 + aria-selected + aria-controls 双向关联', () => {
            const wrapper = mount(Tabs, {
                props: { items, ariaLabel: '水果' },
                slots: paneSlots,
            });
            const tablist = wrapper.find('[role="tablist"]');
            expect(tablist.exists()).toBe(true);
            expect(tablist.attributes('aria-label')).toBe('水果');

            const tabs = wrapper.findAll('[role="tab"]');
            expect(tabs.length).toBe(items.length);
            expect(tabs[0].attributes('aria-selected')).toBe('true');
            expect(tabs[1].attributes('aria-selected')).toBe('false');

            const panel = wrapper.find('[role="tabpanel"]');
            expect(panel.exists()).toBe(true);
            expect(panel.attributes('aria-labelledby')).toBe(tabs[0].attributes('id'));
            expect(tabs[0].attributes('aria-controls')).toBe(panel.attributes('id'));
        });

        it('roving tabindex：仅 active tab 为 0，其余为 -1', () => {
            const wrapper = mount(Tabs, {
                props: { items, defaultActiveKey: 'b' },
                slots: paneSlots,
            });
            const tabs = wrapper.findAll('[role="tab"]');
            expect(tabs[0].attributes('tabindex')).toBe('-1');
            expect(tabs[1].attributes('tabindex')).toBe('0');
            expect(tabs[2].attributes('tabindex')).toBe('-1');
        });

        it('ArrowRight / ArrowLeft 切换 tab 并迁移焦点', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Tabs, {
                props: { items, onChange },
                slots: paneSlots,
                attachTo: document.body,
            });
            const tabs = wrapper.findAll('[role="tab"]');
            (tabs[0].element as HTMLButtonElement).focus();
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' });
            expect(onChange).toHaveBeenLastCalledWith('b');
            expect(document.activeElement).toBe(tabs[1].element);
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' });
            expect(onChange).toHaveBeenLastCalledWith('a');
            expect(document.activeElement).toBe(tabs[0].element);
            wrapper.unmount();
        });

        it('ArrowLeft 在首项循环到末项；ArrowRight 在末项循环到首项', async () => {
            const wrapper = mount(Tabs, {
                props: { items },
                slots: paneSlots,
                attachTo: document.body,
            });
            const tabs = wrapper.findAll('[role="tab"]');
            (tabs[0].element as HTMLButtonElement).focus();
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' });
            expect(document.activeElement).toBe(tabs[items.length - 1].element);
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' });
            expect(document.activeElement).toBe(tabs[0].element);
            wrapper.unmount();
        });

        it('Home / End 跳到首尾项', async () => {
            const wrapper = mount(Tabs, {
                props: { items, defaultActiveKey: 'b' },
                slots: paneSlots,
                attachTo: document.body,
            });
            const tabs = wrapper.findAll('[role="tab"]');
            (tabs[1].element as HTMLButtonElement).focus();
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'End' });
            expect(document.activeElement).toBe(tabs[items.length - 1].element);
            await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'Home' });
            expect(document.activeElement).toBe(tabs[0].element);
            wrapper.unmount();
        });
    });
});
