import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, defineComponent, ref } from 'vue';
import DatePicker from './DatePicker.vue';

const pad = (n: number) => `${n}`.padStart(2, '0');
const todayStr = () => `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

const mockRect = (overrides: Partial<DOMRect>) => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...overrides,
    } as DOMRect);
};

const mockViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
};

// 面板的 mounted 状态在 requestAnimationFrame 回调中才置为 true，
// 测试里需要 flush 一帧才能拿到完整的动画挂载态
const flushRaf = async () => {
    await nextTick();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await nextTick();
};

/** 等待退场动画结束（面板完全卸载） */
const waitClose = async () => {
    await new Promise<void>((r) => setTimeout(r, 250));
    await nextTick();
};

describe('DatePicker', () => {
    beforeEach(() => {
        mockRect({ top: 200, left: 100, right: 100, bottom: 250, width: 100, height: 50 });
        mockViewport(2000, 2000);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('rendering', () => {
        it('默认渲染：根元素类名 + combobox trigger + placeholder', () => {
            const wrapper = mount(DatePicker);
            expect(wrapper.classes()).toContain('animal-date-picker');
            const trigger = wrapper.get('.animal-date-picker__trigger');
            expect(trigger.attributes('role')).toBe('combobox');
            expect(trigger.attributes('aria-haspopup')).toBe('dialog');
            expect(trigger.attributes('tabindex')).toBe('0');
            expect(wrapper.text()).toContain('请选择日期');
            wrapper.unmount();
        });

        it('v-model 受控值渲染到 trigger', () => {
            const wrapper = mount(DatePicker, { props: { modelValue: '2024-01-15' } });
            expect(wrapper.get('.animal-date-picker__value').text()).toBe('2024-01-15');
            wrapper.unmount();
        });

        it('defaultValue 非受控初值渲染到 trigger', () => {
            const wrapper = mount(DatePicker, { props: { defaultValue: '2024-06-03' } });
            expect(wrapper.get('.animal-date-picker__value').text()).toBe('2024-06-03');
            wrapper.unmount();
        });

        it('透传 class 与 style 到根元素', () => {
            const wrapper = mount(DatePicker, {
                attrs: { class: 'custom-cls', style: 'width: 200px' },
            });
            expect(wrapper.classes()).toContain('custom-cls');
            expect(wrapper.attributes('style')).toContain('width: 200px');
            wrapper.unmount();
        });

        it('ariaLabel 应用到 trigger', () => {
            const wrapper = mount(DatePicker, { props: { ariaLabel: '出生日期' } });
            expect(wrapper.get('.animal-date-picker__trigger').attributes('aria-label')).toBe('出生日期');
            wrapper.unmount();
        });
    });

    describe('size / status', () => {
        it('size=small / large 应用对应类', () => {
            const small = mount(DatePicker, { props: { size: 'small' } });
            expect(small.get('.animal-date-picker__trigger').classes()).toContain(
                'animal-date-picker__trigger--small'
            );
            small.unmount();
            const large = mount(DatePicker, { props: { size: 'large' } });
            expect(large.get('.animal-date-picker__trigger').classes()).toContain(
                'animal-date-picker__trigger--large'
            );
            large.unmount();
        });

        it('默认 size=middle 应用对应类', () => {
            const wrapper = mount(DatePicker);
            expect(wrapper.get('.animal-date-picker__trigger').classes()).toContain(
                'animal-date-picker__trigger--middle'
            );
            wrapper.unmount();
        });

        it('status=error / warning 应用对应类', () => {
            const error = mount(DatePicker, { props: { status: 'error' } });
            expect(error.get('.animal-date-picker__trigger').classes()).toContain(
                'animal-date-picker__trigger--error'
            );
            error.unmount();
            const warning = mount(DatePicker, { props: { status: 'warning' } });
            expect(warning.get('.animal-date-picker__trigger').classes()).toContain(
                'animal-date-picker__trigger--warning'
            );
            warning.unmount();
        });
    });

    describe('open / close', () => {
        it('点击 trigger 展开面板，再次点击折叠', async () => {
            const wrapper = mount(DatePicker);
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            const trigger = wrapper.get('.animal-date-picker__trigger');
            await trigger.trigger('click');
            await flushRaf();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(true);
            expect(wrapper.find('.animal-date-picker__panel--visible').exists()).toBe(true);
            // 展开时触发 update:open
            expect(wrapper.emitted('update:open')![0][0]).toBe(true);
            await trigger.trigger('click');
            await nextTick();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            expect(wrapper.emitted('update:open')![1][0]).toBe(false);
            wrapper.unmount();
        });

        it('点击外部区域关闭面板', async () => {
            const Outer = defineComponent({
                setup() {
                    return () =>
                        h('div', [
                            h(DatePicker),
                            h('button', { 'data-testid': 'outside' }, 'outside'),
                        ]);
                },
            });
            const wrapper = mount(Outer, { attachTo: document.body });
            const trigger = document.querySelector('.animal-date-picker__trigger') as HTMLElement;
            trigger.click();
            await flushRaf();
            expect(document.querySelector('.animal-date-picker__panel')).not.toBeNull();
            document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await waitClose();
            expect(document.querySelector('.animal-date-picker__panel')).toBeNull();
            wrapper.unmount();
        });

        it('下方空间不足时面板向上翻转', async () => {
            mockRect({ top: 100, left: 0, right: 200, bottom: 800, width: 200, height: 40 });
            mockViewport(2000, 300);
            const wrapper = mount(DatePicker);
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            const panel = wrapper.get('.animal-date-picker__panel');
            expect(panel.attributes('style')).toContain('bottom: 100%');
            expect(panel.attributes('style')).toContain('margin-bottom: 6px');
            wrapper.unmount();
        });

        it('右侧空间不足时面板右对齐', async () => {
            mockRect({ top: 100, left: 1750, right: 1950, bottom: 150, width: 200, height: 50 });
            mockViewport(2000, 1000);
            const wrapper = mount(DatePicker);
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            const panel = wrapper.get('.animal-date-picker__panel');
            expect(panel.attributes('style')).toContain('right: 0px');
            expect(panel.attributes('style')).toContain('left: auto');
            wrapper.unmount();
        });
    });

    describe('selection', () => {
        it('选择日期 + 确定 → 触发 update:modelValue 与 change 并关闭', async () => {
            const wrapper = mount(DatePicker, { props: { modelValue: '2024-01-15' } });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            // 点选 2024-01-20（仅设为待选，不触发值更新）
            const day20 = wrapper.get('button[aria-label="2024年1月20日"]');
            await day20.trigger('click');
            await nextTick();
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            // 触发区实时显示待选值
            expect(wrapper.get('.animal-date-picker__value').text()).toBe('2024-01-20');
            // 确定后提交
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toBe('2024-01-20');
            const changes = wrapper.emitted('change')!;
            expect(changes[changes.length - 1][0]).toBe('2024-01-20');
            // 退场动画结束后触发 update:open false（确定即关闭）
            await waitClose();
            expect(wrapper.emitted('update:open')!.at(-1)![0]).toBe(false);
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            wrapper.unmount();
        });

        it('非受控：defaultValue 后选择新日期并确认，trigger 显示新值', async () => {
            const wrapper = mount(DatePicker, { props: { defaultValue: '2024-01-15' } });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年1月20日"]').trigger('click');
            await nextTick();
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await waitClose();
            expect(wrapper.get('.animal-date-picker__value').text()).toBe('2024-01-20');
            wrapper.unmount();
        });

        it('allowClear 渲染清除按钮，点击清空触发 update:modelValue null', async () => {
            const wrapper = mount(DatePicker, {
                props: { modelValue: '2024-01-15', allowClear: true },
            });
            expect(wrapper.find('button[aria-label="清除日期"]').exists()).toBe(true);
            const clearBtn = wrapper.get('button[aria-label="清除日期"]');
            await clearBtn.trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toBeNull();
            const changes = wrapper.emitted('change')!;
            expect(changes[changes.length - 1][0]).toBeNull();
            wrapper.unmount();
        });

        it('allowClear=false 时不渲染清除按钮', () => {
            const wrapper = mount(DatePicker, { props: { modelValue: '2024-01-15' } });
            expect(wrapper.find('button[aria-label="清除日期"]').exists()).toBe(false);
            wrapper.unmount();
        });

        it('今天按钮：点击「今天」+ 确定 → 提交今天的日期', async () => {
            const wrapper = mount(DatePicker);
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            await wrapper.get('.animal-date-picker__today-btn').trigger('click');
            await nextTick();
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toBe(todayStr());
            wrapper.unmount();
        });

        it('showToday=false 不渲染「今天」按钮', async () => {
            const wrapper = mount(DatePicker, { props: { showToday: false } });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            expect(wrapper.find('.animal-date-picker__today-btn').exists()).toBe(false);
            wrapper.unmount();
        });

        it('disabledDate 对应日期渲染为 disabled', async () => {
            const now = new Date();
            const wrapper = mount(DatePicker, {
                props: {
                    disabledDate: (d: Date) => d.getDate() === 15,
                },
            });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            const cell = wrapper.get(`button[aria-label="${now.getFullYear()}年${now.getMonth() + 1}月15日"]`);
            expect(cell.attributes('disabled')).toBeDefined();
            expect(cell.classes()).toContain('animal-date-picker__day-cell--disabled');
            wrapper.unmount();
        });

        it('点击被禁用的日期不会触发待选', async () => {
            const now = new Date();
            const wrapper = mount(DatePicker, {
                props: {
                    disabledDate: (d: Date) => d.getDate() === 15,
                },
            });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            const cell = wrapper.get(`button[aria-label="${now.getFullYear()}年${now.getMonth() + 1}月15日"]`);
            await cell.trigger('click');
            await nextTick();
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            wrapper.unmount();
        });
    });

    describe('range', () => {
        it('range 模式渲染双面板', async () => {
            const wrapper = mount(DatePicker, {
                props: { range: true, modelValue: ['2024-01-01', '2024-01-31'] as [string, string] },
            });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            expect(wrapper.findAll('.animal-date-picker__range-panel')).toHaveLength(2);
            // 双面板显示相邻两个月
            expect(wrapper.text()).toContain('2024年1月');
            expect(wrapper.text()).toContain('2024年2月');
            wrapper.unmount();
        });

        it('range 模式选择开始/结束 + 确定 → 提交 [start, end]', async () => {
            const wrapper = mount(DatePicker, {
                props: { range: true, modelValue: ['2024-01-01', '2024-01-31'] as [string, string] },
            });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年1月10日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年1月15日"]').trigger('click');
            await nextTick();
            // 触发区实时显示开始 | 结束
            const value = wrapper.get('.animal-date-picker__trigger');
            expect(value.text()).toContain('2024-01-10');
            expect(value.text()).toContain('2024-01-15');
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toEqual(['2024-01-10', '2024-01-15']);
            wrapper.unmount();
        });

        it('确认后立即重开面板可重新选择新的日期范围（回归：提交后立即清空 rangeStart/rangeEnd）', async () => {
            const wrapper = mount(DatePicker, {
                props: { range: true, modelValue: ['2024-01-01', '2024-01-31'] as [string, string] },
            });
            const trigger = '.animal-date-picker__trigger';
            const confirm = '.animal-date-picker__confirm-btn';
            // 第一次选择 1月10日 ~ 1月15日 并确定
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年1月10日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年1月15日"]').trigger('click');
            await nextTick();
            await wrapper.get(confirm).trigger('click');
            await nextTick();
            // 不等退场动画（200ms）结束，立即重开面板重新选择
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年2月5日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年2月20日"]').trigger('click');
            await nextTick();
            // 触发区应显示新的选择（旧 rangeStart 不得残留）
            const value = wrapper.get(trigger);
            expect(value.text()).toContain('2024-02-05');
            expect(value.text()).toContain('2024-02-20');
            await wrapper.get(confirm).trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toEqual(['2024-02-05', '2024-02-20']);
            wrapper.unmount();
        });

        it('已选范围重开后，点击新日期应作为新的起始日期（回归）', async () => {
            const wrapper = mount(DatePicker, {
                props: { range: true, modelValue: ['2024-01-01', '2024-01-31'] as [string, string] },
            });
            const trigger = '.animal-date-picker__trigger';
            const confirm = '.animal-date-picker__confirm-btn';
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            // 点击 2月5日 作为新的起始日期：旧起始 2024-01-01 应消失
            await wrapper.get('button[aria-label="2024年2月5日"]').trigger('click');
            await nextTick();
            expect(wrapper.get(trigger).text()).toContain('2024-02-05');
            expect(wrapper.get(trigger).text()).not.toContain('2024-01-01');
            // 点击 2月20日 作为结束并确定
            await wrapper.get('button[aria-label="2024年2月20日"]').trigger('click');
            await nextTick();
            await wrapper.get(confirm).trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toEqual(['2024-02-05', '2024-02-20']);
            wrapper.unmount();
        });

        it('受控 v-model：确认后快速重开面板可重新选择新范围（回归：viewDate 定位到新起点）', async () => {
            const Host = defineComponent({
                components: { DatePicker },
                setup() {
                    const range = ref<[string, string] | null>(['2024-01-01', '2024-01-31']);
                    return { range };
                },
                template: `<DatePicker v-model="range" range />`,
            });
            const wrapper = mount(Host);
            const trigger = '.animal-date-picker__trigger';
            const confirm = '.animal-date-picker__confirm-btn';
            // 第一次：选 2月5日 ~ 2月20日 并确定
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年2月5日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年2月20日"]').trigger('click');
            await nextTick();
            await wrapper.get(confirm).trigger('click');
            // 受控 + 快速重开：不等退场动画（200ms），立即重开面板
            await nextTick();
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            // viewDate 应已定位到新范围起点（2月5日 → 面板显示 2月、3月），3月日期可直接点击
            await wrapper.get('button[aria-label="2024年3月5日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年3月20日"]').trigger('click');
            await nextTick();
            await wrapper.get(confirm).trigger('click');
            await nextTick();
            expect(wrapper.vm.range).toEqual(['2024-03-05', '2024-03-20']);
            wrapper.unmount();
        });

        it('已选完整范围后点击任意日期重新开始选择（重选逻辑优化）', async () => {
            const wrapper = mount(DatePicker, {
                props: { range: true, modelValue: ['2024-01-01', '2024-01-31'] as [string, string] },
            });
            const trigger = '.animal-date-picker__trigger';
            const confirm = '.animal-date-picker__confirm-btn';
            // 打开面板，先选 1月10日 ~ 1月20日（完整范围，未确定）
            await wrapper.get(trigger).trigger('click');
            await flushRaf();
            await wrapper.get('button[aria-label="2024年1月10日"]').trigger('click');
            await nextTick();
            await wrapper.get('button[aria-label="2024年1月20日"]').trigger('click');
            await nextTick();
            expect(wrapper.get(trigger).text()).toContain('2024-01-10');
            expect(wrapper.get(trigger).text()).toContain('2024-01-20');
            // 点击 2月5日：应重新开始选择（旧范围清除，2月5日 为新起点）
            await wrapper.get('button[aria-label="2024年2月5日"]').trigger('click');
            await nextTick();
            const text = wrapper.get(trigger).text();
            expect(text).toContain('2024-02-05');
            expect(text).not.toContain('2024-01-10');
            expect(text).not.toContain('2024-01-20');
            // 点击 2月20日 作为结束并确定
            await wrapper.get('button[aria-label="2024年2月20日"]').trigger('click');
            await nextTick();
            await wrapper.get(confirm).trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toEqual(['2024-02-05', '2024-02-20']);
            wrapper.unmount();
        });
    });

    describe('picker=month', () => {
        it('打开面板直接渲染月份网格，点击月份 + 确定 → 提交 YYYY-MM', async () => {
            const wrapper = mount(DatePicker, { props: { picker: 'month' } });
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await flushRaf();
            const monthCells = wrapper.findAll('.animal-date-picker__month-cell');
            expect(monthCells).toHaveLength(12);
            const may = wrapper.get('button[aria-label="5月"]');
            await may.trigger('click');
            await nextTick();
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toMatch(/^\d{4}-05$/);
            wrapper.unmount();
        });
    });

    describe('keyboard', () => {
        it('Enter 展开面板', async () => {
            const wrapper = mount(DatePicker);
            await wrapper.trigger('keydown', { key: 'Enter' });
            await flushRaf();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(true);
            wrapper.unmount();
        });

        it('ArrowDown / ArrowUp / Space 展开面板', async () => {
            for (const key of ['ArrowDown', 'ArrowUp', ' ']) {
                const wrapper = mount(DatePicker);
                await wrapper.trigger('keydown', { key });
                await flushRaf();
                expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(true);
                wrapper.unmount();
            }
        });

        it('Escape 关闭面板', async () => {
            const wrapper = mount(DatePicker);
            await wrapper.trigger('keydown', { key: 'Enter' });
            await flushRaf();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(true);
            await wrapper.trigger('keydown', { key: 'Escape' });
            await waitClose();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            wrapper.unmount();
        });

        it('Enter 确认当前聚焦日期', async () => {
            const wrapper = mount(DatePicker, { props: { modelValue: '2024-01-15' } });
            await wrapper.trigger('keydown', { key: 'Enter' });
            await flushRaf();
            // 焦点落在选中日期 2024-01-15 上
            await wrapper.trigger('keydown', { key: 'Enter' });
            await nextTick();
            await wrapper.get('.animal-date-picker__confirm-btn').trigger('click');
            await nextTick();
            const updates = wrapper.emitted('update:modelValue')!;
            expect(updates[updates.length - 1][0]).toBe('2024-01-15');
            wrapper.unmount();
        });

        it('disabled 时键盘不展开面板', async () => {
            const wrapper = mount(DatePicker, { props: { disabled: true } });
            await wrapper.trigger('keydown', { key: 'Enter' });
            await nextTick();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            wrapper.unmount();
        });
    });

    describe('disabled', () => {
        it('disabled 应用禁用类，点击不展开', async () => {
            const wrapper = mount(DatePicker, { props: { disabled: true } });
            expect(wrapper.classes()).toContain('animal-date-picker--disabled');
            expect(wrapper.get('.animal-date-picker__trigger').attributes('tabindex')).toBe('-1');
            await wrapper.get('.animal-date-picker__trigger').trigger('click');
            await nextTick();
            expect(wrapper.find('.animal-date-picker__panel').exists()).toBe(false);
            wrapper.unmount();
        });
    });
});
