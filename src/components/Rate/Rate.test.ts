import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, defineComponent, h } from 'vue';
import Rate from './Rate.vue';

const ACTIVE = 'animal-rate__item--active';
const POP = 'animal-rate__star--pop';
const SPLASH = 'animal-rate__splash';

const setup = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) => {
    const wrapper = mount(Rate, { props, ...options });
    const inputs = () => wrapper.findAll('input');
    const labels = () => wrapper.findAll('label');
    /** active 类挂在 input 外层的 label 上 */
    const activeCount = () => labels().filter((l) => l.classes(ACTIVE)).length;
    const isChecked = (i: number) => (inputs()[i].element as HTMLInputElement).checked;
    const click = async (i: number) => {
        await inputs()[i].trigger('click');
    };
    return { wrapper, inputs, labels, activeCount, isChecked, click };
};

/** 受控包装：验证组件完全跟随父级 state。 */
const ControlledHost = defineComponent({
    props: { initial: { type: Number, default: 0 } },
    emits: ['change'],
    setup(props, { emit }) {
        const val = ref(props.initial);
        return () =>
            h(Rate, {
                modelValue: val.value,
                'onUpdate:modelValue': (v: number) => {
                    val.value = v;
                },
                onChange: (v: number) => emit('change', v),
            });
    },
});

