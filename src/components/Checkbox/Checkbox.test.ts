import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Checkbox from './Checkbox.vue';
import type { CheckboxOption } from './types';

const baseOptions: CheckboxOption[] = [
    { label: 'Apple', value: 'a' },
    { label: 'Banana', value: 'b' },
    { label: 'Cherry', value: 'c', disabled: true },
];

describe('Checkbox', () => {
    describe('rendering', () => {
        it('渲染所有选项的 label 与对应 checkbox 输入', () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            expect(inputs).toHaveLength(baseOptions.length);
            baseOptions.forEach((o) => {
                expect(wrapper.text()).toContain(String(o.label));
            });
        });

        it('挂载在 role="group" 容器中以保证可访问性', () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions } });
            expect(wrapper.attributes('role')).toBe('group');
            expect(wrapper.findAll('input')).toHaveLength(baseOptions.length);
        });

        it('应用 className 与 style 到根节点', () => {
            const wrapper = mount(Checkbox, {
                props: { options: baseOptions },
                attrs: { class: 'my-cbx', style: 'margin-top: 8px;' },
            });
            expect(wrapper.classes()).toContain('my-cbx');
            expect(wrapper.attributes('style')).toContain('margin-top: 8px');
        });

        it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, size } });
            const labels = wrapper.findAll('.animal-checkbox');
            expect(labels).toHaveLength(baseOptions.length);
            labels.forEach((l) => expect(l.classes()).toContain(`animal-checkbox--${size}`));
        });

        it.each(['horizontal', 'vertical'] as const)('支持 direction=%s', (direction) => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, direction } });
            expect(wrapper.classes()).toContain(`animal-checkbox-group--${direction}`);
        });
    });

    describe('uncontrolled 模式', () => {
        it('使用 modelValue 设置初始选中态', () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, modelValue: ['a'] } });
            const inputs = wrapper.findAll('input');
            expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
            expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
            expect((inputs[2].element as HTMLInputElement).checked).toBe(false);
        });

        it('点击未选中项 → 添加到选中集合并触发 onChange', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, modelValue: ['a'] } });
            const inputs = wrapper.findAll('input');
            await inputs[1].trigger('change');
            expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a', 'b']);
            await wrapper.setProps({ modelValue: ['a', 'b'] });
            expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
        });

        it('点击已选中项 → 从集合中移除', async () => {
            const wrapper = mount(Checkbox, {
                props: { options: baseOptions, modelValue: ['a', 'b'] },
            });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['b']);
            await wrapper.setProps({ modelValue: ['b'] });
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        });

        it('modelValue 为空时也能正常切换', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
        });
    });

    describe('controlled 模式', () => {
        it('modelValue 为受控值，组件不会自更新', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, modelValue: [] } });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
            // 父级未回写，UI 必须保持未选中
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        });

        it('父级回写 modelValue 后 UI 同步更新', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, modelValue: [] } });
            const inputs = wrapper.findAll('input');

            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
            await wrapper.setProps({ modelValue: ['a'] });
            expect((inputs[0].element as HTMLInputElement).checked).toBe(true);

            await inputs[1].trigger('change');
            expect(wrapper.emitted('update:modelValue')![1][0]).toEqual(['a', 'b']);
            await wrapper.setProps({ modelValue: ['a', 'b'] });
            expect((inputs[1].element as HTMLInputElement).checked).toBe(true);

            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![2][0]).toEqual(['b']);
            await wrapper.setProps({ modelValue: ['b'] });
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        });
    });

    describe('disabled 行为', () => {
        it('单选项 disabled：点击不触发 onChange，且 input 不可交互', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            const cherry = inputs[2];
            expect(cherry.attributes('disabled')).toBeDefined();
            await cherry.trigger('change');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('group 级 disabled：所有项都被禁用且回调不触发', async () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions, disabled: true } });
            const inputs = wrapper.findAll('input');
            inputs.forEach((i) => expect(i.attributes('disabled')).toBeDefined());
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            expect(wrapper.classes()).toContain('animal-checkbox-group--disabled');
        });

        it('group 级 disabled 优先级高于 option.disabled=false', async () => {
            const wrapper = mount(Checkbox, {
                props: {
                    options: [{ label: 'Solo', value: 's' }],
                    disabled: true,
                },
            });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });
    });

    describe('键盘可访问性', () => {
        it('Tab 可聚焦到 input；Space 触发切换', async () => {
            const wrapper = mount(Checkbox, {
                props: { options: baseOptions },
                attachTo: document.body,
            });
            const inputs = wrapper.findAll('input');
            const first = inputs[0];
            (first.element as HTMLInputElement).focus();
            expect(document.activeElement).toBe(first.element);
            await first.trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
            wrapper.unmount();
        });
    });

    describe('value 类型兼容', () => {
        it('支持 number 类型 value', async () => {
            const wrapper = mount(Checkbox, {
                props: {
                    options: [
                        { label: 'One', value: 1 },
                        { label: 'Two', value: 2 },
                    ],
                    modelValue: [1],
                },
            });
            const inputs = wrapper.findAll('input');
            expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
            await inputs[1].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([1, 2]);
        });
    });

    describe('a11y / 受控契约', () => {
        it('label 嵌套 input（隐式 for/id 关联）保证 a11y', () => {
            const wrapper = mount(Checkbox, { props: { options: baseOptions } });
            // 每个 input 必须位于一个 <label> 内部（隐式关联）
            const labels = wrapper.findAll('label');
            expect(labels).toHaveLength(baseOptions.length);
            labels.forEach((label) => {
                const input = label.find('input');
                expect(input.exists()).toBe(true);
            });
        });

        it('受控模式下父级不更新 modelValue 时 UI 不会自动变更', async () => {
            const wrapper = mount(Checkbox, {
                props: { options: baseOptions, modelValue: [] },
            });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            // 父级未回写新 modelValue
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
            expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
        });
    });
});
