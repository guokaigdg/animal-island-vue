import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Radio from './Radio.vue';
import type { RadioOption } from './types';

const baseOptions: RadioOption[] = [
    { label: 'Apple', value: 'a' },
    { label: 'Banana', value: 'b' },
    { label: 'Cherry', value: 'c', disabled: true },
];

describe('Radio', () => {
    describe('rendering', () => {
        it('渲染所有选项 label 与对应 radio 输入', () => {
            const wrapper = mount(Radio, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            expect(inputs).toHaveLength(baseOptions.length);
            baseOptions.forEach((o) => {
                expect(wrapper.text()).toContain(String(o.label));
            });
        });

        it('挂载在 role="radiogroup" 容器中', () => {
            const wrapper = mount(Radio, { props: { options: baseOptions } });
            expect(wrapper.attributes('role')).toBe('radiogroup');
            expect(wrapper.findAll('input')).toHaveLength(baseOptions.length);
        });

        it('应用 className 与 style 到根节点', () => {
            const wrapper = mount(Radio, {
                props: { options: baseOptions },
                attrs: { class: 'my-radio', style: 'margin-top: 8px;' },
            });
            expect(wrapper.classes()).toContain('my-radio');
            expect(wrapper.attributes('style')).toContain('margin-top: 8px');
        });

        it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
            const wrapper = mount(Radio, { props: { options: baseOptions, size } });
            const labels = wrapper.findAll('.animal-radio');
            expect(labels).toHaveLength(baseOptions.length);
            labels.forEach((l) => expect(l.classes()).toContain(`animal-radio--${size}`));
        });

        it.each(['horizontal', 'vertical'] as const)('支持 direction=%s', (direction) => {
            const wrapper = mount(Radio, { props: { options: baseOptions, direction } });
            expect(wrapper.classes()).toContain(`animal-radio-group--${direction}`);
        });

        it('所有 input 共享同一 name（单选语义）', () => {
            const wrapper = mount(Radio, { props: { options: baseOptions } });
            const names = wrapper.findAll('input').map((i) => i.attributes('name'));
            expect(new Set(names).size).toBe(1);
        });
    });

    describe('uncontrolled 模式', () => {
        it('使用 modelValue 设置初始选中态', () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: 'b' } });
            const inputs = wrapper.findAll('input');
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
            expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
        });

        it('点击选项 → 选中并触发 onChange', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a');
            expect(wrapper.emitted('change')![0][0]).toBe('a');
            // 模拟 v-model 回写
            await wrapper.setProps({ modelValue: 'a' });
            expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
        });

        it('再次点击其他项 → 替换上一选中', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: 'a' } });
            const inputs = wrapper.findAll('input');
            await inputs[1].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('b');
            await wrapper.setProps({ modelValue: 'b' });
            expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        });
    });

    describe('controlled 模式', () => {
        it('modelValue 受控，组件不会自更新', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: '' } });
            const inputs = wrapper.findAll('input');
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a');
            // 父级未回写，UI 保持未选中
            expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        });

        it('父级回写 modelValue 后 UI 同步更新', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: '' } });
            const inputs = wrapper.findAll('input');
            await inputs[1].trigger('change');
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('b');
            await wrapper.setProps({ modelValue: 'b' });
            expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
        });
    });

    describe('disabled 行为', () => {
        it('单选项 disabled：点击不触发 onChange', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions } });
            const inputs = wrapper.findAll('input');
            const cherry = inputs[2];
            expect(cherry.attributes('disabled')).toBeDefined();
            await cherry.trigger('change');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('group 级 disabled：所有项都被禁用', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, disabled: true } });
            const inputs = wrapper.findAll('input');
            inputs.forEach((i) => expect(i.attributes('disabled')).toBeDefined());
            await inputs[0].trigger('change');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            expect(wrapper.classes()).toContain('animal-radio-group--disabled');
        });
    });

    describe('键盘可访问性', () => {
        it('ArrowRight 切换到下一启用项并触发 onChange', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: 'a' } });
            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('b');
            await wrapper.setProps({ modelValue: 'b' });
            expect((wrapper.findAll('input')[1].element as HTMLInputElement).checked).toBe(true);
        });

        it('ArrowLeft 切换到上一启用项', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: 'b' } });
            await wrapper.trigger('keydown', { key: 'ArrowLeft' });
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a');
        });

        it('Home/End 跳到首尾启用项', async () => {
            const wrapper = mount(Radio, { props: { options: baseOptions, modelValue: 'a' } });
            await wrapper.trigger('keydown', { key: 'End' });
            // 'c' 被禁用，End 走 enabledIndices 的最后一个 = 'b'
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe('b');
            await wrapper.trigger('keydown', { key: 'Home' });
            expect(wrapper.emitted('update:modelValue')![1][0]).toBe('a');
        });
    });
});