describe('Rate', () => {
    describe('rendering', () => {
        it('默认渲染 5 颗星且都未选中', () => {
            const { inputs, activeCount } = setup();
            expect(inputs()).toHaveLength(5);
            inputs().forEach((i) => expect((i.element as HTMLInputElement).checked).toBe(false));
            expect(activeCount()).toBe(0);
        });

        it('count 自定义星星数量', () => {
            const { inputs } = setup({ count: 10 });
            expect(inputs()).toHaveLength(10);
        });

        it('defaultValue 点亮前 N 颗星并选中第 N 颗', () => {
            const { activeCount, isChecked } = setup({ defaultValue: 3 });
            expect(activeCount()).toBe(3);
            expect(isChecked(2)).toBe(true);
        });

        it('modelValue 受控点亮前 N 颗星', () => {
            const { activeCount, isChecked } = setup({ modelValue: 4 });
            expect(activeCount()).toBe(4);
            expect(isChecked(3)).toBe(true);
        });

        it('value 受控点亮前 N 颗星（React value 别名）', () => {
            const { activeCount, isChecked } = setup({ value: 4 });
            expect(activeCount()).toBe(4);
            expect(isChecked(3)).toBe(true);
        });

        it('value 超出 count 时夹取选中态，且仍有一颗星可 Tab 到达', () => {
            const { inputs, activeCount, isChecked } = setup({ count: 3, value: 5 });
            expect(activeCount()).toBe(3);
            expect(isChecked(2)).toBe(true);
            expect(inputs().map((i) => i.attributes('tabindex'))).toEqual(['-1', '-1', '0']);
        });

        it('value 为小数时按就近取整（用于展示平均分）', () => {
            const { activeCount, isChecked } = setup({ value: 4.6 });
            expect(activeCount()).toBe(5);
            expect(isChecked(4)).toBe(true);
        });

        it('挂载在 role="radiogroup" 容器中，每颗星都有可访问名称', () => {
            const { wrapper, inputs } = setup({ defaultValue: 2 });
            expect(wrapper.attributes('role')).toBe('radiogroup');
            expect(wrapper.attributes('aria-label')).toBe('评分');
            expect(inputs()[2].attributes('aria-label')).toBe('3 星');
        });

        it('支持自定义 aria-label 覆盖默认值', () => {
            const wrapper = mount(Rate, { attrs: { 'aria-label': '岛屿评分' } });
            expect(wrapper.attributes('aria-label')).toBe('岛屿评分');
        });

        it('应用 class 与 style 到根节点', () => {
            const wrapper = mount(Rate, { attrs: { class: 'my-rate', style: 'margin-top: 8px' } });
            expect(wrapper.classes()).toContain('my-rate');
            expect(wrapper.attributes('style')).toContain('margin-top: 8px');
        });
    });

    describe('尺寸', () => {
        it.each(['small', 'middle', 'large'] as const)('支持 size=%s', (size) => {
            const { wrapper } = setup({ size });
            expect(wrapper.classes()).toContain(`animal-rate--${size}`);
        });
    });

    describe('交互', () => {
        it('点击第 3 颗星触发 change(3) 并点亮前 3 颗', async () => {
            const { wrapper, activeCount, isChecked, click } = setup({ defaultValue: 0 });
            await click(2);
            expect(wrapper.emitted('update:modelValue')![0][0]).toBe(3);
            expect(wrapper.emitted('change')![0][0]).toBe(3);
            expect(activeCount()).toBe(3);
            expect(isChecked(2)).toBe(true);
        });

        it('点击更小的值会熄灭后面的星星', async () => {
            const { wrapper, activeCount, isChecked, click } = setup({ defaultValue: 5 });
            await click(1);
            expect(wrapper.emitted('change')![0][0]).toBe(2);
            expect(activeCount()).toBe(2);
            expect(isChecked(4)).toBe(false);
        });

        it('再次点击同一颗星清空评分（allowClear 默认开启）', async () => {
            const { wrapper, activeCount, click } = setup({ defaultValue: 3 });
            await click(2);
            expect(wrapper.emitted('change')![0][0]).toBe(0);
            expect(activeCount()).toBe(0);
        });

        it('allowClear=false 时再次点击同一颗星不清空', async () => {
            const { wrapper, activeCount, click } = setup({ defaultValue: 3, allowClear: false });
            await click(2);
            expect(wrapper.emitted('change')).toBeUndefined();
            expect(activeCount()).toBe(3);
        });

        it('受控模式只回调 change，显示由父级 state 决定', async () => {
            const wrapper = mount(ControlledHost, { attachTo: document.body });
            const inputs = wrapper.findAll('input');
            const isChecked = (i: number) => (inputs[i].element as HTMLInputElement).checked;

            await inputs[3].trigger('click');
            expect(wrapper.emitted('change')![0][0]).toBe(4);
            expect(isChecked(3)).toBe(true);
            expect(isChecked(4)).toBe(false);

            await inputs[1].trigger('click');
            expect(wrapper.emitted('change')![1][0]).toBe(2);
            expect(isChecked(1)).toBe(true);
            expect(isChecked(3)).toBe(false);
            wrapper.unmount();
        });

        it('受控模式下 value 不变时点击不会自行改动显示', async () => {
            const { activeCount, isChecked, click } = setup({ value: 2 });
            await click(4);
            expect(activeCount()).toBe(2);
            expect(isChecked(1)).toBe(true);
        });
    });

    describe('只读', () => {
        it('readonly 时 input 禁用、容器标记 aria-readonly 且不响应点击', async () => {
            const { wrapper, inputs, activeCount, click } = setup({ defaultValue: 3, readonly: true });
            expect(wrapper.classes()).toContain('animal-rate--readonly');
            expect(wrapper.attributes('aria-readonly')).toBe('true');
            inputs().forEach((i) => expect(i.attributes('disabled')).toBeDefined());

            await click(4);
            expect(wrapper.emitted('change')).toBeUndefined();
            expect(activeCount()).toBe(3);
        });

        it('readonly 时键盘不生效', async () => {
            const { wrapper, click } = setup({ defaultValue: 3, readonly: true });
            await click(2);
            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(wrapper.emitted('change')).toBeUndefined();
        });
    });

    describe('键盘可访问性', () => {
        it('ArrowRight / ArrowUp 加一星', async () => {
            const { wrapper } = setup({ defaultValue: 2 }, { attachTo: document.body });
            const get = () => wrapper.findAll('input');
            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(wrapper.emitted('change')![0][0]).toBe(3);
            expect((get()[2].element as HTMLInputElement).checked).toBe(true);

            await wrapper.trigger('keydown', { key: 'ArrowUp' });
            expect(wrapper.emitted('change')![1][0]).toBe(4);
        });

        it('ArrowLeft / ArrowDown 减一星，最小为 1', async () => {
            const { wrapper } = setup({ defaultValue: 2 }, { attachTo: document.body });
            await wrapper.trigger('keydown', { key: 'ArrowLeft' });
            expect(wrapper.emitted('change')![0][0]).toBe(1);

            // 已到下限 1，再次按 ArrowDown 不应重复提交
            await wrapper.trigger('keydown', { key: 'ArrowDown' });
            expect(wrapper.emitted('change')).toHaveLength(1);
        });

        it('未评分时按方向键从 1 星开始', async () => {
            const { wrapper } = setup({ defaultValue: 0 }, { attachTo: document.body });
            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(wrapper.emitted('change')![0][0]).toBe(1);
        });

        it('Home / End 跳到首尾', async () => {
            const { wrapper } = setup({ count: 10, defaultValue: 5 }, { attachTo: document.body });
            await wrapper.trigger('keydown', { key: 'End' });
            expect(wrapper.emitted('change')![0][0]).toBe(10);

            await wrapper.trigger('keydown', { key: 'Home' });
            expect(wrapper.emitted('change')![1][0]).toBe(1);
        });

        it('受控值为小数时按取整后的星级移动并聚焦', async () => {
            const { wrapper } = setup({ value: 4.6 }, { attachTo: document.body });
            const get = () => wrapper.findAll('input');
            await wrapper.trigger('keydown', { key: 'ArrowLeft' });
            expect(wrapper.emitted('change')![0][0]).toBe(4);
            expect(document.activeElement).toBe(get()[3].element);
        });

        it('受控值超出 count 时方向键仍落在范围内', async () => {
            const { wrapper } = setup({ count: 3, value: 5 }, { attachTo: document.body });
            const get = () => wrapper.findAll('input');
            await wrapper.trigger('keydown', { key: 'ArrowLeft' });
            expect(wrapper.emitted('change')![0][0]).toBe(2);
            expect(document.activeElement).toBe(get()[1].element);
        });

        it('键盘选择时收起悬停预览', async () => {
            const { wrapper, labels, activeCount } = setup({ defaultValue: 2 }, { attachTo: document.body });
            await labels()[4].trigger('mouseenter');
            expect(activeCount()).toBe(5);

            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(activeCount()).toBe(3);
        });

        it('ArrowRight 到最大值后保持不变', async () => {
            const { wrapper } = setup({ defaultValue: 5 }, { attachTo: document.body });
            await wrapper.trigger('keydown', { key: 'ArrowRight' });
            expect(wrapper.emitted('change')).toBeUndefined();
        });

        it('其它按键不改变评分', async () => {
            const { wrapper } = setup({ defaultValue: 3 }, { attachTo: document.body });
            await wrapper.trigger('keydown', { key: 'a' });
            expect(wrapper.emitted('change')).toBeUndefined();
        });

        it('roving tabindex：只有当前选中的星可以 Tab 到达', () => {
            const { inputs } = setup({ defaultValue: 3 });
            expect(inputs().map((i) => i.attributes('tabindex'))).toEqual(['-1', '-1', '0', '-1', '-1']);
        });

        it('未评分时第一颗星是 Tab 落点', () => {
            const { inputs } = setup();
            expect(inputs().map((i) => i.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1']);
        });
    });

    describe('悬停预览', () => {
        it('hover 到第 4 颗预览前 4 颗，移出后恢复真实评分', async () => {
            const { wrapper, labels, activeCount } = setup({ defaultValue: 2 });
            await labels()[3].trigger('mouseenter');
            expect(activeCount()).toBe(4);

            await wrapper.trigger('mouseleave');
            expect(activeCount()).toBe(2);
        });

        it('readonly 时不预览', async () => {
            const { labels, activeCount } = setup({ defaultValue: 2, readonly: true });
            await labels()[4].trigger('mouseenter');
            expect(activeCount()).toBe(2);
        });

        it('点击清空后立即收起预览', async () => {
            const { labels, activeCount, click } = setup({ defaultValue: 3 });
            await labels()[2].trigger('mouseenter');
            await click(2);
            expect(activeCount()).toBe(0);
        });
    });

    describe('选中动画', () => {
        it('加分时按顺序播放 pop 与 splash', async () => {
            const { wrapper, click } = setup();
            await click(2);
            const pops = wrapper.findAll(`.${POP}`);
            expect(pops).toHaveLength(3);
            expect(wrapper.findAll(`.${SPLASH}`)).toHaveLength(1);
            // 动画延迟按点亮顺序递增，形成依次弹出的效果
            const delays = pops.map((el) => (el.element as HTMLElement).style.getPropertyValue('--rate-pop-delay'));
            expect(delays).toEqual(['0ms', '60ms', '120ms']);
        });

        it('减分时不播放动画', async () => {
            const { wrapper, click } = setup({ defaultValue: 4 });
            await click(1);
            expect(wrapper.findAll(`.${POP}`)).toHaveLength(0);
            expect(wrapper.findAll(`.${SPLASH}`)).toHaveLength(0);
        });

        it('清空时不播放动画', async () => {
            const { wrapper, click } = setup({ defaultValue: 3 });
            await click(2);
            expect(wrapper.findAll(`.${POP}`)).toHaveLength(0);
            expect(wrapper.findAll(`.${SPLASH}`)).toHaveLength(0);
        });

        it('重复选中会重新挂载 splash 以重放动画', async () => {
            const { wrapper, click } = setup();
            await click(2);
            const first = wrapper.find(`.${SPLASH}`).element;
            await click(2); // 清空
            await click(2); // 重新选 3 星
            const second = wrapper.find(`.${SPLASH}`).element;
            expect(second).toBeTruthy();
            expect(second).not.toBe(first);
        });
    });
});
