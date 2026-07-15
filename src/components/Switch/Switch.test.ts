import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Switch from './Switch.vue';

describe('Switch', () => {
    describe('rendering', () => {
        it('挂载为 role="switch" button', () => {
            const wrapper = mount(Switch);
            const btn = wrapper.get('button');
            expect(btn.attributes('role')).toBe('switch');
            expect(btn.attributes('aria-checked')).toBe('false');
        });

        it('应用 className', () => {
            const wrapper = mount(Switch, { attrs: { class: 'my-sw' } });
            expect(wrapper.classes()).toContain('my-sw');
        });

        it('size=small 应用对应类', () => {
            const wrapper = mount(Switch, { props: { size: 'small' } });
            expect(wrapper.classes()).toContain('animal-switch--small');
        });

        it('checked / unchecked slot 按状态显示', async () => {
            const wrapper = mount(Switch, {
                props: { modelValue: false },
                slots: {
                    checked: h('span', {}, 'ON'),
                    unchecked: h('span', {}, 'OFF'),
                },
            });
            expect(wrapper.text()).toContain('OFF');
            await wrapper.setProps({ modelValue: true });
            expect(wrapper.text()).toContain('ON');
        });
    });

    describe('uncontrolled', () => {
        it('defaultChecked=true 初始选中', () => {
            const wrapper = mount(Switch, { props: { defaultChecked: true } });
            expect(wrapper.attributes('aria-checked')).toBe('true');
        });

        it('点击切换并触发 onChange', async () => {
            const wrapper = mount(Switch);
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
            expect(wrapper.emitted('change')![0][0]).toBe(true);
            expect(wrapper.attributes('aria-checked')).toBe('true');
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')![1][0]).toBe(false);
        });
    });

    describe('controlled', () => {
        it('modelValue 受控时不自更新', async () => {
            const wrapper = mount(Switch, { props: { modelValue: false } });
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
            expect(wrapper.attributes('aria-checked')).toBe('false');
        });

        it('父级回写后 UI 同步', async () => {
            const wrapper = mount(Switch, { props: { modelValue: false } });
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
            await wrapper.setProps({ modelValue: true });
            expect(wrapper.attributes('aria-checked')).toBe('true');
        });
    });

    describe('disabled / loading', () => {
        it('disabled 时点击不触发 onChange', async () => {
            const wrapper = mount(Switch, { props: { disabled: true } });
            expect(wrapper.attributes('disabled')).toBeDefined();
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('loading 时点击不触发 onChange', async () => {
            const wrapper = mount(Switch, { props: { loading: true } });
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            expect(wrapper.classes()).toContain('animal-switch--loading');
        });
    });

    describe('a11y', () => {
        it('Space 键 toggle', async () => {
            const wrapper = mount(Switch);
            await wrapper.trigger('keydown', { key: ' ' });
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
            await wrapper.trigger('keydown', { key: ' ' });
            expect(wrapper.emitted('update:modelValue')![1][0]).toBe(false);
        });

        it('Enter 键 toggle', async () => {
            const wrapper = mount(Switch);
            await wrapper.trigger('keydown', { key: 'Enter' });
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
        });

        it('disabled / loading 时键盘不响应', async () => {
            const wrapper = mount(Switch, { props: { disabled: true } });
            await wrapper.trigger('keydown', { key: ' ' });
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('aria-label 透传', () => {
            const wrapper = mount(Switch, { attrs: { 'aria-label': '深色模式' } });
            expect(wrapper.attributes('aria-label')).toBe('深色模式');
        });
    });
});
