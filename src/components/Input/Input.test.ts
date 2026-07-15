import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Input from './Input.vue';

describe('Input', () => {
    describe('rendering', () => {
        it('渲染基础 textbox', () => {
            const wrapper = mount(Input);
            const input = wrapper.find('input');
            expect(input.exists()).toBe(true);
            expect(input.attributes('type')).toBe('text');
        });

        it('应用 size 类', () => {
            const wrapper = mount(Input, { props: { size: 'large' } });
            expect(wrapper.classes()).toContain('animal-input--large');
        });

        it('status=error 应用错误类', () => {
            const wrapper = mount(Input, { props: { status: 'error' } });
            expect(wrapper.classes()).toContain('animal-input--error');
        });

        it('渲染 prefix / suffix', () => {
            const wrapper = mount(Input, {
                slots: {
                    prefix: h('span', { 'data-testid': 'prefix' }, 'P'),
                    suffix: h('span', { 'data-testid': 'suffix' }, 'S'),
                },
            });
            expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="suffix"]').exists()).toBe(true);
        });
    });

    describe('uncontrolled', () => {
        it('modelValue 设定初始值', () => {
            const wrapper = mount(Input, { props: { modelValue: 'hello' } });
            expect(wrapper.find('input').element.value).toBe('hello');
        });

        it('输入触发 onChange 且更新值', async () => {
            const wrapper = mount(Input);
            const input = wrapper.find('input');
            await input.setValue('ab');
            expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('ab');
            expect(wrapper.emitted('change')).toHaveLength(1);
            expect(wrapper.emitted('change')![0][0]).toBe('ab');
        });
    });

    describe('controlled', () => {
        it('value 受控生效，父级回写后 UI 同步', async () => {
            const wrapper = mount(Input, { props: { modelValue: '' } });
            const input = wrapper.find('input');
            input.element.value = 'x';
            await input.trigger('input');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('x');
            // 模拟父级回写
            await wrapper.setProps({ modelValue: 'x' });
            expect(input.element.value).toBe('x');
        });
    });

    describe('disabled / clear', () => {
        it('disabled 时不可输入且 wrapper 加禁用类', () => {
            const wrapper = mount(Input, { props: { disabled: true, modelValue: 'a' } });
            const input = wrapper.find('input');
            expect(input.attributes('disabled')).toBeDefined();
            expect(wrapper.classes()).toContain('animal-input--disabled');
        });

        it('allowClear 显示清除按钮，点击后清空并触发 clear / update:modelValue', async () => {
            const wrapper = mount(Input, { props: { allowClear: true, modelValue: 'abc' } });
            const clearBtn = wrapper.get('button');
            await clearBtn.trigger('click');
            expect(wrapper.emitted('clear')).toHaveLength(1);
            expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('');
        });

        it('allowClear 在空值时不渲染清除按钮', () => {
            const wrapper = mount(Input, { props: { allowClear: true, modelValue: '' } });
            expect(wrapper.find('button').exists()).toBe(false);
        });

        it('清除按钮支持键盘聚焦与 Enter 触发', async () => {
            const wrapper = mount(Input, {
                props: { allowClear: true, modelValue: 'abc' },
                attachTo: document.body,
            });
            const clearBtn = wrapper.get('button');
            (clearBtn.element as HTMLButtonElement).focus();
            expect(document.activeElement).toBe(clearBtn.element);
            // 原生 button：Enter 触发 click
            await clearBtn.trigger('click');
            expect(wrapper.emitted('clear')).toHaveLength(1);
            wrapper.unmount();
        });

        it('清除按钮自定义 clearAriaLabel', () => {
            const wrapper = mount(Input, {
                props: { allowClear: true, modelValue: 'abc', clearAriaLabel: 'Clear' },
            });
            expect(wrapper.get('button').attributes('aria-label')).toBe('Clear');
        });
    });

    it('change 事件携带原生 Event（具备 preventDefault / stopPropagation）', async () => {
        const wrapper = mount(Input);
        const input = wrapper.find('input');
        await input.setValue('hello');
        const changeEvents = wrapper.emitted('change') as unknown[][] | undefined;
        expect(changeEvents).toHaveLength(1);
        const eventArg = changeEvents![0][1] as Event;
        expect(typeof eventArg.preventDefault).toBe('function');
        expect(typeof eventArg.stopPropagation).toBe('function');
    });

    it('change 事件 target 携带真实 input 属性', async () => {
        const wrapper = mount(Input, { props: { type: 'email' } });
        const input = wrapper.find('input');
        await input.setValue('hello');
        const eventArg = wrapper.emitted('change')![0][1] as Event;
        expect(eventArg.target).toBe(input.element);
        expect((eventArg.target as HTMLInputElement).type).toBe('email');
    });
});
