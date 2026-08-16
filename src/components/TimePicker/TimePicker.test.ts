import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import TimePicker from './TimePicker.vue';

/** 等待一帧（面板挂载 / 列表居中依赖 requestAnimationFrame） */
const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 20));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 打开面板并等待挂载 */
async function openPanel(wrapper: ReturnType<typeof mount>) {
    await wrapper.get('[role="combobox"]').trigger('click');
    await nextFrame();
}

describe('TimePicker', () => {
    describe('渲染', () => {
        it('默认渲染 placeholder 与 combobox 角色', () => {
            const wrapper = mount(TimePicker);
            const combobox = wrapper.get('[role="combobox"]');
            expect(combobox.attributes('aria-haspopup')).toBe('dialog');
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('请选择时间');
            expect(wrapper.find('.animal-time-picker__value--placeholder').exists()).toBe(true);
        });

        it('显示 modelValue 格式化后的时间', () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('10:20:30');
            expect(wrapper.find('.animal-time-picker__value--placeholder').exists()).toBe(false);
        });

        it('支持 className 与 style 透传', () => {
            const wrapper = mount(TimePicker, {
                attrs: { class: 'custom-class', style: 'width: 320px' },
            });
            expect(wrapper.classes()).toContain('custom-class');
            expect(wrapper.attributes('style')).toContain('width: 320px');
        });

        it('支持自定义 placeholder', () => {
            const wrapper = mount(TimePicker, { props: { placeholder: '自定义占位' } });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('自定义占位');
        });
    });

    describe('v-model 受控', () => {
        it('受控 modelValue 随 prop 更新', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('10:20:30');
            await wrapper.setProps({ modelValue: '23:59:59' });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('23:59:59');
        });

        it('v-model 双向绑定：确认后更新父级值', async () => {
            const Host = defineComponent({
                components: { TimePicker },
                data: () => ({ value: null as string | null }),
                template: `<TimePicker v-model="value" />`,
            });
            const wrapper = mount(Host);
            await openPanel(wrapper);
            await wrapper.find('[aria-label="15 分"]').trigger('click');
            await wrapper.find('.animal-time-picker__confirm-btn').trigger('click');
            expect((wrapper.vm as { value: string | null }).value).toBe('00:15:00');
        });

        it('defaultValue 作为非受控初值', () => {
            const wrapper = mount(TimePicker, { props: { defaultValue: '08:30:00' } });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('08:30:00');
        });

        it('format 支持 HH:mm 与单字母占位符', () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '09:05:06', format: 'H:mm' } });
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('9:05');
        });
    });

    describe('size', () => {
        it('size=small / middle / large 应用对应触发区类', () => {
            for (const size of ['small', 'middle', 'large'] as const) {
                const wrapper = mount(TimePicker, { props: { size } });
                expect(wrapper.find(`.animal-time-picker__trigger--${size}`).exists()).toBe(true);
            }
        });

        it('默认使用 middle', () => {
            const wrapper = mount(TimePicker);
            expect(wrapper.find('.animal-time-picker__trigger--middle').exists()).toBe(true);
        });
    });

    describe('面板交互', () => {
        it('点击触发区展开面板并触发 update:open', async () => {
            const wrapper = mount(TimePicker);
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(false);
            await wrapper.get('[role="combobox"]').trigger('click');
            await nextFrame();
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(true);
            expect(wrapper.find('.animal-time-picker__panel--visible').exists()).toBe(true);
            expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('true');
            expect(wrapper.emitted('update:open')).toEqual([[true]]);
        });

        it('format 不含 ss 时面板无秒列且收窄宽度', async () => {
            const wrapper = mount(TimePicker, { props: { format: 'HH:mm' } });
            await openPanel(wrapper);
            expect(wrapper.find('.animal-time-picker__panel--no-seconds').exists()).toBe(true);
            expect(wrapper.find('[aria-label="0 秒"]').exists()).toBe(false);
        });

        it('hourStep / minuteStep 过滤选项', async () => {
            const wrapper = mount(TimePicker, { props: { hourStep: 6, minuteStep: 15 } });
            await openPanel(wrapper);
            expect(wrapper.find('[aria-label="6 时"]').exists()).toBe(true);
            expect(wrapper.find('[aria-label="7 时"]').exists()).toBe(false);
            expect(wrapper.find('[aria-label="15 分"]').exists()).toBe(true);
            expect(wrapper.find('[aria-label="16 分"]').exists()).toBe(false);
        });
    });

    describe('选择与提交', () => {
        it('选择时/分实时更新待选时间（pending）', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            await openPanel(wrapper);
            await wrapper.find('[aria-label="12 时"]').trigger('click');
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('12:20:30');
            expect(wrapper.find('[aria-label="12 时"]').classes()).toContain(
                'animal-time-picker__option--selected'
            );
            await wrapper.find('[aria-label="45 分"]').trigger('click');
            expect(wrapper.find('.animal-time-picker__trigger').text()).toContain('12:45:30');
            expect(wrapper.find('[aria-label="45 分"]').classes()).toContain(
                'animal-time-picker__option--selected'
            );
        });

        it('点击确定提交 update:modelValue 与 change', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            await openPanel(wrapper);
            await wrapper.find('[aria-label="15 分"]').trigger('click');
            await wrapper.find('.animal-time-picker__confirm-btn').trigger('click');
            expect(wrapper.emitted('update:modelValue')).toEqual([['10:15:30']]);
            expect(wrapper.emitted('change')).toEqual([['10:15:30']]);
        });

        it('值未变化时确定不触发提交', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            await openPanel(wrapper);
            await wrapper.find('.animal-time-picker__confirm-btn').trigger('click');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            expect(wrapper.emitted('change')).toBeUndefined();
        });

        it('点击此刻将待选时间设为当前时间，确定后提交', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            await openPanel(wrapper);
            await wrapper.find('.animal-time-picker__footer-btn').trigger('click');
            const shown = wrapper.find('.animal-time-picker__trigger').text();
            expect(shown).toMatch(/^(\d{2}):(\d{2}):(\d{2})$/);
            await wrapper.find('.animal-time-picker__confirm-btn').trigger('click');
            const emitted = wrapper.emitted('update:modelValue');
            expect(emitted).toBeTruthy();
            const value = emitted![emitted!.length - 1][0] as string;
            expect(value).toMatch(/^(\d{2}):(\d{2}):(\d{2})$/);
            // 与当前时间误差不超过 3 秒
            const now = new Date();
            const [vh, vm, vs] = value.split(':').map(Number);
            const diff = Math.abs(
                vh * 3600 + vm * 60 + vs - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds())
            );
            expect(diff <= 3).toBe(true);
        });
    });

    describe('clear 清空', () => {
        it('allowClear 且有值时渲染清除按钮，点击清空并提交 null', async () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30', allowClear: true } });
            await wrapper.get('.animal-time-picker__clear').trigger('click');
            expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
            expect(wrapper.emitted('change')).toEqual([[null]]);
        });

        it('未设置 allowClear 时不渲染清除按钮', () => {
            const wrapper = mount(TimePicker, { props: { modelValue: '10:20:30' } });
            expect(wrapper.find('.animal-time-picker__clear').exists()).toBe(false);
        });

        it('无值时即使 allowClear 也不渲染清除按钮', () => {
            const wrapper = mount(TimePicker, { props: { allowClear: true } });
            expect(wrapper.find('.animal-time-picker__clear').exists()).toBe(false);
        });
    });

    describe('disabled', () => {
        it('disabled 应用禁用类、tabindex=-1 且不可展开', async () => {
            const wrapper = mount(TimePicker, { props: { disabled: true } });
            expect(wrapper.find('.animal-time-picker--disabled').exists()).toBe(true);
            expect(wrapper.get('[role="combobox"]').attributes('tabindex')).toBe('-1');
            await wrapper.get('[role="combobox"]').trigger('click');
            await nextFrame();
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(false);
        });
    });

    describe('键盘', () => {
        it('Enter 展开面板', async () => {
            const wrapper = mount(TimePicker);
            await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Enter' });
            await nextFrame();
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(true);
            expect(wrapper.emitted('update:open')).toEqual([[true]]);
        });

        it('ESC 关闭面板', async () => {
            const wrapper = mount(TimePicker);
            await openPanel(wrapper);
            await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Escape' });
            await wait(250);
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(false);
        });
    });

    describe('点击外部关闭', () => {
        it('mousedown 在面板外关闭', async () => {
            const wrapper = mount(TimePicker);
            await openPanel(wrapper);
            document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await wait(250);
            expect(wrapper.find('.animal-time-picker__panel').exists()).toBe(false);
        });
    });
});
