import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, defineComponent, ref } from 'vue';
import Select from './Select.vue';
import type { SelectOption } from './types';

const options: SelectOption[] = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
];

const Host = defineComponent({
    props: {
        initial: { type: String, default: '' },
        disabled: { type: Boolean, default: false },
    },
    emits: ['select-change'],
    setup(props, { emit }) {
        const v = ref(props.initial);
        return () =>
            h(Select, {
                options,
                modelValue: v.value,
                disabled: props.disabled,
                'onUpdate:modelValue': (val: string) => {
                    v.value = val;
                },
                onChange: (key: string) => emit('select-change', key),
            });
    },
});

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

// 下拉的 mounted 状态在 requestAnimationFrame 回调中才置为 true，
// 测试里需要 flush 一帧才能拿到 dropdown 节点
const flushRaf = async () => {
    await nextTick();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await nextTick();
};

describe('Select', () => {
    beforeEach(() => {
        mockRect({ top: 200, right: 100, bottom: 250, width: 100, height: 50 });
        mockViewport(2000, 2000);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('未选中时显示 placeholder', () => {
        const wrapper = mount(Select, {
            props: { options, modelValue: '', placeholder: '请选择' },
        });
        expect(wrapper.text()).toContain('请选择');
        wrapper.unmount();
    });

    it('已选中时显示对应 label', () => {
        const wrapper = mount(Select, {
            props: { options, modelValue: 'b' },
        });
        expect(wrapper.text()).toContain('Banana');
        wrapper.unmount();
    });

    it('点击 trigger 展开下拉，再次点击折叠', async () => {
        const wrapper = mount(Select, { props: { options, modelValue: '' } });
        expect(wrapper.text()).not.toContain('Apple');
        const trigger = wrapper.get('.animal-select__trigger');
        await trigger.trigger('click');
        await flushRaf();
        expect(wrapper.html()).toContain('Apple');
        expect(wrapper.html()).toContain('Cherry');
        await trigger.trigger('click');
        await nextTick();
        expect(wrapper.html()).not.toContain('Apple');
        wrapper.unmount();
    });

    it('选择某项 → 触发 update:modelValue 并关闭下拉', async () => {
        const wrapper = mount(Host);
        const trigger = wrapper.get('.animal-select__trigger');
        await trigger.trigger('click');
        await flushRaf();
        const dropdown = wrapper.find('.animal-select__dropdown');
        expect(dropdown.exists()).toBe(true);
        const opts = dropdown.findAll('.animal-select__option');
        const apple = opts.find((o) => o.text().includes('Apple'))!;
        await apple.trigger('click');
        await nextTick();
        const updateEvents = wrapper.findComponent(Select).emitted('update:modelValue');
        expect(updateEvents).toBeTruthy();
        expect(updateEvents![0][0]).toBe('a');
        // 下拉应关闭
        await nextTick();
        expect(wrapper.find('.animal-select__dropdown').exists()).toBe(false);
        wrapper.unmount();
    });

    it('disabled 时点击 trigger 不展开下拉', async () => {
        const wrapper = mount(Host, { props: { disabled: true } });
        const trigger = wrapper.get('.animal-select__trigger');
        await trigger.trigger('click');
        await nextTick();
        expect(wrapper.find('.animal-select__dropdown').exists()).toBe(false);
        expect(trigger.classes()).toContain('animal-select__trigger--disabled');
        wrapper.unmount();
    });

    it('点击外部区域关闭下拉', async () => {
        const Outer = defineComponent({
            setup() {
                return () =>
                    h('div', [
                        h(Select, { options, modelValue: '' }),
                        h('button', { 'data-testid': 'outside' }, 'outside'),
                    ]);
            },
        });
        const wrapper = mount(Outer, { attachTo: document.body });
        const trigger = document.querySelector('.animal-select__trigger') as HTMLElement;
        trigger.click();
        await flushRaf();
        expect(document.querySelector('.animal-select__dropdown')).not.toBeNull();
        // click outside 走 mousedown
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect(document.querySelector('.animal-select__dropdown')).toBeNull();
        wrapper.unmount();
    });

    it('鼠标移入/移出选项 → 切换 hovered 样式', async () => {
        const wrapper = mount(Host);
        const trigger = wrapper.get('.animal-select__trigger');
        await trigger.trigger('click');
        await flushRaf();
        const dropdown = wrapper.find('.animal-select__dropdown');
        expect(dropdown.exists()).toBe(true);
        const banana = dropdown.findAll('.animal-select__option').find((o) => o.text().includes('Banana'))!;
        // 默认未 hover
        expect(banana.classes()).not.toContain('animal-select__option--hovered');
        await banana.trigger('mouseenter');
        expect(banana.classes()).toContain('animal-select__option--hovered');
        await banana.trigger('mouseleave');
        expect(banana.classes()).not.toContain('animal-select__option--hovered');
        wrapper.unmount();
    });

    it('当前选中项带 active 类 + 渲染 highlight', async () => {
        const wrapper = mount(Host, { props: { initial: 'b' } });
        const trigger = wrapper.get('.animal-select__trigger');
        await trigger.trigger('click');
        await flushRaf();
        const dropdown = wrapper.find('.animal-select__dropdown');
        expect(dropdown.exists()).toBe(true);
        const banana = dropdown.findAll('.animal-select__option').find((o) => o.text().includes('Banana'))!;
        expect(banana.classes()).toContain('animal-select__option--active');
        expect(banana.find('.animal-select__highlight').exists()).toBe(true);
        wrapper.unmount();
    });

    describe('定位策略', () => {
        const openAndGetDropdown = async (mountOptions: Record<string, unknown>) => {
            const trigger = document.querySelector('.animal-select__trigger') as HTMLElement;
            trigger.click();
            await flushRaf();
            return document.querySelector('.animal-select__dropdown') as HTMLElement;
        };

        it('右侧空间不足时下拉贴左显示（right=100%）', async () => {
            mockRect({ top: 200, right: 1900, bottom: 250, width: 100, height: 50 });
            mockViewport(2000, 2000);
            const wrapper = mount(Select, { props: { options, modelValue: '' }, attachTo: document.body });
            const dropdown = await openAndGetDropdown({});
            expect(dropdown.style.right).toBe('100%');
            expect(dropdown.style.left).toBe('auto');
            wrapper.unmount();
        });

        it('下方空间不足 + 上方空间更大 → 下拉往上弹（bottom=100%）', async () => {
            // trigger 在视口底部，spaceBelow 极小，spaceAbove 更大
            mockRect({ top: 100, right: 100, bottom: 1995, width: 100, height: 50 });
            mockViewport(2000, 2000);
            const wrapper = mount(Select, { props: { options, modelValue: '' }, attachTo: document.body });
            const dropdown = await openAndGetDropdown({});
            // spaceBelow = 5 < 156, spaceAbove = 100 > 5 → 走 bottom=100%
            expect(dropdown.style.bottom).toBe('100%');
            expect(dropdown.style.top).toBe('auto');
            wrapper.unmount();
        });

        it('trigger 距视口顶部太近 → 强制从下方展开（marginTop=6）', async () => {
            mockRect({ top: 10, right: 100, bottom: 500, width: 100, height: 50 });
            mockViewport(2000, 2000);
            const wrapper = mount(Select, { props: { options, modelValue: '' }, attachTo: document.body });
            const dropdown = await openAndGetDropdown({});
            expect(dropdown.style.top).toBe('100%');
            expect(dropdown.style.marginTop).toBe('6px');
            wrapper.unmount();
        });

        it('空间充足 → 默认垂直居中（top:50% translateY(-50%)）', async () => {
            // beforeEach 已配：trigger 在中段、视口 2000x2000
            const wrapper = mount(Select, { props: { options, modelValue: '' }, attachTo: document.body });
            const dropdown = await openAndGetDropdown({});
            expect(dropdown.style.top).toBe('50%');
            expect(dropdown.style.transform).toBe('translateY(-50%)');
            wrapper.unmount();
        });
    });

    describe('a11y', () => {
        const getTrigger = (): HTMLElement => document.querySelector('.animal-select__trigger') as HTMLElement;

        it('trigger 角色 = combobox + aria-haspopup/listbox + aria-expanded 同步', async () => {
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = getTrigger();
            expect(trigger.getAttribute('role')).toBe('combobox');
            expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            trigger.click();
            await flushRaf();
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
            expect(listbox).not.toBeNull();
            wrapper.unmount();
        });

        it('option 节点带 role=option + aria-selected', async () => {
            const wrapper = mount(Host, { props: { initial: 'b' }, attachTo: document.body });
            getTrigger().click();
            await flushRaf();
            const opts = document.querySelectorAll('[role="option"]');
            expect(opts).toHaveLength(3);
            expect((opts[1] as HTMLElement).getAttribute('aria-selected')).toBe('true');
            expect((opts[0] as HTMLElement).getAttribute('aria-selected')).toBe('false');
            wrapper.unmount();
        });

        it('键盘：闭合时 Enter 打开下拉', async () => {
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = getTrigger();
            trigger.focus();
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await flushRaf();
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            wrapper.unmount();
        });

        it('键盘：ArrowDown / Up 切换 activedescendant，Enter 选中并关闭', async () => {
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = getTrigger();
            trigger.focus();
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await flushRaf();
            // 首次打开 activedescendant 落到首项
            const optsOpen = Array.from(document.querySelectorAll('[role="option"]')) as HTMLElement[];
            expect(trigger.getAttribute('aria-activedescendant')).toBe(optsOpen[0].id);
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            expect(trigger.getAttribute('aria-activedescendant')).toBe(optsOpen[1].id);
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
            expect(trigger.getAttribute('aria-activedescendant')).toBe(optsOpen[0].id);
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await nextTick();
            // 验证 change 事件触发
            const changeEvents = wrapper.findComponent(Select).emitted('change');
            expect(changeEvents).toBeTruthy();
            expect(changeEvents![0][0]).toBe('a');
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            wrapper.unmount();
        });

        it('键盘：Escape 关闭下拉并把焦点交还 trigger', async () => {
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = getTrigger();
            trigger.click();
            await flushRaf();
            await trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await nextTick();
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            expect(document.activeElement).toBe(trigger);
            wrapper.unmount();
        });

        it('aria-label 透传到 trigger 与 listbox', async () => {
            const wrapper = mount(Select, {
                props: { options, modelValue: '', ariaLabel: '水果' },
                attachTo: document.body,
            });
            const trigger = getTrigger();
            expect(trigger.getAttribute('aria-label')).toBe('水果');
            trigger.click();
            await flushRaf();
            const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
            expect(listbox.getAttribute('aria-label')).toBe('水果');
            wrapper.unmount();
        });
    });
});
